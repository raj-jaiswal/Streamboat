import { Play, FileText, Download, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AssetCard({ 
  title, 
  subtitle, 
  imageUrl, 
  badgeText, 
  badgeIcon: BadgeIcon,
  type = 'video', // 'video', 'image', 'document', 'package'
  className 
}) {
  const getBadgeColor = () => {
    switch(type) {
      case 'video': return 'bg-sb-surface border-sb-border text-sb-primary';
      case 'image': return 'bg-sb-surface border-sb-border text-sb-purple';
      case 'document': return 'bg-sb-surface border-sb-border text-gray-400';
      case 'package': return 'bg-sb-surface border-sb-border text-[#ff00a0]';
      default: return 'bg-sb-surface border-sb-border text-sb-text';
    }
  };

  return (
    <div className={cn(
      "relative group rounded-2xl overflow-hidden cursor-pointer border border-transparent hover:border-sb-border transition-all duration-300",
      className
    )}>
      {/* Background Image */}
      <img 
        src={imageUrl} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-sb-bg/90 via-sb-bg/40 to-transparent" />

      {/* Top Right Badge */}
      {badgeText && (
        <div className={cn(
          "absolute top-4 right-4 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider flex items-center gap-1 border backdrop-blur-md bg-opacity-80",
          getBadgeColor()
        )}>
          {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
          {badgeText}
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-sb-primary transition-colors">
          {title}
        </h3>
        
        {typeof subtitle === 'string' ? (
          <p className="text-xs text-sb-text-muted font-medium">{subtitle}</p>
        ) : (
          <div className="flex items-center text-xs text-sb-text-muted font-medium gap-2">
            {subtitle.map((item, i) => (
              <span key={i} className="flex items-center">
                {item}
                {i < subtitle.length - 1 && <span className="mx-2 w-1 h-1 rounded-full bg-sb-border" />}
              </span>
            ))}
          </div>
        )}

        {/* Hover Action */}
        <div className="overflow-hidden h-0 group-hover:h-8 transition-all duration-300 mt-2">
          {type === 'document' && (
            <button className="flex items-center text-xs font-bold text-sb-purple hover:text-[#b47af0] transition-colors uppercase tracking-wider mt-2">
              VIEW DOCUMENT <span className="ml-1">→</span>
            </button>
          )}
          {type === 'package' && (
            <button className="flex items-center text-xs font-bold text-sb-primary hover:text-[#66f5ff] transition-colors uppercase tracking-wider mt-2">
              <Download className="w-3 h-3 mr-2" />
              DOWNLOAD PACKAGE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
