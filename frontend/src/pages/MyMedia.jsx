import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Scissors, FileVideo, Clapperboard, FileImage, FileText, Package, X } from 'lucide-react';
import AssetCard from '../components/AssetCard';
import streamboatIcon from '../assets/streamboat.svg';
import axiosInstance from '../lib/axiosInstance';
import toast from 'react-hot-toast';

const TABS = ['All Media', 'Video', 'Image', 'Document', 'Upload'];

export default function MyMedia() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Media');
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      let url = '/user/media';
      if (activeTab !== 'All Media') {
        url += `?type=${activeTab.toLowerCase()}`;
      }
      const { data } = await axiosInstance.get(url);
      setAssets(data.assets);
    } catch (error) {
      toast.error('Failed to load your media');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      await axiosInstance.delete(`/user/media/${id}`);
      toast.success('Asset deleted successfully');
      setAssets(prev => prev.filter(asset => asset._id !== id));
      if (selectedAsset?._id === id) setSelectedAsset(null);
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const getThumbnailUrl = (asset) => {
    if (asset.thumbnailUrl) return asset.thumbnailUrl;
    
    // Generate thumbnail URL from fileUrl
    const urlParts = asset.fileUrl.split('/upload/');
    if (urlParts.length === 2) {
      const publicIdWithExt = urlParts[1];
      const basePublicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      
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

  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'video': return FileVideo;
      case 'image': return FileImage;
      case 'document': return FileText;
      case 'package': return Package;
      default: return FileText;
    }
  };

  const handleAssetClick = (asset) => {
    navigate(`/media/${asset._id}`);
  };

  const handleShare = async (asset) => {
    const url = `${window.location.origin}/media/${asset._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto relative">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">My Media</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab 
                  ? 'bg-sb-primary text-black' 
                  : 'bg-sb-surface border border-sb-border text-sb-text-muted hover:text-sb-text hover:border-sb-primary/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
           <p className="text-sb-text-muted animate-pulse font-bold tracking-widest text-sm uppercase">Loading Your Uploads...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-sb-text-muted">
           <Package className="w-12 h-12 mb-4 opacity-50" />
           <p>No media found. Go upload something!</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] gap-6 pb-12"
        >
          {assets.map((asset) => (
            <motion.div
              key={asset._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <AssetCard 
                title={asset.title}
                subtitle={new Date(asset.createdAt).toLocaleDateString()}
                imageUrl={getThumbnailUrl(asset)}
                badgeText={asset.type.toUpperCase()}
                badgeIcon={getIconForType(asset.type)}
                onClick={() => handleAssetClick(asset)}
                onShare={() => handleShare(asset)}
                onDelete={() => handleDelete(asset._id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Asset Preview Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <div className="absolute top-6 right-6 z-50">
              <button 
                onClick={() => setSelectedAsset(null)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors text-white"
              >
                 <X className="w-6 h-6" />
              </button>
            </div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-[80vh] flex flex-col justify-center items-center rounded-2xl overflow-hidden shadow-2xl"
            >
              {selectedAsset.type.toLowerCase() === 'video' ? (
                <video 
                  src={selectedAsset.fileUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain bg-black rounded-lg"
                />
              ) : (
                <img 
                  src={selectedAsset.fileUrl} 
                  alt={selectedAsset.title} 
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Info */}
      <footer className="h-20 w-full max-w-[1400px] mx-auto border-t border-sb-border/50 flex items-center justify-between px-8 md:px-16 text-xs text-sb-text-muted z-10 mt-12">
        <div className="flex items-center gap-4">
          <img src={streamboatIcon} alt="Logo" className="w-8 h-8 opacity-50" />
          <span>© 2026 Streamboat. ALL RIGHTS RESERVED.</span>
        </div>
        <div className="flex gap-6 hidden md:flex">
          <a href="#" className="hover:text-sb-text transition-colors uppercase tracking-wider">Privacy Policy</a>
          <a href="#" className="hover:text-sb-text transition-colors uppercase tracking-wider">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}