import React, { useState, useEffect } from 'react';
import { dbSubscribeToCollection } from '../../utils/dbAdapter';

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
            <div className="space-y-24">
                {libraryData.map((item, index) => (
                    <div key={item.id} className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24 py-12 border-b border-white/5 last:border-0`}>
                        {/* Primary Image Cover */}
                        <div className="w-full md:w-1/2 shrink-0">
                            {item.primaryImage ? (
                                <div className="relative group w-full">
                                    <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition duration-500 z-10 pointer-events-none"></div>
                                    <img src={item.primaryImage} alt={item.title} className="w-full h-auto aspect-[3/4] object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition duration-1000 ease-out shadow-2xl" />
                                </div>
                            ) : (
                                <div className="w-full aspect-[3/4] bg-neutral-900 border border-white/5 flex items-center justify-center">
                                    <span className="text-stone-600 text-xs tracking-widest uppercase">No Image</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Story & Details */}
                        <div className="w-full md:w-1/2 space-y-8">
                            <div className="space-y-2">
                               <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500">Editorial</p>
                               <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-stone-200 drop-shadow-sm">{item.title}</h3>
                            </div>
                            
                            <div className="prose prose-invert prose-stone text-stone-400 font-light leading-relaxed">
                                <p>{item.story}</p>
                            </div>
                            
                            {/* Gallery Miniatures */}
                            {item.galleryImages && item.galleryImages.length > 0 && (
                                <div className="pt-8 grid grid-cols-4 gap-4">
                                    {item.galleryImages.slice(0, 4).map((img: string, i: number) => (
                                        <div key={i} className="relative group cursor-pointer aspect-square overflow-hidden bg-[#0a0a0a]">
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition duration-300 z-10 mix-blend-multiply pointer-events-none"></div>
                                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 hover:scale-105" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default PhotographyLibrary;
