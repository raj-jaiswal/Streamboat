import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, CheckCircle2, ScanFace, FileText, Activity, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import axiosInstance from '../lib/axiosInstance';
import toast from 'react-hot-toast';

export default function ClaimCopyright() {
  const [claim, setClaim] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      startClaimProcess(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startClaimProcess(e.dataTransfer.files[0]);
    }
  };

  const startClaimProcess = async (file) => {
    setIsUploading(true);
    const loadingToast = toast.loading('Uploading file to cloud for scanning...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { url } = uploadRes.data;

      toast.loading('Submitting claim...', { id: loadingToast });

      const claimRes = await axiosInstance.post('/copyright/claim', {
        fileName: file.name,
        fileUrl: url
      });
      const _claim = claimRes.data;
      setClaim(_claim);

      await axiosInstance.post('/copyright/scan', { claimId: _claim._id });

      toast.success('Scan initiated successfully', { id: loadingToast });
      setIsScanning(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start claim process', { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    let interval;
    if (isScanning && claim && claim._id) {
      interval = setInterval(async () => {
        try {
          const { data } = await axiosInstance.get(`/copyright/claim/${claim._id}`);
          setClaim(data);
          
          if (data.status === 'Completed' || data.status === 'Failed') {
            setIsScanning(false);
            clearInterval(interval);
            if (data.status === 'Completed') toast.success('Scan Complete!');
            if (data.status === 'Failed') toast.error('Scan Failed!');
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isScanning, claim?._id]);

  const viewLogs = async () => {
    if (!claim) return;
    try {
      const { data } = await axiosInstance.get(`/copyright/claim/${claim._id}/logs`);
      toast((t) => (
        <div>
           <b>Latest Log:</b><br/>{data[data.length-1]?.message}
        </div>
      ), { duration: 4000 });
    } catch(e) {}
  };

  // ─── Adapted Thumbnail Logic from Library.jsx ─────────────────────────────────
  const getThumbnailUrl = (url, type) => {
    if (!url) return '';
    const urlParts = url.split('/upload/');
    
    if (urlParts.length === 2) {
      // For the list view, we use w_150, h_150 to keep it lightweight
      if (type === 'document' || type === 'pdf' || type === 'raw') {
        return url.replace('/upload/', '/upload/w_150,h_150,c_fill,pg_1,f_jpg/').replace(/\.[^/.]+$/, '.jpg');
      } else if (type === 'video') {
        return url.replace('/upload/', '/upload/w_150,h_150,c_fill,f_jpg/').replace(/\.[^/.]+$/, '.jpg');
      } else { // default to image treatment
        return url.replace('/upload/', '/upload/w_150,h_150,c_fill/');
      }
    }
    return url;
  };

  const progress = claim?.progress || 0;
  const status = claim?.status || 'Waiting';

  const isUploaded = ['Uploaded', 'AI_Analysis', 'Finalizing_Report', 'Completed', 'Failed'].includes(status);
  const isAIAnalysis = ['AI_Analysis', 'Finalizing_Report', 'Completed'].includes(status);
  const isFinalizing = ['Finalizing_Report', 'Completed'].includes(status);

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
        
        {/* ================= LEFT PANE (Upload + Results) ================= */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Upload Box */}
          <div 
            className={cn(
               "bg-sb-surface/50 border border-dashed border-sb-border rounded-2xl p-12 flex flex-col items-center justify-center min-h-[300px] hover:border-sb-border/80 transition-colors cursor-pointer",
               isUploading && "opacity-50 pointer-events-none"
            )}
            onClick={() => !isScanning && !isUploading && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 rounded-full bg-sb-surface flex items-center justify-center border border-sb-border mb-6">
              <UploadIcon className="w-6 h-6 text-sb-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">
               {isUploading ? 'Uploading...' : (isScanning ? 'Scan in progress...' : 'Drop media file here')}
            </h2>
            <p className="text-[10px] tracking-widest text-sb-text-muted font-bold uppercase mb-8">
              {isUploading || isScanning ? 'PLEASE WAIT' : 'OR CLICK TO BROWSE LOCAL STORAGE'}
            </p>
            <div className="flex gap-2">
              {['MP4', 'MOV', 'MKV', 'JPG', 'PNG', 'PDF'].map(ext => (
                <span key={ext} className="px-3 py-1 bg-[#111113] rounded text-[10px] font-bold text-sb-text-muted border border-sb-border">
                  {ext}
                </span>
              ))}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept=".mp4,.mov,.mkv,.jpg,.jpeg,.png,.pdf"
            />
          </div>

          {/* Analysis Results */}
          <AnimatePresence>
            {claim?.status === 'Completed' && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                className="p-8 bg-sb-surface border border-sb-border rounded-2xl overflow-hidden"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-sb-purple" />
                  Vector Analysis Results
                </h3>

                {claim.matches && claim.matches.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-red-400 font-medium mb-4 pb-4 border-b border-white/10">
                      Warning: Potential infringements detected with high visual/structural similarity across the network.
                    </p>
                    {claim.matches.map((match, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-white/5 hover:border-sb-purple/30 transition-colors">
                        
                        {/* 🚨 THE NEW THUMBNAIL BLOCK 🚨 */}
                        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-sb-bg border border-sb-border flex items-center justify-center relative group">
                           {match.url ? (
                             <img 
                               src={getThumbnailUrl(match.url, match.type)} 
                               alt={match.title} 
                               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                               onError={(e) => {
                                 e.target.style.display = 'none';
                                 e.target.nextSibling.style.display = 'flex';
                               }}
                             />
                           ) : null}
                           {/* Fallback icon if image fails to load */}
                           <div className="absolute inset-0 flex items-center justify-center text-sb-text-muted" style={{ display: match.url ? 'none' : 'flex' }}>
                             <ImageIcon className="w-6 h-6 opacity-50" />
                           </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 pr-4 min-w-0">
                          <div className="font-bold text-base mb-1 truncate text-white">{match.title}</div>
                          <div className="text-xs text-sb-text-muted truncate max-w-sm">
                            Source: <a href={match.url} target="_blank" rel="noreferrer" className="text-sb-primary hover:underline">{match.url}</a>
                          </div>
                        </div>

                        {/* Match Score */}
                        <div className="text-right border-l border-white/10 pl-6 shrink-0">
                          <div className="text-2xl text-sb-purple font-black">{match.similarity}%</div>
                          <div className="text-[10px] uppercase tracking-widest text-sb-text-muted mt-1">Match Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-black/20 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3 opacity-80" />
                    <div className="font-bold text-green-400 text-lg">Network Clear</div>
                    <p className="text-sm text-sb-text-muted mt-2">No matches found above 85% similarity. Your asset appears globally unique.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= RIGHT PANE (Progress Track) ================= */}
        <div className="w-full lg:w-[450px] shrink-0 bg-sb-surface border border-sb-border rounded-2xl p-8 h-fit">
          <div className="flex items-center justify-between mb-8">
             <div className="text-[10px] font-bold text-sb-primary tracking-widest uppercase">
              SCANNING PROGRESS
            </div>
            {isScanning && <Activity className="w-4 h-4 text-sb-primary animate-pulse" />}
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-4 top-4 bottom-8 w-px bg-sb-border" />

            <div className={cn("flex gap-4 relative z-10 transition-opacity", !isUploaded && !isUploading ? 'opacity-30' : '')}>
              <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center shrink-0", isUploaded ? "bg-sb-bg border-sb-border" : "border-sb-border")}>
                {isUploaded && <CheckCircle2 className="w-4 h-4 text-sb-text" />}
                 {!isUploaded && <div className="w-2 h-2 rounded-full bg-sb-text-muted" />}
              </div>
              <div>
                <div className="font-bold text-sm mb-1 text-white">File Uploaded</div>
                <div className="text-[10px] text-sb-text-muted uppercase tracking-widest">
                  {isUploaded ? `INGESTED: ${claim?.fileName}` : 'WAITING FOR FILE'}
                </div>
              </div>
            </div>

            <div className={cn("flex gap-4 relative z-10", !isAIAnalysis ? 'opacity-30' : '')}>
              <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center shrink-0", 
                 isAIAnalysis && !isFinalizing ? "bg-sb-bg border-sb-purple shadow-[0_0_10px_rgba(157,78,221,0.3)]" : "bg-sb-bg border-sb-border"
              )}>
                 {isAIAnalysis && !isFinalizing ? <ScanFace className="w-4 h-4 text-sb-purple" /> : (
                    isFinalizing ? <CheckCircle2 className="w-4 h-4 text-sb-text" /> : <div className="w-2 h-2 rounded-full bg-sb-text-muted" />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm mb-1 text-white">AI Infringement Analysis</div>
                <div className="w-full mt-3 mb-2 h-1.5 bg-sb-bg rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-sb-primary to-sb-purple rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-sb-purple font-bold uppercase tracking-widest w-40 truncate">
                    {claim && claim.logs.length > 0 ? claim.logs[claim.logs.length-1].message : 'WAITING...'}
                  </div>
                  <div className="text-[10px] text-sb-text-muted font-bold ml-2">
                    {Math.floor(progress)}%
                  </div>
                </div>
              </div>
            </div>

            <div className={cn("flex gap-4 relative z-10", !isFinalizing ? "opacity-30" : "")}>
              <div className="w-8 h-8 rounded-full bg-sb-bg border border-sb-border flex items-center justify-center shrink-0">
                 {status === 'Completed' ? <CheckCircle2 className="w-4 h-4 text-sb-text" /> : <div className="w-2 h-2 rounded-full bg-sb-text-muted" />}
              </div>
              <div>
                <div className="font-bold text-sm mb-1 text-white">Finalizing Report</div>
                <div className="text-[10px] text-sb-text-muted uppercase tracking-widest">
                  {status === 'Completed' ? 'REPORT GENERATED' : 'AWAITING ANALYSIS COMPLETION'}
                </div>
              </div>
            </div>
          </div>

          <button 
             onClick={viewLogs}
             disabled={!claim}
             className="w-full mt-10 bg-[#111113] hover:bg-sb-surface-hover border border-sb-border transition-colors py-3.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-sb-purple uppercase tracking-wider disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> View Live Logs
          </button>
          
          {status === 'Completed' && claim?.reportUrl && (
             <a href={claim.reportUrl} target="_blank" rel="noreferrer" className="w-full mt-2 bg-sb-primary/10 hover:bg-sb-primary/20 text-sb-primary border border-sb-primary/50 transition-colors py-3.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-center">
                Download Report
             </a>
          )}
        </div>
      </div>
    </div>
  );
}