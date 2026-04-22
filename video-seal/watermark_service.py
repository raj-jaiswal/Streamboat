"""
VideoSeal Watermarking Service
Run: uvicorn watermark_service:app --host 0.0.0.0 --port 8000

Expects env vars:
  CLOUDINARY_CLOUD_NAME
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET
"""

import os
import uuid
import logging
import tempfile
import subprocess
from enum import Enum
from typing import Optional
from concurrent.futures import ThreadPoolExecutor

import cv2
import numpy as np
import ffmpeg
import torch
import httpx
import cloudinary
import cloudinary.uploader
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

from videoseal.models import Videoseal
from videoseal.utils.cfg import setup_model_from_model_card
from videoseal.evals.metrics import bit_accuracy

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Cloudinary config
# ──────────────────────────────────────────────
cloudinary.config(
    cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
    api_key=os.environ["CLOUDINARY_API_KEY"],
    api_secret=os.environ["CLOUDINARY_API_SECRET"],
)

# ──────────────────────────────────────────────
# Model — loaded once at startup
# ──────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
log.info(f"Loading VideoSeal model on {DEVICE} ...")
model: Videoseal = setup_model_from_model_card("videoseal")
model = model.eval().to(DEVICE)
model.compile()
model.step_size = 8
log.info("Model ready.")

# ──────────────────────────────────────────────
# In-memory job store  (swap for Redis in prod)
# ──────────────────────────────────────────────
class JobStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    DONE      = "done"
    FAILED    = "failed"

jobs: dict[str, dict] = {}          # job_id -> job dict
executor = ThreadPoolExecutor(max_workers=2)

# ──────────────────────────────────────────────
# Schemas
# ──────────────────────────────────────────────
class WatermarkRequest(BaseModel):
    video_url: str
    asset_id: Optional[str] = None
    user_id: Optional[str] = None
    chunk_size: int = 16
    crf: int = 23

class WatermarkResponse(BaseModel):
    job_id: str
    status: JobStatus

class StatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    user_id: Optional[str]
    asset_id: Optional[str]
    watermarked_url: Optional[str]
    message_bits: Optional[str]
    bit_accuracy: Optional[float]
    error: Optional[str]

# ──────────────────────────────────────────────
# VideoSeal helpers
# ──────────────────────────────────────────────
def _get_video_info(path: str) -> dict:
    cap = cv2.VideoCapture(path)
    info = {
        "width":      int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "height":     int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        "fps":        cap.get(cv2.CAP_PROP_FPS),
        "num_frames": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
    }
    cap.release()
    return info


def _embed_clip(clip: np.ndarray, msgs: torch.Tensor) -> np.ndarray:
    t = torch.tensor(clip, dtype=torch.float32).permute(0, 3, 1, 2) / 255.0
    out = model.embed(t, msgs=msgs, is_video=True, lowres_attenuation=True)
    return (out["imgs_w"] * 255.0).byte().permute(0, 2, 3, 1).numpy()


def _detect_clip(clip: np.ndarray) -> torch.Tensor:
    t = torch.tensor(clip, dtype=torch.float32).permute(0, 3, 1, 2) / 255.0
    out = model.detect(t, is_video=True)
    return out["preds"][:, 1:]


def _embed_video(input_path: str, output_path: str, chunk_size: int, crf: int) -> torch.Tensor:
    info     = _get_video_info(input_path)
    w, h     = info["width"], info["height"]
    fps      = float(info["fps"])
    n_frames = info["num_frames"]

    p_in = (
        ffmpeg.input(input_path)
        .output("pipe:", format="rawvideo", pix_fmt="rgb24", s=f"{w}x{h}", r=fps)
        .run_async(pipe_stdout=True, pipe_stderr=subprocess.PIPE)
    )
    p_out = (
        ffmpeg.input("pipe:", format="rawvideo", pix_fmt="rgb24", s=f"{w}x{h}", r=fps)
        .output(output_path, vcodec="libx264", pix_fmt="yuv420p", r=fps, crf=crf)
        .overwrite_output()
        .run_async(pipe_stdin=True, pipe_stderr=subprocess.PIPE)
    )

    msgs        = model.get_random_msg()
    frame_size  = w * h * 3
    chunk       = np.zeros((chunk_size, h, w, 3), dtype=np.uint8)
    frame_count = 0

    while True:
        raw = p_in.stdout.read(frame_size)
        if not raw:
            break
        chunk[frame_count % chunk_size] = np.frombuffer(raw, np.uint8).reshape(h, w, 3)
        frame_count += 1
        if frame_count % chunk_size == 0:
            p_out.stdin.write(_embed_clip(chunk, msgs).tobytes())

    p_in.stdout.close()
    p_out.stdin.close()
    p_in.wait()
    p_out.wait()
    return msgs


