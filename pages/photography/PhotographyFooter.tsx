import React from 'react';

const PhotographyFooter: React.FC<{ settings: any }> = ({ settings }) => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#0d0d0d] relative mt-12 z-10 px-4 py-8 md:py-12">
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-stone-400 text-xs">
          
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col items-start space-y-4">
            {settings?.logoUrl ? (
                 <img src={settings.logoUrl} alt="Footer Logo" className="h-8 opacity-70 hover:opacity-100 transition filter grayscale" />
            ) : (
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-300">{settings?.companyName || 'Photography'}</h2>
            )}
            <p className="font-light max-w-[200px] leading-relaxed">
                Capturing authentic moments with premium lighting and modern artistry.
            </p>
        </div>

        {/* Connect & Contact */}
        <div className="md:col-span-3 space-y-2">
             <h4 className="font-bold text-stone-300 mb-3 uppercase tracking-widest text-[10px]">Reach Out</h4>
             {settings.email && <div className="hover:text-stone-200 transition cursor-pointer">{settings.email}</div>}
             {settings.phone && <div className="hover:text-stone-200 transition cursor-pointer">{settings.phone}</div>}
             {settings.whatsAppNumber && (
                 <a href={`https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}?text=Hi, I would like to enquire about photography services.`} target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-white font-bold block mt-2 border-b border-stone-600 inline-block pb-0.5">Contact via WhatsApp</a>
             )}
        </div>
        
        {/* Locations / Times */}
        <div className="md:col-span-3 space-y-2">
             <h4 className="font-bold text-stone-300 mb-3 uppercase tracking-widest text-[10px]">Studio & Times</h4>
             {settings.openingTimes && (
                <p className="whitespace-pre-line leading-relaxed">{settings.openingTimes}</p>
             )}
             {settings.address && (
                <p className="whitespace-pre-line mt-2 leading-relaxed">{settings.address}</p>
             )}
        </div>

        {/* Social Links */}
        <div className="md:col-span-2 flex flex-col items-start md:items-end w-full">
            <h4 className="font-bold text-stone-300 mb-3 uppercase tracking-widest text-[10px]">Follow</h4>
            {settings.socialLinks && settings.socialLinks.length > 0 ? (
                <div className="flex gap-4">
                    {settings.socialLinks.map((link: any) => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 hover:-translate-y-1 transform transition-all p-1.5 bg-white/5 rounded-md border border-white/5">
                            <img src={link.icon} alt="Social link" className="w-4 h-4 object-contain filter grayscale invert" />
                        </a>
                    ))}
                </div>
            ) : (
                <span className="opacity-50">No socials connected.</span>
            )}
        </div>
        
      </div>
      
      <div className="max-w-[1000px] mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase tracking-widest text-stone-600">
          <p>&copy; {new Date().getFullYear()} {settings.companyName || 'Photography'}. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Powered by Bos Salon Engine</p>
      </div>
    </footer>
  );
};

export default PhotographyFooter;
