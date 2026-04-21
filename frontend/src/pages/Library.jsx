import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileVideo, FileImage, FileText, Package } from 'lucide-react';
import AssetCard from '../components/AssetCard';
import streamboatIcon from '../assets/streamboat.svg';
import axiosInstance from '../lib/axiosInstance';
import toast from 'react-hot-toast';

const TABS = ['All Assets', 'Video', 'Image', 'Document', 'Package'];

export default function Library() {
  const [activeTab, setActiveTab] = useState('All Assets');
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        let url = '/assets';
        if (activeTab !== 'All Assets') {
          url += `?type=${activeTab.toLowerCase()}`;
        }
        const { data } = await axiosInstance.get(url);
        setAssets(data.assets);
      } catch (error) {
        toast.error('Failed to load library assets');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, [activeTab]);

  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'video': return FileVideo;
      case 'image': return FileImage;
      case 'document': return FileText;
      case 'package': return Package;
      default: return FileText;
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">Library</h1>
        
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
           <p className="text-sb-text-muted animate-pulse font-bold tracking-widest text-sm uppercase">Loading Database Assets...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-sb-text-muted">
           <Package className="w-12 h-12 mb-4 opacity-50" />
           <p>No assets found.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 auto-rows-[280px] gap-6 pb-12"
        >
          {assets.map((asset, index) => {
            // Restore beautiful layout variety
            let structureClass = "md:col-span-1 md:row-span-1";
            if (index === 0) structureClass = "md:col-span-2 md:row-span-2";
            else if (index === 3) structureClass = "md:col-span-2 md:row-span-1";
            else if (index === 6) structureClass = "md:col-span-2 md:row-span-2";
            else if (index === 7) structureClass = "xl:col-span-2 md:row-span-1";

            return (
              <motion.div
                key={asset._id || index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={structureClass}
              >
                <AssetCard 
                  title={asset.title}
                  subtitle={asset.owner_id ? `${asset.owner_id.firstName} ${asset.owner_id.lastName}` : 'Unknown'}
                  imageUrl={asset.thumbnailUrl || asset.fileUrl}
                  badgeText={asset.type.toUpperCase()}
                  badgeIcon={getIconForType(asset.type)}
                  className="w-full h-full" 
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}

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