def _detect_video(input_path: str, n_frames: int, chunk_size: int) -> torch.Tensor:
    info = _get_video_info(input_path)
    w, h = info["width"], info["height"]

    p_in = (
        ffmpeg.input(input_path)
        .output("pipe:", format="rawvideo", pix_fmt="rgb24")
        .run_async(pipe_stdout=True, pipe_stderr=subprocess.PIPE)
    )

    frame_size  = w * h * 3
    chunk       = np.zeros((chunk_size, h, w, 3), dtype=np.uint8)
    frame_count = 0
    soft_msgs   = []

    while frame_count < n_frames:
        raw = p_in.stdout.read(frame_size)
        if not raw:
            break
        chunk[frame_count % chunk_size] = np.frombuffer(raw, np.uint8).reshape(h, w, 3)
        frame_count += 1
        if frame_count % chunk_size == 0:
            soft_msgs.append(_detect_clip(chunk))

    p_in.stdout.close()
    p_in.wait()

    soft = torch.cat(soft_msgs, dim=0).mean(dim=0)
    return soft

# ──────────────────────────────────────────────
# Background job
# ──────────────────────────────────────────────
def _run_job(job_id: str, req: WatermarkRequest):
    jobs[job_id]["status"] = JobStatus.RUNNING
    try:
        with tempfile.TemporaryDirectory() as tmp:
            src_path = os.path.join(tmp, "input.mp4")
            dst_path = os.path.join(tmp, "output.mp4")

            # 1. Download the source video
            log.info(f"[{job_id}] Downloading {req.video_url}")
            with httpx.Client(follow_redirects=True, timeout=120) as client:
                r = client.get(req.video_url)
                r.raise_for_status()
                with open(src_path, "wb") as f:
                    f.write(r.content)

            # 2. Embed watermark
            log.info(f"[{job_id}] Embedding watermark ...")
            msgs_ori = _embed_video(src_path, dst_path, req.chunk_size, req.crf)

            # 3. Quick self-check (first 32 frames)
            log.info(f"[{job_id}] Verifying ...")
            soft = _detect_video(dst_path, n_frames=32, chunk_size=req.chunk_size)
            acc  = bit_accuracy(soft, msgs_ori).item() * 100

            # 4. Upload watermarked video to Cloudinary
            log.info(f"[{job_id}] Uploading to Cloudinary ...")
            result = cloudinary.uploader.upload(
                dst_path,
                resource_type="video",
                folder="watermarked",
                public_id=f"wm_{job_id}",
            )

            bits = "".join([str(b.item()) for b in msgs_ori[0]])
            jobs[job_id].update({
                "status":          JobStatus.DONE,
                "watermarked_url": result["secure_url"],
                "message_bits":    bits,
                "bit_accuracy":    round(acc, 2),
            })
            log.info(f"[{job_id}] Done — {acc:.1f}% bit accuracy")

    except Exception as e:
        log.exception(f"[{job_id}] Failed")
        jobs[job_id]["status"] = JobStatus.FAILED
        jobs[job_id]["error"]  = str(e)

# ──────────────────────────────────────────────
# FastAPI app
# ──────────────────────────────────────────────
app = FastAPI(title="VideoSeal Watermarking Service")

@app.post("/watermark", response_model=WatermarkResponse, status_code=202)
async def start_watermark(req: WatermarkRequest, background_tasks: BackgroundTasks):
    """
    Kick off a watermarking job.
    Returns a job_id immediately; poll /status/{job_id} for progress.
    """
    job_id = f"{req.user_id}_{uuid.uuid4()}" if req.user_id else str(uuid.uuid4())
    jobs[job_id] = {
        "status":          JobStatus.PENDING,
        "user_id":         req.user_id,
        "asset_id":        req.asset_id,
        "watermarked_url": None,
        "message_bits":    None,
        "bit_accuracy":    None,
        "error":           None,
    }
    # Run in thread pool so the event loop isn't blocked
    background_tasks.add_task(executor.submit, _run_job, job_id, req)
    return WatermarkResponse(job_id=job_id, status=JobStatus.PENDING)


@app.get("/status/{job_id}", response_model=StatusResponse)
async def get_status(job_id: str):
    """Poll this endpoint to check job progress."""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return StatusResponse(job_id=job_id, **job)


@app.get("/health")
async def health():
    return {"ok": True, "device": str(DEVICE)}