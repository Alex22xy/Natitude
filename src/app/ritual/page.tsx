'use client';

import { useState, useEffect } from 'react';

export default function RitualPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRituals = async () => {
      try {
        // We use the absolute path to ensure it hits your API
        const res = await fetch('/api/admin/event');
        if (res.ok) {
          const data = await res.json();
          console.log("Data received from API:", data); // Check your browser console!
          setEvents(Array.isArray(data) ? data : []);
        } else {
          console.error("API response was not OK");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    getRituals();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-black text-[#ff00ff] flex items-center justify-center font-mono uppercase tracking-widest">Scanning_Frequencies...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[#ff00ff] text-2xl mb-16 tracking-[0.4em] uppercase text-center font-bold">
          Active_Transmissions
        </h1>

        <div className="space-y-12">
          {events.length > 0 ? (
            events.map((event) => (
              <div 
                key={event._id} 
                className="group border-l-2 border-zinc-800 hover:border-[#ff00ff] pl-8 py-4 transition-all"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tighter mb-1 uppercase">
                      {event.date}
                    </h2>
                    <p className="text-[#ff00ff] text-sm tracking-widest uppercase">
                      {event.locationName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-[10px] mb-2 uppercase">Time_Window:</p>
                    <p className="text-white text-lg">{event.time}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-zinc-900">
              <p className="text-zinc-600 uppercase text-xs tracking-widest">
                No rituals currently detected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}