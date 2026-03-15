'use client';

import { useState, useEffect } from 'react';

// This is the "Nuclear Option" to stop Next.js from caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RitualPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRituals = async () => {
      console.log("RITUAL_SYSTEM: Manual override engaged. Fetching...");
      try {
        // We add ?v= plus a random number to the URL. 
        // This tricks the server into thinking it's a new request it's never seen.
        const response = await fetch(`/api/admin/event?v=${Math.random()}`, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        
        const data = await response.json();
        console.log("RITUAL_SYSTEM: Data Received ->", data);
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("RITUAL_SYSTEM: Signal failure", error);
      } finally {
        setLoading(false);
      }
    };

    loadRituals();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">
          RITUALS
        </h1>
        <div className="h-[1px] w-full bg-zinc-800 mb-12"></div>

        <div className="space-y-16">
          {loading ? (
            <div className="animate-pulse text-[#ff00ff]">CONNECTING_TO_ARCHIVE...</div>
          ) : events.length > 0 ? (
            events.map((event: any) => (
              <div key={event._id} className="group border-b border-zinc-900 pb-12 hover:border-[#ff00ff] transition-colors">
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none italic">
                    {event.date}
                  </h2>
                  <div className="text-right">
                    <p className="text-[#ff00ff] text-sm tracking-widest uppercase mb-1">{event.locationName}</p>
                    <p className="text-zinc-500 text-lg">{event.time}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20">
              <p className="text-zinc-700 uppercase text-xs tracking-[0.3em]">No rituals detected in this sector.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-[10px] text-[#ff00ff] underline"
              >
                RESCAN_FREQUENCIES
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}