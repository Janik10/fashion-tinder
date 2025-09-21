import { useState, useRef } from "react";
import { Heart, X, Bookmark, ShoppingBag } from "lucide-react";

interface FashionItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  category: string;
  tags: string[];
  colors: string[];
}

interface FashionCardProps {
  item: FashionItem;
  onSwipe: (direction: 'like' | 'pass' | 'save') => void;
  style?: React.CSSProperties;
}

export const FashionCard = ({ item, onSwipe, style }: FashionCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1); // Rotation based on horizontal movement
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    const { x, y } = dragOffset;
    
    if (Math.abs(x) > threshold) {
      // Horizontal swipe
      onSwipe(x > 0 ? 'like' : 'pass');
    } else if (y < -threshold) {
      // Swipe up for save
      onSwipe('save');
    } else {
      // Return to center
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
    }
    
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const getOverlayOpacity = (direction: 'like' | 'pass' | 'save') => {
    const { x, y } = dragOffset;
    const threshold = 50;
    
    switch (direction) {
      case 'like':
        return x > threshold ? Math.min((x - threshold) / 100, 0.8) : 0;
      case 'pass':
        return x < -threshold ? Math.min((Math.abs(x) - threshold) / 100, 0.8) : 0;
      case 'save':
        return y < -threshold ? Math.min((Math.abs(y) - threshold) / 100, 0.8) : 0;
      default:
        return 0;
    }
  };

  return (
    <div
      ref={cardRef}
      className="swipe-card absolute w-[420px] h-[680px] bg-card rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{
        ...style,
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
      />
      
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Like Overlay */}
      <div 
        className="like-overlay"
        style={{ opacity: getOverlayOpacity('like') }}
      >
        <div className="bg-white/20 rounded-full p-4">
          <Heart className="w-16 h-16 text-white fill-white" />
        </div>
        <div className="absolute top-8 left-8 transform -rotate-12">
          <div className="bg-like text-like-foreground px-4 py-2 rounded-lg text-xl font-bold border-4 border-white">
            LIKE
          </div>
        </div>
      </div>
      
      {/* Pass Overlay */}
      <div 
        className="pass-overlay"
        style={{ opacity: getOverlayOpacity('pass') }}
      >
        <div className="bg-white/20 rounded-full p-4">
          <X className="w-16 h-16 text-white" />
        </div>
        <div className="absolute top-8 right-8 transform rotate-12">
          <div className="bg-pass text-pass-foreground px-4 py-2 rounded-lg text-xl font-bold border-4 border-white">
            PASS
          </div>
        </div>
      </div>
      
      {/* Save Overlay */}
      <div 
        className="save-overlay"
        style={{ opacity: getOverlayOpacity('save') }}
      >
        <div className="bg-white/20 rounded-full p-4">
          <Bookmark className="w-16 h-16 text-white fill-white" />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-save text-save-foreground px-6 py-3 rounded-lg text-2xl font-bold border-4 border-white">
            SAVED
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm opacity-90">{item.category}</span>
        </div>
        
        <h3 className="text-2xl font-bold mb-1">{item.name}</h3>
        <p className="text-lg font-medium mb-2">{item.brand}</p>
        {item.price > 0 ? (
          <p className="text-3xl font-bold mb-3">${item.price}</p>
        ) : (
          <p className="text-lg font-medium mb-3 text-white/80">Price not available</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex gap-2">
          {item.colors.slice(0, 4).map((color, index) => (
            <div 
              key={index}
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};