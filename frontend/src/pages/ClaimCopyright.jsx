import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, CheckCircle2, ScanFace, FileText, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ClaimCopyright() {
  const [progress, setProgress] = useState(65);
  const [isScanning, setIsScanning] = useState(true);

  // Simulate progress
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            return 100;
          }
          return p + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-10">
        <div className="flex items-center text-[10px] tracking-widest text-sb-purple font-bold uppercase mb-4">
          <ScanFace className="w-4 h-4 mr-2" /> AUTOMATED INFRINGEMENT DETECTION
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          Claim Copyright.<br/>
          <span className="text-sb-text-muted">Secure your assets.</span>
        </h1>
        <p className="text-sm text-sb-text-muted max-w-xl leading-relaxed">
          Upload your source file. Our Sentinel AI will autonomously analyze structural metadata, visual fingerprints, and audio signatures to identify and neutralize unauthorized distribution across global networks. No manual claims required.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Upload Box */}
        <div className="flex-1 bg-sb-surface/50 border border-dashed border-sb-border rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] hover:border-sb-border/80 transition-colors">
          <div className="w-16 h-16 rounded-full bg-sb-surface flex items-center justify-center border border-sb-border mb-6">
            <UploadIcon className="w-6 h-6 text-sb-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Drop video file here</h2>
          <p className="text-[10px] tracking-widest text-sb-text-muted font-bold uppercase mb-8">
            OR CLICK TO BROWSE LOCAL STORAGE
          </p>
          <div className="flex gap-2">
            {['MP4', 'MOV', 'MKV'].map(ext => (
              <span key={ext} className="px-3 py-1 bg-[#111113] rounded text-[10px] font-bold text-sb-text-muted border border-sb-border">
                {ext}
              </span>
            ))}
          </div>
        </div>

        {/* Progress Box */}
        <div className="w-full lg:w-[450px] bg-sb-surface border border-sb-border rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-[10px] font-bold text-sb-primary tracking-widest uppercase">
              SCANNING PROGRESS
            </div>
            <Activity className="w-4 h-4 text-sb-primary animate-pulse" />
          </div>

          <div className="space-y-8 relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-4 bottom-8 w-px bg-sb-border" />

            {/* Step 1 */}
            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-sb-bg border border-sb-border flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-sb-text" />
              </div>
              <div>
                <div className="font-bold text-sm mb-1 text-white">File Uploaded</div>
                <div className="text-[10px] text-sb-text-muted uppercase tracking-widest">
                  INGESTED SUCCESSFULLY. HASH: 8F6A2C...
                </div>
              </div>
            </div>

            {/* Step 2 (Active) */}
            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-sb-bg border border-sb-purple flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(157,78,221,0.3)]">
                <ScanFace className="w-4 h-4 text-sb-purple" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm mb-1 text-white">AI Infringement Analysis</div>
                {/* Progress Bar Container */}
                <div className="w-full mt-3 mb-2 h-1.5 bg-sb-bg rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-sb-primary to-sb-purple rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-sb-purple font-bold uppercase tracking-widest">
                    DEEP SCANNING NETWORKS...
                  </div>
                  <div className="text-[10px] text-sb-text-muted font-bold">
                    {Math.floor(progress)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 relative z-10 opacity-50">
              <div className="w-8 h-8 rounded-full bg-sb-bg border border-sb-border flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-sb-text-muted" />
              </div>
              <div>
                <div className="font-bold text-sm mb-1 text-white">Finalizing Report</div>
                <div className="text-[10px] text-sb-text-muted uppercase tracking-widest">
                  AWAITING ANALYSIS COMPLETION
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-10 bg-[#111113] hover:bg-sb-surface-hover border border-sb-border transition-colors py-3.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-sb-purple uppercase tracking-wider">
            <FileText className="w-4 h-4" /> View Live Logs
          </button>
        </div>
      </div>
    </div>
  );
}
