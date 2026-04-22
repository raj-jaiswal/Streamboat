import { useState, useRef } from 'react';
import { Upload as UploadIcon, Info, FolderUp, Check, Shield, Globe, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import axiosInstance from '../lib/axiosInstance';
import toast from 'react-hot-toast';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [watermark, setWatermark] = useState(false);
  const [geoblock, setGeoblock] = useState(true);
  const [isPrivate, setIsPrivate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const determineFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['mp4', 'mov', 'mkv'].includes(ext)) return 'video';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'document';
    return 'upload'; // generic
  };

  const handleStartUpload = async () => {
    if (!file) return toast.error('Please select a file to upload');
    if (!title) return toast.error('Please provide a title');

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading to Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 1. Upload to Cloudinary via Backend
      const uploadRes = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { url, public_id, size } = uploadRes.data;

      toast.loading('Saving metadata...', { id: loadingToast });

      // 2. Save Metadata
      await axiosInstance.post('/upload/metadata', {
        title,
        description,
        type: determineFileType(file.name),
        fileUrl: url,
        visibility: isPrivate ? 'private' : 'public',
        is_watermarked: watermark,
        geo_blocked_countries: geoblock ? ['RU', 'CN'] : [], // Mocking restricted countries
        fileSize: size || file.size
      });

      toast.success('Upload complete!', { id: loadingToast });
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed', { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Upload Media</h1>
        <div className="flex items-center text-xs tracking-widest text-sb-purple font-bold uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-sb-purple mr-2 animate-pulse" />
          Securely upload your files to the platform.
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
          onDrop={handleDrop}
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
            {file ? (
              <>
                 <h2 className="text-2xl font-bold mb-3 text-sb-primary">{file.name}</h2>
                 <p className="text-sm text-sb-text-muted max-w-md mb-8">
                   {(file.size / 1024 / 1024).toFixed(2)} MB ready for upload.
                 </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-3">Drag & Drop Your File</h2>
                <p className="text-sm text-sb-text-muted max-w-md mb-8">
                  Select a file from your computer or drop it here to begin uploading.
                </p>
              </>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept=".mp4,.png,.jpg,.jpeg,.pdf,.mov,.mkv"
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="bg-sb-surface border border-sb-border hover:border-sb-text transition-colors px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2"
            >
              <FolderUp className="w-4 h-4" /> BROWSE FILES
            </button>
          </div>

          <div className="absolute bottom-6 left-6 text-[10px] text-sb-text-muted font-bold tracking-wider uppercase">
            SUPPORTED FORMATS: .mp4, .png, .jpg, .jpeg, .pdf
          </div>
          <div className="absolute bottom-6 right-6 text-[10px] text-sb-primary font-bold tracking-wider uppercase flex items-center gap-1">
            <Check className="w-3 h-3" /> MAX FILE SIZE: 100MBs
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          {/* Metadata Card */}
          <div className="bg-sb-surface rounded-2xl p-6 border border-sb-border relative overflow-hidden">
             {/* Left accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
            
            <div className="flex items-center gap-2 text-xs font-bold text-blue-500 mb-6 uppercase tracking-wider">
              <Info className="w-4 h-4" /> FILE DETAILS
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-sb-text-muted mb-2">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., My Awesome Video"
                  className="w-full bg-[#111113] border border-transparent rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-sb-border transition-colors text-sb-text placeholder:text-sb-text-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sb-text-muted mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter file details..."
                  rows={4}
                  className="w-full bg-[#111113] border border-transparent rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-sb-border transition-colors text-sb-text placeholder:text-sb-text-muted resize-none"
                />
              </div>
            </div>
          </div>

          {/* Security & Settings Card */}
          <div className="bg-sb-surface rounded-2xl p-6 border border-sb-border relative overflow-hidden">
            {/* Left accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-sb-purple" />
            
            <div className="flex items-center gap-2 text-xs font-bold text-sb-purple mb-6 uppercase tracking-wider">
              <Shield className="w-4 h-4" /> SECURITY & VISIBILITY
            </div>

            <div className="space-y-6">
              {/* Visibility Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold mb-1 flex items-center gap-2">
                    {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    File Visibility
                  </div>
                  <div className="text-[10px] text-sb-text-muted">
                    {isPrivate ? "Private: Only you can view this file." : "Public: Anyone with the link can view."}
                  </div>
                </div>
                <button 
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={cn("w-12 h-6 rounded-full transition-colors relative flex items-center p-1", isPrivate ? "bg-sb-purple" : "bg-sb-border")}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform flex items-center justify-center", isPrivate ? "translate-x-6" : "")}>
                    {isPrivate && <Check className="w-3 h-3 text-sb-purple" />}
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold mb-1">Watermarking</div>
                  <div className="text-[10px] text-sb-text-muted">Add invisible watermarks.</div>
                </div>
                <button 
                  onClick={() => setWatermark(!watermark)}
                  className={cn("w-12 h-6 rounded-full transition-colors relative flex items-center p-1", watermark ? "bg-sb-purple" : "bg-sb-border")}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform flex items-center justify-center", watermark ? "translate-x-6" : "")}>
                    {watermark && <Check className="w-3 h-3 text-sb-purple" />}
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold mb-1">Geo-blocking</div>
                  <div className="text-[10px] text-sb-text-muted">Restrict access countries.</div>
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
            <button 
              onClick={handleStartUpload}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-sb-primary to-[#00f2fe] text-black font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:scale-[1.02] transform duration-200 disabled:opacity-50"
            >
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M12 2L2 22l10-3 10 3L12 2z"/></svg>
                  Start Upload
                </>
              )}
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