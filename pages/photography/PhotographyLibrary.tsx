import React, { useState, useEffect, useRef } from 'react';
import { dbSubscribeToCollection } from '../../utils/dbAdapter';
import FullScreenImageViewer from '../../components/FullScreenImageViewer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GalleryRow: React.FC<{ images: string[], onSelect: (img: string) => void }> = ({ images, onSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const scroll = (direction: 'left' | 'right') => {
        if(scrollRef.current) {
            const container = scrollRef.current;
            const scrollAmount = 250;
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    }

    return (
        <div className="relative pt-8 group">
            <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <ChevronLeft size={20} />
            </button>
            <div ref={scrollRef} className="flex gap-4 pb-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, i) => (
                    <div key={i} onClick={() => onSelect(img)} className="cursor-pointer min-w-[120px] w-[120px] aspect-square overflow-hidden bg-[#0a0a0a] rounded-lg">
                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    </div>
                ))}
            </div>
            <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight size={20} />
            </button>
        </div>
    )
}

const LibraryItem: React.FC<{ item: any, index: number }> = ({ item, index }) => {
    const [currentImage, setCurrentImage] = useState(item.primaryImage);
    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
        <div className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-4 md:gap-16 py-4 md:py-8 border-b border-white/5 last:border-0`}>
            {/* Primary Image Cover */}
            <div className="w-4/5 md:w-1/3 shrink-0">
                {currentImage ? (
                    <div className="relative group w-full cursor-pointer" onClick={() => setIsFullScreen(true)}>
                        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition duration-500 z-10 pointer-events-none"></div>
                        <img src={currentImage} alt={item.title} className="w-full h-auto aspect-[3/4] object-cover transition duration-1000 ease-out shadow-lg rounded-xl" />
                    </div>
                ) : (
                    <div className="w-full aspect-[3/4] bg-neutral-900 border border-white/5 flex items-center justify-center rounded-xl">
                        <span className="text-stone-600 text-xs tracking-widest uppercase">No Image</span>
                    </div>
                )}
            </div>
            
            {/* Story & Details */}
            <div className="w-full md:w-2/3 space-y-3">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-500">Editorial</p>
                    <h3 className="text-2xl md:text-4xl font-black tracking-tighter text-stone-200 drop-shadow-sm">{item.title}</h3>
                </div>
                
                <div className="prose prose-invert prose-stone text-stone-400 text-sm font-light leading-relaxed">
                    <p>{item.story}</p>
                </div>
                
                {/* Gallery Miniatures */}
                {item.galleryImages && item.galleryImages.length > 0 && (
                    <GalleryRow images={item.galleryImages} onSelect={setCurrentImage} />
                )}
            </div>

            {isFullScreen && <FullScreenImageViewer src={currentImage} alt={item.title} onClose={() => setIsFullScreen(false)} />}
        </div>
    )
}

const PhotographyLibrary: React.FC<{ settings: any }> = ({ settings }) => {
  const [libraryData, setLibraryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = dbSubscribeToCollection('photo_library', (data) => {
        setLibraryData(data);
        setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
      return (
          <div className="py-24 text-center">
              <p className="animate-pulse tracking-widest text-sm uppercase text-stone-500">Loading Library...</p>
          </div>
      );
  }

  return (
    <div className="w-full space-y-12">
        <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white drop-shadow-lg">Selected Work</h2>
            <div className="w-16 h-1 bg-stone-300 mx-auto mt-4 rounded-full shadow-[0_2px_10px_rgba(255,255,255,0.2)]"></div>
        </div>
        
        {libraryData.length === 0 ? (
            <div className="text-center text-stone-500 py-16 bg-[#161616]/50 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]">
                No portfolio items available yet.
            </div>
        ) : (
            <div className="space-y-16">
                {libraryData.map((item, index) => (
                    <LibraryItem key={item.id} item={item} index={index} />
                ))}
            </div>
        )}
    </div>
  );
};

export default PhotographyLibrary;
