import React, { useState, useEffect } from 'react';
import { dbSubscribeToDoc } from '../../utils/dbAdapter';

import PhotographyHome from './PhotographyHome';
import PhotographyLibrary from './PhotographyLibrary';
import PhotographyBooking from './PhotographyBooking';
import PhotographyHeader from './PhotographyHeader';
import PhotographyFooter from './PhotographyFooter';

interface Props {
  onNavigateHome: () => void;
}

const PhotographyApp: React.FC<Props> = ({ onNavigateHome }) => {
  const [currentView, setCurrentView] = useState<'home' | 'library' | 'booking'>('home');
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = dbSubscribeToDoc('settings', 'photography', (data) => {
      if (data) {
        setSettings(data);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-stone-300">
              <p className="animate-pulse tracking-widest text-sm uppercase">Loading...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-stone-300 selection:text-black overflow-x-hidden relative" style={{ 
      backgroundColor: '#0a0a0a', 
      color: '#e5e5e5',
      fontFamily: settings.theme?.fontSans || 'Inter, sans-serif'
    }}>
      <style>{`
        @keyframes float-3d {
            0% { transform: translateY(110vh) rotate(0deg) scale(0.8); opacity: 0; }
            10% { opacity: 0.08; }
            90% { opacity: 0.08; }
            100% { transform: translateY(-20vh) rotate(360deg) scale(1.2); opacity: 0; }
        }
        .float-icon {
            position: absolute;
            animation: float-3d linear infinite;
            filter: drop-shadow(0 20px 30px rgba(0,0,0,0.8)) grayscale(50%) brightness(0.8);
            will-change: transform;
        }
      `}</style>

      {/* Background ambient light effects & Floating Icons */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-stone-800/10 blur-[140px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-stone-400/5 blur-[120px]"></div>
          
          {[...Array(15)].map((_, i) => {
             const baseLeft = (i / 15) * 100;
             const width = 60 + (i % 3) * 20; // 60px to 100px
             const duration = 40 + (i % 5) * 8; // 40s to 72s
             const delay = -(i * 11); // stagger delays so they are all at different heights
             
             return (
                 <img 
                    key={i}
                    src="https://i.ibb.co/MkyWFbQ6/Gemini-Generated-Image-removebg-preview.png" 
                    alt=""
                    className="float-icon"
                    style={{
                        left: `${baseLeft}%`,
                        width: `${width}px`,
                        animationDuration: `${duration}s`,
                        animationDelay: `${delay}s`,
                        opacity: 0.05,
                        zIndex: 0
                    }}
                 />
             );
          })}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
          <PhotographyHeader 
            settings={settings} 
            currentView={currentView} 
            onNavigate={setCurrentView} 
            onNavigateBosSalon={onNavigateHome}
          />
          
          <main className="flex-grow pt-32 pb-20 w-full">
            {currentView === 'home' && <PhotographyHome settings={settings} />}
            {currentView === 'library' && <div className="max-w-[1000px] mx-auto px-4 md:px-8"><PhotographyLibrary settings={settings} /></div>}
            {currentView === 'booking' && <div className="max-w-[1000px] mx-auto px-4 md:px-8"><PhotographyBooking settings={settings} /></div>}
          </main>

          <PhotographyFooter settings={settings} />
      </div>
    </div>
  );
};

export default PhotographyApp;
