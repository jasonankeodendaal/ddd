import React, { useState, useEffect } from 'react';

const fallbackImages = [
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1554046920-90dcac4a3500?auto=format&fit=crop&w=1920&q=80"
];

const PhotographyHome: React.FC<{ settings: any }> = ({ settings }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [];
  if (settings.heroBgUrl) images.push(settings.heroBgUrl);
  if (settings.aboutUsImageUrl) images.push(settings.aboutUsImageUrl);
  if (images.length === 0) images.push(...fallbackImages);
  else if (images.length === 1) images.push(...fallbackImages.slice(0, 2));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4500); 
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="animate-fade-in w-full flex flex-col items-center">
      
      {/* Flipping Background Hero Section - Bleeding Full Viewport */}
      <section className="w-full relative h-[85vh] -mt-32 mb-20 overflow-hidden flex items-center justify-center">
        {images.map((img, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            >
              <div className="absolute inset-0 bg-black/40 z-10 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent z-10"></div>
              <img src={img} alt={`Hero ${idx}`} className="w-full h-full object-cover grayscale-[30%]" />
            </div>
        ))}
        
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center mt-20">
           <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-stone-300 mb-6 drop-shadow-sm">
               {settings.companyName || 'Fine Art Photography'}
           </p>
           <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl leading-[0.9] mix-blend-overlay">
             {settings.hero?.title || 'Capturing The Moment'}
           </h1>
        </div>
      </section>

      {/* Welcome to Photography Section */}
      <section className="w-full max-w-4xl mx-auto px-4 md:px-0 py-20 text-center space-y-10 border-b border-white/5">
         <h2 className="text-3xl md:text-4xl font-light tracking-tight text-stone-200">
             Welcome to our Studio
         </h2>
         <div className="w-px h-16 bg-gradient-to-b from-stone-500/0 via-stone-500/50 to-stone-500/0 mx-auto"></div>
         <p className="text-lg md:text-xl text-stone-400 font-light leading-relaxed max-w-2xl mx-auto">
             {settings.hero?.subtitle || 'We specialize in professional photography tailored to your unique story. Beautifully crafted, minimal, and authentic.'}
         </p>
         <button className="px-8 py-3 bg-transparent text-stone-300 border border-stone-600 hover:border-white hover:text-white uppercase tracking-widest text-[10px] font-bold transition-colors mt-8">
            View Pricing
         </button>
      </section>

      {/* Meet the Owner Section */}
      <section className="w-full max-w-5xl mx-auto px-4 md:px-0 py-24">
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            {/* Free flowing portrait */}
            <div className="w-full md:w-1/2 relative">
                {settings.aboutUsImageUrl ? (
                    <img src={settings.aboutUsImageUrl} alt="Meet the owner" className="w-full aspect-[3/4] object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 ease-out" />
                ) : (
                    <div className="w-full aspect-[3/4] bg-neutral-900 border border-white/5 flex items-center justify-center">
                        <span className="text-stone-600 text-xs tracking-widest uppercase">Portrait Placeholder</span>
                    </div>
                )}
            </div>

            {/* Free flowing text */}
            <div className="w-full md:w-1/2 space-y-8">
               <div className="space-y-2">
                   <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500">Meet the Owner</p>
                   <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-stone-200 drop-shadow-sm">The Visionary Behind the Lens</h2>
               </div>
               
               <div className="prose prose-invert prose-stone text-stone-400 font-light leading-relaxed">
                   <p className="mb-6">
                       {settings.about?.story_p1 || "I believe that every picture tells a story. My journey began with a passion for capturing the raw, authentic moments that make life beautiful."}
                   </p>
                   <p className="mb-6">
                       {settings.about?.story_p2 || "Whether it's a wedding, a corporate event, or a personal portrait session, my approach is always the same: to blend into the background and let the natural magic unfold."}
                   </p>
                   <p>
                       {settings.about?.story_p3 || "I utilize state-of-the-art equipment paired with a deep understanding of natural and artificial lighting to ensure every frame is a masterpiece you'll cherish forever."}
                   </p>
               </div>
               <div className="pt-8 flex items-center gap-6">
                  {settings.logoUrl && (
                      <img src={settings.logoUrl} alt="Signature" className="h-10 opacity-50 filter grayscale mix-blend-screen" />
                  )}
                  <p className="text-xs uppercase tracking-widest text-stone-600 font-bold">Principal Photographer</p>
               </div>
            </div>
        </div>
      </section>

    </div>
  );
};

export default PhotographyHome;
