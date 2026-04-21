import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileVideo, FileImage, FileText, Package } from 'lucide-react';
import AssetCard from '../components/AssetCard';

const MOCK_ASSETS = [
  {
    id: 1,
    title: 'Project Sentinel: Final Cut',
    subtitle: ['24:00:00', '120 GB', 'Encrypted Vault Alpha'],
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200',
    badgeText: '4K PRORES',
    badgeIcon: FileVideo,
    type: 'video',
    className: 'md:col-span-2 md:row-span-2'
  },
  {
    id: 2,
    title: 'Environment Concept Beta',
    subtitle: 'Modified 2h ago',
    imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=600',
    badgeText: 'RAW',
    badgeIcon: FileImage,
    type: 'image',
    className: 'md:col-span-1 md:row-span-1'
  },
  {
    id: 3,
    title: 'Security Protocol V2.4',
    subtitle: 'Confidential - Eyes Only',
    imageUrl: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=600',
    badgeText: 'PDF',
    badgeIcon: FileText,
    type: 'document',
    className: 'md:col-span-1 md:row-span-1 bg-sb-surface border border-sb-border', // No image for doc
  },
  {
    id: 4,
    title: 'Archival Footage 1984',
    subtitle: ['00:45:12', '2.4 GB'],
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600',
    badgeText: 'MP4',
    badgeIcon: FileVideo,
    type: 'video',
    className: 'md:col-span-1 md:row-span-1'
  },
  {
    id: 5,
    title: 'Neon Cyber Grid Textures',
    subtitle: 'High-resolution diffuse, normal, and displacement maps for Section 4 environments.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    badgeText: 'ASSET PACK',
    badgeIcon: Package,
    type: 'package',
    className: 'md:col-span-2 md:row-span-1'
  }
];

const TABS = ['All Assets', 'Video', 'Images', 'Documents'];

export default function Library() {
  const [activeTab, setActiveTab] = useState('All Assets');

  const filteredAssets = MOCK_ASSETS.filter(asset => {
    if (activeTab === 'All Assets') return true;
    if (activeTab === 'Video') return asset.type === 'video';
    if (activeTab === 'Images') return asset.type === 'image';
    if (activeTab === 'Documents') return asset.type === 'document' || asset.type === 'package';
    return true;
  });

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

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] gap-6 pb-12"
      >
        {filteredAssets.map(asset => (
          <motion.div
            key={asset.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={asset.className}
          >
            <AssetCard {...asset} className="w-full h-full" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
