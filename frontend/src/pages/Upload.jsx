import { useState } from 'react';
import { Upload as UploadIcon, Info, FolderUp, Check, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Upload() {
  const [watermark, setWatermark] = useState(false);
  const [geoblock, setGeoblock] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Ingest Source</h1>
        <div className="flex items-center text-xs tracking-widest text-sb-purple font-bold uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-sb-purple mr-2 animate-pulse" />
          Secure connection established. Ready for high-bandwidth transfer.
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Dropzone */}
        <div 
          className={cn(
            "flex-1 relative rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 min-h-[500px]",
            isDragging 
              ? "border-sb-primary bg-sb-primary/5" 
              : "border-sb-border bg-sb-surface/30 hover:bg-sb-surface hover:border-sb-border/80"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
        >
          {/* Abstract bg lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sb-primary rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sb-purple rounded-full blur-[100px]" />
          </div>

          <div className="z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-sb-surface flex items-center justify-center border border-sb-border mb-6">
              <UploadIcon className="w-8 h-8 text-sb-text" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Drag & Drop Encrypted Payload</h2>
            <p className="text-sm text-sb-text-muted max-w-md mb-8">
              Select a file from your local vault or drop it here to begin secure ingestion.
            </p>
            <button className="bg-sb-surface border border-sb-border hover:border-sb-text transition-colors px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2">
              <FolderUp className="w-4 h-4" /> BROWSE LOCAL VAULT
            </button>
          </div>

          <div className="absolute bottom-6 left-6 text-[10px] text-sb-text-muted font-bold tracking-wider uppercase">
            SUPPORTED FORMATS: .MP4, .MKV, .PRORES
          </div>
          <div className="absolute bottom-6 right-6 text-[10px] text-sb-primary font-bold tracking-wider uppercase flex items-center gap-1">
            <Check className="w-3 h-3" /> MAX FILE SIZE: 50GB
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          {/* Metadata Card */}
          <div className="bg-sb-surface rounded-2xl p-6 border border-sb-border relative overflow-hidden">
             {/* Left accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
            
            <div className="flex items-center gap-2 text-xs font-bold text-blue-500 mb-6 uppercase tracking-wider">
              <Info className="w-4 h-4" /> METADATA CONFIGURATION
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-sb-text-muted mb-2">Asset Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Operation: Sentinel"
                  className="w-full bg-[#111113] border border-transparent rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-sb-border transition-colors text-sb-text placeholder:text-sb-text-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sb-text-muted mb-2">Description / Manifest</label>
                <textarea 
                  placeholder="Enter secure payload details..."
                  rows={4}
                  className="w-full bg-[#111113] border border-transparent rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-sb-border transition-colors text-sb-text placeholder:text-sb-text-muted resize-none"
                />
              </div>
            </div>
          </div>

          {/* DRM Card */}
          <div className="bg-sb-surface rounded-2xl p-6 border border-sb-border relative overflow-hidden">
            {/* Left accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-sb-purple" />
            
            <div className="flex items-center gap-2 text-xs font-bold text-sb-purple mb-6 uppercase tracking-wider">
              <Shield className="w-4 h-4" /> DRM PROTECTION
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold mb-1">Forensic Watermarking</div>
                  <div className="text-[10px] text-sb-text-muted">Embed invisible user-specific tracking data.</div>
                </div>
                <button 
                  onClick={() => setWatermark(!watermark)}
                  className={cn("w-12 h-6 rounded-full transition-colors relative", watermark ? "bg-sb-purple" : "bg-sb-border")}
                >
                  <div className={cn("absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform", watermark ? "translate-x-6" : "")} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold mb-1">Strict Geo-blocking</div>
                  <div className="text-[10px] text-sb-text-muted">Restrict access by IP geographical location.</div>
                </div>
                <button 
                  onClick={() => setGeoblock(!geoblock)}
                  className={cn("w-12 h-6 rounded-full transition-colors relative flex items-center p-1", geoblock ? "bg-sb-purple" : "bg-sb-border")}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform flex items-center justify-center", geoblock ? "translate-x-6" : "")}>
                    {geoblock && <Check className="w-3 h-3 text-sb-purple" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button className="w-full bg-gradient-to-r from-sb-primary to-[#00f2fe] text-black font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:scale-[1.02] transform duration-200">
              <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M12 2L2 22l10-3 10 3L12 2z"/></svg>
              Initialize Ingest Sequence
            </button>
            <div className="text-center mt-4 text-[10px] text-sb-text-muted font-bold tracking-widest uppercase">
              End-to-End Encryption Active
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
