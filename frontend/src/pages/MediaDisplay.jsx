import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, FileVideo, FileImage, FileText, Package, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../lib/axiosInstance';
import toast from 'react-hot-toast';

export default function MediaDisplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // PDF specific states
  const [pdfPages, setPdfPages] = useState([1]);
  const [isPdfLoading, setIsPdfLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const { data } = await axiosInstance.get(`/assets/${id}`);
        setAsset(data.asset);
      } catch (error) {
        toast.error('Failed to load media');
        navigate('/library');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAsset();
    }
  }, [id, navigate]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) return;

    try {
      await axiosInstance.delete(`/user/media/${asset._id}`);
      toast.success('Media deleted successfully');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  const getThumbnailUrl = (asset) => {
    if (asset.thumbnailUrl) return asset.thumbnailUrl;
    
    const urlParts = asset.fileUrl.split('/upload/');
    if (urlParts.length === 2) {
      if (asset.type === 'document') {
        return asset.fileUrl.replace('/upload/', '/upload/w_300,h_300,c_fill,pg_1,f_jpg/').replace(/\.[^/.]+$/, '.jpg');
      } else if (asset.type === 'video') {
        return asset.fileUrl.replace('/upload/', '/upload/w_300,h_300,c_fill,f_jpg/').replace(/\.[^/.]+$/, '.jpg');
      } else if (asset.type === 'image') {
        return asset.fileUrl.replace('/upload/', '/upload/w_300,h_300,c_fill/');
      }
    }
    return asset.fileUrl;
  };

  // Helper to generate URLs for specific pages of a PDF
  const getPdfPageUrl = (url, pageNumber) => {
    const urlParts = url.split('/upload/');
    if (urlParts.length === 2) {
      // w_1200 ensures crisp reading quality, c_limit ensures we don't upscale small docs
      return url
        .replace('/upload/', `/upload/w_1200,c_limit,pg_${pageNumber},f_jpg/`)
        .replace(/\.[^/.]+$/, '.jpg');
    }
    return url;
  };

  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'video': return FileVideo;
      case 'image': return FileImage;
      case 'document': return FileText;
      case 'package': return Package;
      default: return FileText;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-sb-text-muted animate-pulse font-bold tracking-widest text-sm uppercase">
          Loading Media...
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-sb-text-muted">Media not found</div>
      </div>
    );
  }

  const type = asset.type?.toLowerCase();
  const IconComponent = getIconForType(type);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-sb-surface border border-sb-border rounded-full hover:border-sb-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{asset.title}</h1>
            <div className="flex items-center gap-2 text-sm text-sb-text-muted mt-1">
              <IconComponent className="w-4 h-4" />
              {asset.type.toUpperCase()}
              {asset.owner_id && (
                <>
                  <span>•</span>
                  <span>{asset.owner_id.firstName} {asset.owner_id.lastName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-3 bg-sb-surface border border-sb-border rounded-full hover:border-sb-primary transition-colors flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Share</span>
          </button>
          {user && asset.owner_id && asset.owner_id._id === user._id && (
            <button
              onClick={handleDelete}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 hover:border-red-500/40 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
              <span className="hidden sm:inline text-sm font-medium text-red-400">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Media Display */}
      <div 
        className="bg-sb-surface rounded-2xl border border-sb-border overflow-hidden select-none" 
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="p-8 flex justify-center">
          {type === 'video' && (
            <video 
              src={asset.fileUrl} 
              controls 
              className="w-full max-h-[70vh] object-contain rounded-lg"
              poster={getThumbnailUrl(asset)}
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            />
          )}

          {type === 'image' && (
            <img 
              src={asset.fileUrl} 
              alt={asset.title} 
              className="w-full max-h-[70vh] object-contain rounded-lg"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          )}

          {type === 'document' && (
            <div className="w-full bg-[#1e1e1e] rounded-xl overflow-y-auto max-h-[75vh] flex flex-col items-center gap-6 p-6">
              {isPdfLoading && pdfPages.length === 1 && (
                <div className="flex flex-col items-center justify-center h-64 text-sb-text-muted">
                  <FileText className="w-12 h-12 mb-4 opacity-50 animate-pulse" />
                  <div className="animate-pulse font-bold tracking-widest text-sm uppercase">Rendering Pages...</div>
                </div>
              )}
              
              {pdfPages.map((pageNum) => (
                <img
                  key={pageNum}
                  src={getPdfPageUrl(asset.fileUrl, pageNum)}
                  alt={`Page ${pageNum}`}
                  className={`w-full max-w-4xl bg-white shadow-xl object-contain ${
                    isPdfLoading && pageNum === 1 ? 'hidden' : 'block'
                  }`}
                  onLoad={() => {
                    // Turn off loading spinner once page 1 renders
                    if (pageNum === 1) setIsPdfLoading(false);
                    // Automatically append the next page number to state to trigger fetching it
                    if (pageNum === pdfPages.length) {
                      setPdfPages(prev => [...prev, pageNum + 1]);
                    }
                  }}
                  onError={(e) => {
                    // 404 hit: this page doesn't exist, we've reached the end of the PDF
                    e.target.style.display = 'none';
                    setPdfPages(prev => prev.filter(p => p !== pageNum));
                    if (pageNum === 1) setIsPdfLoading(false);
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              ))}
            </div>
          )}

          {type === 'package' && (
            <div className="flex flex-col items-center justify-center py-16 w-full">
              <Package className="w-16 h-16 mb-4 text-sb-text-muted" />
              <h3 className="text-xl font-bold mb-2">Package File</h3>
              <p className="text-sb-text-muted mb-6 text-center max-w-md">
                This is a package file. Direct viewing and downloads are disabled.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {asset.description && (
        <div className="mt-8 bg-sb-surface rounded-2xl border border-sb-border p-6">
          <h3 className="text-lg font-bold mb-3">Description</h3>
          <p className="text-sb-text-muted">{asset.description}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-sb-surface rounded-2xl border border-sb-border p-6">
          <div className="text-sm text-sb-text-muted mb-1">File Size</div>
          <div className="text-lg font-bold">
            {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
        <div className="bg-sb-surface rounded-2xl border border-sb-border p-6">
          <div className="text-sm text-sb-text-muted mb-1">Upload Date</div>
          <div className="text-lg font-bold">
            {new Date(asset.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="bg-sb-surface rounded-2xl border border-sb-border p-6">
          <div className="text-sm text-sb-text-muted mb-1">Visibility</div>
          <div className="text-lg font-bold capitalize">
            {asset.visibility}
          </div>
        </div>
      </div>
    </div>
  );
}