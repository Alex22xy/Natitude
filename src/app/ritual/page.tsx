'use client';

import { useState, useEffect } from 'react';

export default function RitualPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("NATITUDE_SYSTEM_CHECK: Initiating Fetch...");
    
    const getRituals = async () => {
      try {
        const res = await fetch('/api/admin/event', { cache: 'no-store' });
        const data = await res.json();
        
        console.log("DATABASE_RESPONSE:", data);
        
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("CONNECTION_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    getRituals();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">
          RITUALS_V2
        </h1>
        <div className="h-[1px] w-full bg-zinc-800 mb-12"></div>

        <div className="space-y-16">
          {loading ? (
            <p className="text-[#ff00ff] animate-pulse uppercase tracking-[0.3em]">Syncing_Frequencies...</p>
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
            <div className="py-20 text-left">
              <p className="text-zinc-700 uppercase text-xs tracking-[0.3em]">No upcoming rituals detected in this sector.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}