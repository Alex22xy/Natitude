'use client';

import { useState, useEffect } from 'react';

/**
 * NATITUDE COMMAND CENTER
 * Secure access point for Tribe management and Ritual updates.
 */
export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ritual Event State
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLoc, setEventLoc] = useState('');

  // 1. Fetch members if authenticated
  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch current Ritual details
  const fetchEvent = async () => {
    const res = await fetch('/api/admin/event');
    if (res.ok) {
      const data = await res.json();
      setEventDate(data.date || '');
      setEventTime(data.time || '');
      setEventLoc(data.locationName || '');
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchEvent();
  }, []);

  // 3. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      setIsAuthenticated(true);
      fetchMembers();
      fetchEvent();
    } else {
      setError('ACCESS DENIED: INVALID FREQUENCY');
    }
  };

  // 4. Update Ritual Details
  const updateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/event', {
      method: 'POST',
      body: JSON.stringify({ 
        date: eventDate, 
        time: eventTime, 
        locationName: eventLoc 
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (res.ok) {
      alert("RITUAL UPDATED IN ARCHIVES");
    } else {
      alert("UPDATE FAILED");
    }
  };

  // 5. Member Actions (Approve/Delete)
  const approveMember = async (id: string) => {
    const res = await fetch('/api/admin/members/approve', {
      method: 'POST',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) fetchMembers();
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transmission?")) return;
    const res = await fetch('/api/admin/members/delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) fetchMembers();
  };

  // --- LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono p-4">
        <div className="border border-[#ff00ff] p-8 max-w-md w-full text-center">
          <h1 className="text-[#ff00ff] text-2xl mb-6 tracking-widest">ADMIN_AUTH</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="ENTER SECRET KEY"
              className="w-full bg-black border border-white p-3 text-center outline-none focus:border-[#ff00ff]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-[#ff00ff] text-black font-bold p-3 hover:bg-white transition-colors">
              DECRYPT
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 text-xs">{error}</p>}
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-black text-white font-mono p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end border-b border-[#ff00ff] pb-4 mb-8">
          <div>
            <h1 className="text-[#ff00ff] text-3xl tracking-tighter font-bold">NATITUDE_SYSTEMS</h1>
            <p className="text-xs opacity-50">AUTHORIZED ACCESS ONLY // CONTROL_PANEL</p>
          </div>
          <div className="text-right">
            <p className="text-[#ff00ff]">{members.length}</p>
            <p className="text-[10px] uppercase">Active Seekers</p>
          </div>
        </div>

        {/* EVENT MANAGER SECTION */}
        <div className="mb-12 border border-zinc-800 p-6 bg-zinc-950">
          <h2 className="text-[#ff00ff] text-xs uppercase tracking-[0.3em] mb-4 font-bold">Ritual_Control</h2>
          <form onSubmit={updateEvent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" placeholder="Date (e.g. 24.05.26)" 
              value={eventDate} onChange={(e) => setEventDate(e.target.value)}
              className="bg-black border border-zinc-700 p-2 text-xs outline-none focus:border-[#ff00ff]"
            />
            <input 
              type="text" placeholder="Time (e.g. 22:00 - 04:00)" 
              value={eventTime} onChange={(e) => setEventTime(e.target.value)}
              className="bg-black border border-zinc-700 p-2 text-xs outline-none focus:border-[#ff00ff]"
            />
            <input 
              type="text" placeholder="Location Label" 
              value={eventLoc} onChange={(e) => setEventLoc(e.target.value)}
              className="bg-black border border-zinc-700 p-2 text-xs outline-none focus:border-[#ff00ff]"
            />
            <button className="bg-white text-black text-[10px] font-bold uppercase hover:bg-[#ff00ff] transition-colors py-2">
              Update Ritual
            </button>
          </form>
        </div>

        {/* TRIBE DATABASE SECTION */}
        <div className="overflow-x-auto">
          <h2 className="text-[#ff00ff] text-xs uppercase tracking-[0.3em] mb-4 font-bold">Tribe_Archive</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-[#ff00ff]">
                <th className="py-4 px-2">Joined</th>
                <th className="py-4 px-2">Name</th>
                <th className="py-4 px-2">Email</th>
                <th className="py-4 px-2">Instagram</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {members.map((member: any) => (
                <tr key={member._id} className="border-b border-zinc-900 hover:bg-zinc-950 transition-colors">
                  <td className="py-4 px-2 opacity-50">{new Date(member.appliedAt).toLocaleDateString()}</td>
                  <td className="py-4 px-2 font-bold">{member.fullName}</td>
                  <td className="py-4 px-2 text-zinc-400">{member.email}</td>
                  <td className="py-4 px-2 text-[#ff00ff]">
                    <a href={`https://instagram.com/${member.instagram?.replace('@', '')}`} target="_blank" rel="noreferrer">
                      {member.instagram}
                    </a>
                  </td>
                  <td className="py-4 px-2 uppercase text-[10px]">
                    {member.status === 'pending' ? (
                      <button 
                        onClick={() => approveMember(member._id)}
                        className="border border-[#ff00ff] text-[#ff00ff] px-2 py-1 hover:bg-[#ff00ff] hover:text-black transition-colors"
                      >
                        APPROVE
                      </button>
                    ) : (
                      <span className="border border-green-500 text-green-500 px-2 py-1">APPROVED</span>
                    )}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button 
                      onClick={() => deleteMember(member._id)}
                      className="text-zinc-600 hover:text-red-500 transition-colors text-[10px] uppercase font-bold"
                    >
                      [Delete]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && !loading && (
            <div className="py-20 text-center opacity-30 italic">No transmissions found in the archive.</div>
          )}
        </div>
      </div>
    </div>
  );
}