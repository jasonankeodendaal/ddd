import React, { useState, useEffect } from 'react';
import { dbLogout, dbSubscribeToDoc, dbSubscribeToCollection, dbAddItem, dbDeleteItem, dbSetDoc, dbUploadFile } from '../../utils/dbAdapter';
import TrashIcon from '../../components/icons/TrashIcon';

interface Props {
  user: any;
  onNavigate: (view: 'home' | 'admin' | 'photography' | 'photography_admin') => void;
}

const PhotographyAdminDashboard: React.FC<Props> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState<any>({ theme: {} });
  const [library, setLibrary] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Library State
  const [newLibItem, setNewLibItem] = useState({ title: '', story: '' });
  const [libPrimaryFile, setLibPrimaryFile] = useState<File | null>(null);
  const [libGalleryFiles, setLibGalleryFiles] = useState<FileList | null>(null);

  // Social Link State
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newSocialIcon, setNewSocialIcon] = useState<File | null>(null);

  // Admin Booking State
  const [newBooking, setNewBooking] = useState({ clientName: '', clientEmail: '', clientPhone: '', date: '', time: '', service: 'Photoshoot' });
  
  // Package/Investment State
  const [newPackage, setNewPackage] = useState({ label: '', price: '', description: '' });
  const [packageFiles, setPackageFiles] = useState<FileList | null>(null);

  useEffect(() => {
     let unsubs: Function[] = [];
     
     const load = async () => {
         unsubs.push(dbSubscribeToDoc('settings', 'photography', (data) => {
             if (data) {
                 if (!data.theme) data.theme = {};
                 setSettings(data);
             }
         }));
         unsubs.push(dbSubscribeToCollection('photo_library', (data) => setLibrary(data)));
         unsubs.push(dbSubscribeToCollection('photo_bookings', (data) => setBookings(data)));
         setIsLoading(false);
     };
     load();
     
     return () => unsubs.forEach(u => u());
  }, []);

  const handleSaveSettings = async () => {
      setMsg('Saving settings...');
      try {
          await dbSetDoc('settings', 'photography', settings);
          setMsg('Settings saved!');
          setTimeout(() => setMsg(''), 2000);
      } catch (err: any) {
          setMsg(err.message || 'Error saving settings');
      }
  };

  const handleAddSocialLink = async () => {
      if (!newSocialUrl || !newSocialIcon) return;
      setIsUploading(true);
      setMsg('Uploading social icon...');
      try {
          const iconUrl = await dbUploadFile(newSocialIcon, 'media', 'photography/socials/');
          const currentLinks = settings.socialLinks || [];
          const newSettings = { ...settings, socialLinks: [...currentLinks, { id: Date.now().toString(), url: newSocialUrl, icon: iconUrl }] };
          setSettings(newSettings);
          setNewSocialUrl('');
          setNewSocialIcon(null);
          setMsg('Social link added. Remember to save.');
      } catch (e: any) {
          setMsg(e.message || 'Error uploading social icon');
      } finally {
          setIsUploading(false);
      }
  };

  const handleAddPackage = async () => {
      if (!newPackage.label || !newPackage.price) return;
      setIsUploading(true);
      setMsg('Uploading package media...');
      try {
          let imageUrls: string[] = [];
          if (packageFiles && packageFiles.length > 0) {
              for (let i = 0; i < packageFiles.length; i++) {
                  const url = await dbUploadFile(packageFiles[i], 'media', `photography/packages/${Date.now()}_${i}`);
                  imageUrls.push(url);
              }
          }
          const currentOpts = settings.bookingOptions || [];
          const newOpt = {
              id: Date.now().toString(),
              label: newPackage.label,
              price: newPackage.price,
              description: newPackage.description,
              images: imageUrls
          };
          const newSettings = { ...settings, bookingOptions: [...currentOpts, newOpt] };
          setSettings(newSettings);
          setNewPackage({ label: '', price: '', description: '' });
          setPackageFiles(null);
          setMsg('Package added! Remember to Push Engine (Store Changes).');
      } catch (e) {
          setMsg('Error adding package.');
      } finally {
          setIsUploading(false);
      }
  };

  const handleDeletePackage = (id: string) => {
      const currentOpts = settings.bookingOptions || [];
      const newSettings = { ...settings, bookingOptions: currentOpts.filter((o:any) => o.id !== id) };
      setSettings(newSettings);
  };

  const handleDeleteSocialLink = (id: string) => {
      const currentLinks = settings.socialLinks || [];
      const newSettings = { ...settings, socialLinks: currentLinks.filter((l: any) => l.id !== id) };
      setSettings(newSettings);
  };

  const handleAddAdminBooking = async () => {
      if (!newBooking.clientName) return;
      try {
          await dbAddItem('photo_bookings', newBooking);
          setNewBooking({ clientName: '', clientEmail: '', clientPhone: '', date: '', time: '', service: 'Photoshoot' });
          setMsg('Booking scheduled!');
          setTimeout(() => setMsg(''), 2000);
      } catch (e: any) {
          setMsg('Error adding booking');
      }
  };

  const generateQuote = (booking: any) => {
      alert(`Simulation: Quote generated for ${booking.clientName} for ${booking.service}.\nA PDF would be sent to ${booking.clientEmail}.`);
  };

  const generateInvoice = (booking: any) => {
      alert(`Simulation: Invoice generated for ${booking.clientName}.\nTotal due will be sent via payment link to ${booking.clientPhone || booking.clientEmail}.`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      setMsg('Uploading file...');
      try {
          const url = await dbUploadFile(file, 'media', 'photography/');
          const newSettings = { ...settings };
          newSettings[fieldName] = url;
          setSettings(newSettings);
          setMsg('Upload successful! Remember to save.');
      } catch (err: any) {
          setMsg(err.message || 'Error uploading file');
      } finally {
          setIsUploading(false);
      }
  };

  const handleAddLibraryItem = async () => {
      if (!newLibItem.title) return;
      setIsUploading(true);
      setMsg('Uploading library assets...');
      try {
          let primaryUrl = '';
          if (libPrimaryFile) {
              primaryUrl = await dbUploadFile(libPrimaryFile, 'media', 'photography/library/');
          }

          let galleryUrls: string[] = [];
          if (libGalleryFiles && libGalleryFiles.length > 0) {
              for (let i = 0; i < libGalleryFiles.length; i++) {
                  const url = await dbUploadFile(libGalleryFiles[i], 'media', 'photography/library/gallery/');
                  galleryUrls.push(url);
              }
          }

          await dbAddItem('photo_library', {
              title: newLibItem.title,
              story: newLibItem.story,
              primaryImage: primaryUrl,
              galleryImages: galleryUrls
          });
          setNewLibItem({ title: '', story: '' });
          setLibPrimaryFile(null);
          setLibGalleryFiles(null);
          setMsg('Library item added successfully!');
          setTimeout(() => setMsg(''), 2000);
      } catch (e) {
          console.error(e);
          setMsg('Error adding library item.');
      } finally {
          setIsUploading(false);
      }
  }

  const handleDeleteSub = async (col: any, id: string) => {
      if (confirm('Are you sure?')) {
          await dbDeleteItem(col, id);
      }
  }

  const tabClass = (tab: string) => `px-5 py-3 font-bold text-xs uppercase tracking-widest rounded-t-xl transition-all ${activeTab === tab ? 'bg-[#1a1a1a] text-white border-t border-x border-white/10 shadow-[0_-5px_10px_rgba(0,0,0,0.5)]' : 'bg-[#0f0f0f] text-stone-500 hover:bg-[#141414] hover:text-stone-300 border-t border-x border-transparent'}`;
  const inputClass = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-sm text-stone-200 focus:ring-1 focus:ring-stone-400 focus:border-stone-400 outline-none transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]";
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><p className="animate-pulse tracking-widest text-sm uppercase text-stone-500 font-bold">Loading Workspace...</p></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 font-sans selection:bg-stone-300 selection:text-black">
        {/* Superior Top Bar */}
        <header className="bg-[#121212]/90 backdrop-blur-xl sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center shadow-inner">
                        <span className="font-bold text-sm text-stone-300">P</span>
                    </div>
                    <h1 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-300">HQ Studio Workspace</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('photography')} className="text-[10px] uppercase tracking-widest px-3 py-2 text-stone-500 hover:text-white transition">Public Engine</button>
                    <button onClick={() => onNavigate('admin')} className="text-[10px] bg-stone-200 text-black px-4 py-2 rounded-lg font-bold uppercase tracking-widest hover:bg-white transition shadow-lg">Bos Terminal</button>
                </div>
            </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-8 mt-4">
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 space-x-2">
                <button className={tabClass('settings')} onClick={() => setActiveTab('settings')}>Content</button>
                <button className={tabClass('investment')} onClick={() => setActiveTab('investment')}>Investment</button>
                <button className={tabClass('theme')} onClick={() => setActiveTab('theme')}>Design</button>
                <button className={tabClass('library')} onClick={() => setActiveTab('library')}>Library</button>
                <button className={tabClass('bookings')} onClick={() => setActiveTab('bookings')}>Bookings</button>
            </div>

            {/* Status Notifications */}
            {msg && (
                <div className="mt-6 mb-2 bg-[#1a1a1a] text-stone-200 p-4 rounded-xl text-xs uppercase tracking-widest border border-white/10 text-center flex items-center justify-center space-x-3 shadow-xl relative z-20">
                    {isUploading && <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>}
                    <span>{msg}</span>
                </div>
            )}

            <div className="bg-[#1a1a1a] rounded-b-2xl rounded-tr-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 p-6 md:p-8 mt-0 relative z-10">

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Core Content</h2>
                        <button onClick={handleSaveSettings} className="bg-stone-200 text-black px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white transition shadow-xl">Store Changes</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Text Fields */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Company Name</label>
                                <input className={inputClass} value={settings.companyName || ''} onChange={e => setSettings({...settings, companyName: e.target.value})} placeholder="Studio Name" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">WhatsApp Integration</label>
                                <input className={inputClass} value={settings.whatsAppNumber || ''} onChange={e => setSettings({...settings, whatsAppNumber: e.target.value})} placeholder="+1234567890" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Support Email</label>
                                <input className={inputClass} type="email" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} placeholder="Email" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Physical Address</label>
                                <textarea className={inputClass} rows={2} value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} placeholder="Address" />
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Hero Title</label>
                                <input className={inputClass} value={settings.hero?.title || ''} onChange={e => setSettings({...settings, hero: {...(settings.hero||{}), title: e.target.value}})} placeholder="Capturing The Moment" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Hero Subtitle</label>
                                <textarea className={inputClass} rows={2} value={settings.hero?.subtitle || ''} onChange={e => setSettings({...settings, hero: {...(settings.hero||{}), subtitle: e.target.value}})} placeholder="We specialize in professional photography..."></textarea>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">About Story (Paragraph 1)</label>
                                <textarea className={inputClass} rows={2} value={settings.about?.story_p1 || ''} onChange={e => setSettings({...settings, about: {...(settings.about||{}), story_p1: e.target.value}})} placeholder="I believe that every picture tells a story..."></textarea>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">About Story (Paragraph 2)</label>
                                <textarea className={inputClass} rows={2} value={settings.about?.story_p2 || ''} onChange={e => setSettings({...settings, about: {...(settings.about||{}), story_p2: e.target.value}})} placeholder="Whether it's a wedding..."></textarea>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">About Story (Paragraph 3)</label>
                                <textarea className={inputClass} rows={2} value={settings.about?.story_p3 || ''} onChange={e => setSettings({...settings, about: {...(settings.about||{}), story_p3: e.target.value}})} placeholder="I utilize state-of-the-art equipment..."></textarea>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Banking Settings</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input className={inputClass} value={settings.bankName || ''} onChange={e => setSettings({...settings, bankName: e.target.value})} placeholder="Bank" />
                                    <input className={inputClass} value={settings.accountNumber || ''} onChange={e => setSettings({...settings, accountNumber: e.target.value})} placeholder="Acc Numb." />
                                    <input className={inputClass} value={settings.branchCode || ''} onChange={e => setSettings({...settings, branchCode: e.target.value})} placeholder="Code" />
                                </div>
                            </div>
                        </div>

                        {/* File Uploads */}
                        <div className="space-y-6 bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-inner">
                            <h3 className="font-bold text-[10px] uppercase tracking-widest text-stone-400 mb-2 border-b border-white/5 pb-2">Media Assets</h3>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Brand Emblem</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} className="block w-full text-xs file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:font-semibold file:bg-[#222222] file:text-stone-300 hover:file:bg-[#2a2a2a] transition cursor-pointer text-stone-500 mb-2 border border-white/5 bg-[#121212] rounded-xl shadow-inner focus:outline-none" />
                                {settings.logoUrl && <img src={settings.logoUrl} alt="Logo Prev" className="h-10 mt-2 rounded-lg bg-[#0a0a0a] object-contain p-1 border border-white/10" />}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Hero BG Layer</label>
                                <input type="file" accept="image/*,video/mp4" onChange={(e) => handleFileUpload(e, 'heroBgUrl')} className="block w-full text-xs file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:font-semibold file:bg-[#222222] file:text-stone-300 hover:file:bg-[#2a2a2a] transition cursor-pointer text-stone-500 mb-2 border border-white/5 bg-[#121212] rounded-xl shadow-inner focus:outline-none" />
                                {settings.heroBgUrl && (
                                    <div className="mt-2 text-[10px] truncate max-w-sm font-mono bg-[#0a0a0a] p-2 rounded-lg border border-white/10 text-stone-400">{settings.heroBgUrl}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">About Us Reference</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'aboutUsImageUrl')} className="block w-full text-xs file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:font-semibold file:bg-[#222222] file:text-stone-300 hover:file:bg-[#2a2a2a] transition cursor-pointer text-stone-500 mb-2 border border-white/5 bg-[#121212] rounded-xl shadow-inner focus:outline-none" />
                                {settings.aboutUsImageUrl && <img src={settings.aboutUsImageUrl} alt="About Prev" className="h-16 mt-2 rounded-xl object-cover border border-white/10 shadow-md" />}
                            </div>
                        </div>

                        {/* Social Links Manager */}
                        <div className="md:col-span-2 space-y-6 bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-inner mt-4">
                            <h3 className="font-bold text-[10px] uppercase tracking-widest text-stone-400 border-b border-white/5 pb-2">Social Hub</h3>
                            
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Target End</label>
                                    <input className={inputClass} placeholder="https://instagram.com/..." value={newSocialUrl} onChange={e => setNewSocialUrl(e.target.value)} />
                                </div>
                                <div className="md:w-64">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Icon Vector (PNG)</label>
                                    <input type="file" accept="image/*" onChange={e => setNewSocialIcon(e.target.files?.[0] || null)} className="block w-full text-xs file:mr-2 file:py-2 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:uppercase file:font-semibold file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 transition cursor-pointer bg-[#0a0a0a] border border-white/10 rounded-xl h-[46px] p-1 text-stone-500" />
                                </div>
                                <button onClick={handleAddSocialLink} disabled={isUploading || !newSocialUrl || !newSocialIcon} className="bg-stone-200 text-black px-6 h-[46px] rounded-xl font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-white transition shadow-lg">Link</button>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                {(settings.socialLinks || []).map((link: any) => (
                                    <div key={link.id} className="bg-[#121212] border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-1.5 bg-[#1a1a1a] rounded-lg border border-white/5">
                                            <img src={link.icon} alt="social" className="w-4 h-4 object-contain filter grayscale invert opacity-70" />
                                            </div>
                                            <span className="text-[10px] text-stone-400 truncate tracking-wide">{link.url.replace('https://', '')}</span>
                                        </div>
                                        <button onClick={() => handleDeleteSocialLink(link.id)} className="text-red-400 hover:text-red-300 p-1"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'investment' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Investment Packages</h2>
                        <button onClick={handleSaveSettings} className="bg-stone-200 text-black px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white transition shadow-xl">Push Engine</button>
                    </div>

                    <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-inner">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest mb-6 text-stone-400 border-b border-white/5 pb-2">Add New Package</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Package Name</label><input className={inputClass} value={newPackage.label} onChange={e => setNewPackage({...newPackage, label: e.target.value})} placeholder="e.g. Platinum Wedding" /></div>
                            
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Price</label><input className={inputClass} value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} placeholder="e.g. 15000" /></div>
                            
                            <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Description</label><textarea className={inputClass} rows={3} value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} placeholder="Describe what's included..."></textarea></div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Package Media (Multiple Uploads)</label>
                                <input type="file" multiple accept="image/*" onChange={(e) => setPackageFiles(e.target.files)} className="block w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 transition cursor-pointer bg-[#0a0a0a] border border-white/10 rounded-xl h-[46px] p-1 text-stone-500" />
                                <p className="text-[10px] text-stone-600 mt-2 tracking-wide">Select multiple images to showcase this package.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleAddPackage} disabled={isUploading} className="bg-stone-200 text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition hover:bg-white disabled:opacity-50 shadow-lg">
                                {isUploading ? 'Uploading...' : 'Add Package'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest text-stone-400 border-b border-white/5 pb-2">Active Packages</h3>
                        {(!settings.bookingOptions || settings.bookingOptions.length === 0) ? (
                            <div className="p-8 border border-dashed border-white/10 rounded-2xl flex items-center justify-center bg-[#121212]">
                                <p className="text-xs text-stone-600 font-medium tracking-widest uppercase">No Packages Added</p>
                            </div>
                        ) : (
                            settings.bookingOptions.map((opt: any) => (
                                <div key={opt.id} className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <div className="flex justify-between md:justify-start items-center gap-4">
                                            <h4 className="font-bold text-base text-stone-200">{opt.label}</h4>
                                            <span className="text-[10px] uppercase tracking-widest font-bold bg-[#1a1a1a] border border-white/5 px-2 py-1 rounded-md text-stone-400">R {opt.price}</span>
                                        </div>
                                        <p className="text-xs text-stone-500 line-clamp-2 max-w-lg mt-1 font-light">{opt.description}</p>
                                        {opt.images && opt.images.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {opt.images.slice(0, 4).map((imgUrl: string, idx: number) => (
                                                    <img key={idx} src={imgUrl} className="w-12 h-12 object-cover rounded-lg border border-white/10 opacity-70" alt={`pkg-img-${idx}`} />
                                                ))}
                                                {opt.images.length > 4 && (
                                                    <div className="w-12 h-12 rounded-lg border border-white/10 bg-[#1a1a1a] flex items-center justify-center text-[10px] text-stone-500 font-medium tracking-wide">
                                                        +{opt.images.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => handleDeletePackage(opt.id)} className="shrink-0 text-red-500 hover:text-red-400 border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 p-2.5 rounded-xl transition" title="Delete Package">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Aesthetic Parameters</h2>
                        <button onClick={handleSaveSettings} className="bg-stone-200 text-black px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white transition shadow-xl">Push Engine</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-inner">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-6 border-b border-white/5 pb-2">Palette Roots</h3>
                            <div className="space-y-4">
                                <div className="flex items-center pb-4 border-b border-white/5">
                                    <label className="w-1/3 text-[10px] font-bold uppercase tracking-widest text-stone-500">Void (Bg)</label>
                                    <input type="color" value={settings.theme?.brandDark || '#1a1a1a'} onChange={e => setSettings({...settings, theme: {...settings.theme, brandDark: e.target.value}})} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
                                    <span className="ml-4 font-mono text-xs text-stone-400">{settings.theme?.brandDark || '#1a1a1a'}</span>
                                </div>
                                <div className="flex items-center pb-4 border-b border-white/5">
                                    <label className="w-1/3 text-[10px] font-bold uppercase tracking-widest text-stone-500">Surface (Card)</label>
                                    <input type="color" value={settings.theme?.brandLight || '#f5f5f5'} onChange={e => setSettings({...settings, theme: {...settings.theme, brandLight: e.target.value}})} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
                                    <span className="ml-4 font-mono text-xs text-stone-400">{settings.theme?.brandLight || '#f5f5f5'}</span>
                                </div>
                                <div className="flex items-center pb-4">
                                    <label className="w-1/3 text-[10px] font-bold uppercase tracking-widest text-stone-500">Primary Ink</label>
                                    <input type="color" value={settings.theme?.brandOffWhite || '#ffffff'} onChange={e => setSettings({...settings, theme: {...settings.theme, brandOffWhite: e.target.value}})} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
                                    <span className="ml-4 font-mono text-xs text-stone-400">{settings.theme?.brandOffWhite || '#ffffff'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-6 border-b border-white/5 pb-2">Typography & Scale</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Display Family</label>
                                    <select className={`${inputClass} appearance-none`} value={settings.theme?.fontSans || 'Inter, sans-serif'} onChange={e => setSettings({...settings, theme: {...settings.theme, fontSans: e.target.value}})}>
                                        <option value="Inter, sans-serif">Inter (Modern Clean)</option>
                                        <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech / Edgy)</option>
                                        <option value="'Playfair Display', serif">Playfair Display (Editorial / Elegant)</option>
                                        <option value="'JetBrains Mono', monospace">JetBrains Mono (Technical)</option>
                                        <option value="system-ui, sans-serif">System Default</option>
                                    </select>
                                </div>
                                
                                <div className="p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden" style={{ backgroundColor: settings.theme?.brandDark || '#1a1a1a', color: settings.theme?.brandOffWhite || '#ffffff', fontFamily: settings.theme?.fontSans || 'Inter, sans-serif' }}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-[30px] pointer-events-none"></div>
                                    <h4 className="text-2xl font-bold mb-2 tracking-tight drop-shadow-md">Frame Review</h4>
                                    <p className="text-sm opacity-60 font-light leading-relaxed">This visualizes layout text rendering with the specified CSS parameters applied within the public space.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Library Tab */}
            {activeTab === 'library' && (
                <div className="space-y-8">
                    <h2 className="text-xl font-bold tracking-tight text-white border-b border-white/5 pb-4">Library Vault</h2>
                    
                    <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest mb-6 text-stone-400 border-b border-white/5 pb-2">Stage New Feature</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Asset Frame Title</label><input className={inputClass} value={newLibItem.title} onChange={e => setNewLibItem({...newLibItem, title: e.target.value})} placeholder="e.g. Summer Edition" /></div>
                            
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Cover (1 Asset)</label><input type="file" accept="image/*,video/mp4" onChange={(e) => setLibPrimaryFile(e.target.files?.[0] || null)} className="block w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 transition cursor-pointer bg-[#0a0a0a] border border-white/10 rounded-xl h-[46px] p-1 text-stone-500" /></div>
                            
                            <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Editorial Note</label><textarea className={inputClass} rows={3} value={newLibItem.story} onChange={e => setNewLibItem({...newLibItem, story: e.target.value})} placeholder="Describe context..."></textarea></div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Gallery Payload (Multiple)</label>
                                <input type="file" multiple accept="image/*,video/mp4,application/pdf" onChange={(e) => setLibGalleryFiles(e.target.files)} className="block w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 transition cursor-pointer bg-[#0a0a0a] border border-white/10 rounded-xl h-[46px] p-1 text-stone-500" />
                                <p className="text-[10px] text-stone-600 mt-2 tracking-wide">Select multiple standard aspect ratio outputs.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleAddLibraryItem} disabled={isUploading} className="bg-stone-200 text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition hover:bg-white disabled:opacity-50 shadow-lg">
                                {isUploading ? 'Transferring...' : 'Publish Vector'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest text-stone-400 border-b border-white/5 pb-2">Active Staged Frames</h3>
                        {library.length === 0 ? (
                            <div className="p-8 border border-dashed border-white/10 rounded-2xl flex items-center justify-center bg-[#121212]">
                                <p className="text-xs text-stone-600 font-medium tracking-widest uppercase">Grid Empty</p>
                            </div>
                        ) : (
                            library.map(item => (
                                <div key={item.id} className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/20 hover:bg-[#161616] transition shadow-md">
                                    <div className="flex items-center gap-6">
                                        {item.primaryImage ? (
                                            <div className="w-16 h-16 shrink-0 bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 shadow-inner">
                                                <img src={item.primaryImage} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 shrink-0 bg-[#0a0a0a] rounded-xl flex items-center justify-center border border-white/10 text-[10px] text-stone-600 font-bold uppercase tracking-widest shadow-inner">Null</div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-base text-stone-200">{item.title}</h4>
                                            <p className="text-xs text-stone-500 line-clamp-2 max-w-lg mt-1 font-light">{item.story}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[10px] uppercase tracking-widest font-bold bg-[#1a1a1a] border border-white/5 px-2 py-1 rounded-md text-stone-400">{item.galleryImages?.length || 0} Traces</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => handleDeleteSub('photo_library', item.id)} className="shrink-0 text-red-500 hover:text-red-400 border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 p-2.5 rounded-xl transition" title="Purge Record">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="space-y-8">
                    <h2 className="text-xl font-bold tracking-tight text-white border-b border-white/5 pb-4">Schedule Command</h2>

                    <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] mb-8">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest mb-6 text-stone-400 border-b border-white/5 pb-2">Manual Dispatch</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Target Identity</label><input className={inputClass} value={newBooking.clientName} onChange={e => setNewBooking({...newBooking, clientName: e.target.value})} placeholder="Jane Doe" /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Origin Node (Email)</label><input type="email" className={inputClass} value={newBooking.clientEmail} onChange={e => setNewBooking({...newBooking, clientEmail: e.target.value})} placeholder="jane@example.com" /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Terminal (Phone)</label><input className={inputClass} value={newBooking.clientPhone} onChange={e => setNewBooking({...newBooking, clientPhone: e.target.value})} placeholder="123-456-7890" /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Timestamp Grid</label><input type="date" className={`${inputClass} [color-scheme:dark]`} value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Phase Coord</label><input type="time" className={`${inputClass} [color-scheme:dark]`} value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})} /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Protocol Matrix</label><input className={inputClass} value={newBooking.service} onChange={e => setNewBooking({...newBooking, service: e.target.value})} placeholder="Package Type" /></div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleAddAdminBooking} className="bg-stone-200 text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition hover:bg-white shadow-lg">
                                Authorize Block
                            </button>
                        </div>
                    </div>

                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-stone-400 border-b border-white/5 pb-2 mb-6">Dispatch History Queue</h3>
                    {bookings.length === 0 ? <p className="text-stone-600 text-xs tracking-widest uppercase italic font-medium">Grid is clear.</p> : (
                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121212] shadow-xl">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-[#1a1a1a] text-stone-400 text-[10px] uppercase tracking-widest border-b border-white/10">
                                    <tr>
                                        <th className="p-4 font-bold">Identity</th>
                                        <th className="p-4 font-bold">Vector Line</th>
                                        <th className="p-4 font-bold">Block Time</th>
                                        <th className="p-4 font-bold">Request Object</th>
                                        <th className="p-4 font-bold text-right">Execute</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {bookings.map(b => (
                                        <tr key={b.id} className="hover:bg-[#161616] transition text-stone-300">
                                            <td className="p-4 font-medium">{b.clientName}</td>
                                            <td className="p-4 font-light text-stone-400 hover:text-white transition"><a href={`mailto:${b.clientEmail}`}>{b.clientEmail}</a> <br/><span className="text-[10px] font-mono">{b.clientPhone}</span></td>
                                            <td className="p-4"><span className="bg-stone-800/80 px-2 py-1 rounded text-[10px] font-mono border border-white/5 block w-max">{b.date || 'HOLD'}</span><span className="text-stone-500 text-[10px] mt-1 block">{b.time || 'N/A'}</span></td>
                                            <td className="p-4"><span className="bg-stone-200/5 backdrop-blur-sm text-stone-300 font-bold px-3 py-1 rounded-lg border border-white/10 tracking-wide text-[10px] uppercase">{b.service}</span></td>
                                            <td className="p-4 text-right space-x-2">
                                                <button onClick={() => generateQuote(b)} className="text-stone-300 hover:text-black hover:bg-stone-200 font-bold text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition shadow-sm">Eval</button>
                                                <button onClick={() => generateInvoice(b)} className="text-emerald-400 hover:text-black hover:bg-emerald-400 border border-emerald-400/30 font-bold text-[10px] uppercase tracking-widest bg-emerald-950/20 px-3 py-1.5 rounded-lg transition shadow-sm">Mint</button>
                                                <button onClick={() => handleDeleteSub('photo_bookings', b.id)} className="text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 font-bold text-[10px] uppercase tracking-widest ml-4 px-3 py-1.5 rounded-lg transition shadow-sm bg-[#0a0a0a]">X</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            
            </div>
        </main>
    </div>
  );
}

export default PhotographyAdminDashboard;
