'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  
  // NEW: UI feedback states
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [evRes, galRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/gallery')
        ]);
        if (evRes.ok) setEvents(await evRes.json());
        if (galRes.ok) setGallery(await galRes.json());
      } catch (err) {
        console.error("The Jungle is offline:", err);
      }
    };
    fetchData();
  }, []);

  const handleJoinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const payload = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      instagram: formData.get('instagram'),
    };

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        // Close modal after a short delay so they see the success message
        setTimeout(() => {
          setIsJoinOpen(false);
          setStatus('idle');
        }, 2500);
      } else {
        // This will capture that "(Unauthorized)" error if it happens again
        setStatus('error');
        setErrorMessage(data.error || "Access Denied");
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage("Network Failure");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="bg-black h-screen w-full" />;

  return (
    <main className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black text-white selection:bg-[#FF00FF] selection:text-black scroll-smooth">
      
      {/* SECTION 1: HERO */}
      <section id="home" className="relative h-[100dvh] w-full snap-start flex items-center justify-center overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 grayscale-[20%]">
          <source src="/jungle.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />
        <div className="relative z-20 w-full max-w-[300px] flex flex-col items-center p-4">
          <img src="/logo.svg" alt="Natitude Logo" className="w-full h-auto drop-shadow-[0_0_15px_rgba(255,0,255,0.8)]" />
          <p className="mt-8 uppercase tracking-[0.8em] text-[9px] text-[#FF00FF] font-black animate-pulse text-center">Welcome to the Jungle</p>
        </div>
      </section>

      {/* SECTION 2: RITUALS */}
      <section id="events" className="min-h-[100dvh] w-full snap-start bg-black p-8 pt-24">
        <div className="max-w-md mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8 border-b border-white/5 pb-4">Rituals</h2>
          <div className="space-y-4 pb-32">
            {events.length > 0 ? events.map((event) => (
              <div key={event._id} className="border-b border-white/5 py-8 flex justify-between items-center group">
                <div className="flex flex-col">
                  <span className="text-[#FF00FF] font-mono text-[9px] uppercase tracking-[0.4em] mb-1">{event.date}</span>
                  <h3 className="text-2xl font-black uppercase group-hover:italic transition-all">{event.name}</h3>
                </div>
                <button className="px-6 py-2 bg-white text-black font-black uppercase text-[10px] tracking-widest active:scale-90 transition-transform">
                  {event.isSoldOut ? 'Full' : 'Join'}
                </button>
              </div>
            )) : <p className="text-white/20 uppercase tracking-widest text-[10px]">No upcoming rituals</p>}
          </div>
        </div>
      </section>

      {/* SECTION 3: GALLERY */}
      <section id="gallery" className="min-h-[100dvh] w-full snap-start bg-black p-4 pt-24 pb-40">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8 border-b border-white/5 pb-4 text-center">Gallery</h2>
        <div className="columns-2 gap-2 space-y-2 max-w-2xl mx-auto">
          {gallery.map((item) => (
            <div key={item._id} className="relative overflow-hidden border border-white/5 bg-neutral-900">
              <img src={item.imageUrl} alt="Visual Artifact" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
          ))}
        </div>
      </section>

      {/* NAV DOCK */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-[100] flex justify-around items-center px-6 pb-safe">
        <button onClick={() => scrollToSection('home')} className="flex flex-col items-center gap-1 group">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF00FF] mb-0.5 shadow-[0_0_10px_#FF00FF]" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#FF00FF]">Feed</span>
        </button>
        <button onClick={() => scrollToSection('events')} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-all">
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">Rituals</span>
        </button>
        <button onClick={() => setIsJoinOpen(true)} className="bg-[#FF00FF] h-12 w-12 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(255,0,255,0.5)] active:scale-90 transition-transform">
          <span className="text-[10px] font-black text-black">JOIN</span>
        </button>
        <button onClick={() => scrollToSection('gallery')} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-all">
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">Gallery</span>
        </button>
      </nav>

      {/* MODAL: JOIN THE TRIBE */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-neutral-950 border border-[#FF00FF]/30 p-8 relative">
            <button onClick={() => setIsJoinOpen(false)} className="absolute top-4 right-4 text-[9px] text-white/40 font-black tracking-widest hover:text-[#FF00FF] transition-colors">[ Close ]</button>
            <h2 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">Join the <span className="text-[#FF00FF]">Tribe</span></h2>
            
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <input name="fullName" required placeholder="FULL NAME" className="w-full bg-black border border-white/10 p-4 text-[10px] font-bold tracking-widest focus:border-[#FF00FF] outline-none transition-colors text-white" />
              <input name="email" type="email" required placeholder="EMAIL" className="w-full bg-black border border-white/10 p-4 text-[10px] font-bold tracking-widest focus:border-[#FF00FF] outline-none transition-colors text-white" />
              <input name="instagram" required placeholder="INSTAGRAM @handle" className="w-full bg-black border border-white/10 p-4 text-[10px] font-bold tracking-widest focus:border-[#FF00FF] outline-none transition-colors text-white" />
              
              <button 
                type="submit"
                disabled={loading || status === 'success'} 
                className={`w-full font-black p-5 text-[10px] uppercase tracking-[0.2em] transition-all shadow-[4px_4px_0_white] active:translate-x-1 active:translate-y-1 active:shadow-none 
                  ${status === 'success' ? 'bg-green-500 text-white shadow-none' : 
                    status === 'error' ? 'bg-red-600 text-white' : 'bg-[#FF00FF] text-black'}`}
              >
                {loading ? 'Transmitting...' : 
                 status === 'success' ? 'Application Sent' : 
                 status === 'error' ? 'Retry Transmission' : 'Submit Application'}
              </button>

              {status === 'error' && (
                <p className="text-[8px] text-red-500 font-mono mt-2 uppercase text-center tracking-tighter">
                  Error: {errorMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}