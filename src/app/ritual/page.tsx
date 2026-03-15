'use client';

import { useState, useEffect } from 'react';

// Force Next.js to bypass any saved cache
export const dynamic = 'force-dynamic';

export default function RitualPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRituals = async () => {
      try {
        // We add a timestamp to the URL to prevent the browser from caching "empty" results
        const res = await fetch(`/api/admin/event?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Transmission Data Received:", data);
          
          // Ensure data is an array before setting it
          if (Array.isArray(data)) {
            setEvents(data);
          } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            // If it returns a single object instead of a list, wrap it in a list
            setEvents([data]);
          }
        }
      } catch (err) {
        console.error("Signal Lost:", err);
      } finally {
        setLoading(false);
      }
    };

    getRituals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <p className="text-[#ff00ff] animate-pulse uppercase tracking-[0.5em]">Syncing_Frequencies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">
          RITUALS
        </h1>
        <div className="h-[1px] w-full bg-zinc-800 mb-12"></div>

        <div className="space-y-16">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="group border-b border-zinc-900 pb-12 hover:border-[#ff00ff] transition-colors">
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
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
            <div className="py-20 text-center">
              <p className="text-zinc-700 uppercase text-xs tracking-[0.3em]">No upcoming rituals detected in this sector.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}