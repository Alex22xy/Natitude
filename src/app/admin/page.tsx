'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ritual Form State
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLoc, setEventLoc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
        setIsAuthenticated(true);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchEvents = async () => {
    const res = await fetch('/api/admin/event');
    if (res.ok) {
      const data = await res.json();
      setAllEvents(Array.isArray(data) ? data : []);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchEvents();
  }, []);

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
      fetchEvents();
    } else {
      setError('ACCESS DENIED');
    }
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/event', {
      method: 'POST',
      body: JSON.stringify({ id: editingId, date: eventDate, time: eventTime, locationName: eventLoc }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      setEditingId(null); setEventDate(''); setEventTime(''); setEventLoc('');
      fetchEvents();
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete Ritual?")) return;
    await fetch('/api/admin/event/delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
    });
    fetchEvents();
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Remove Member?")) return;
    await fetch('/api/admin/members/delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
    });
    fetchMembers();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono p-4">
        <div className="border border-[#ff00ff] p-8 max-w-md w-full text-center">
          <h1 className="text-[#ff00ff] text-2xl mb-6 tracking-widest uppercase">Registry_Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="SECRET_KEY"
              className="w-full bg-black border border-white p-3 text-center outline-none focus:border-[#ff00ff]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-[#ff00ff] text-black font-bold p-3 hover:bg-white transition-colors uppercase">Decrypt</button>
          </form>
          {error && <p className="text-red-500 mt-4 text-xs">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end border-b border-[#ff00ff] pb-4 mb-12">
          <div>
            <h1 className="text-[#ff00ff] text-3xl font-bold uppercase tracking-tighter">Tribe_Registry</h1>
            <p className="text-[10px] opacity-50 uppercase tracking-[0.2em]">Management_Interface // Live_Database</p>
          </div>
          <div className="text-right">
            <p className="text-[#ff00ff] text-2xl leading-none">{members.length}</p>
            <p className="text-[10px] uppercase opacity-50">Active_Cards</p>
          </div>
        </div>

        {/* EVENT MANAGER */}
        <div className="mb-20 border border-zinc-900 p-6 bg-zinc-950/50">
          <h2 className="text-[#ff00ff] text-[10px] uppercase tracking-[0.4em] mb-6 font-bold italic">Manual_Transmission</h2>
          <form onSubmit={saveEvent} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
            <input type="text" placeholder="DATE" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-black border border-zinc-800 p-3 text-xs outline-none focus:border-[#ff00ff]" />
            <input type="text" placeholder="TIME" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="bg-black border border-zinc-800 p-3 text-xs outline-none focus:border-[#ff00ff]" />
            <input type="text" placeholder="LOCATION" value={eventLoc} onChange={(e) => setEventLoc(e.target.value)} className="bg-black border border-zinc-800 p-3 text-xs outline-none focus:border-[#ff00ff]" />
            <button className="bg-[#ff00ff] text-black text-[10px] font-bold uppercase hover:bg-white transition-colors">
              {editingId ? 'Update_Ritual' : 'Launch_Ritual'}
            </button>
          </form>

          <div className="space-y-2">
            {allEvents.map((ev: any) => (
              <div key={ev._id} className="flex justify-between items-center border border-zinc-900 p-3 bg-black/40">
                <div className="text-[10px] uppercase tracking-widest">
                  <span className="text-[#ff00ff] mr-6">{ev.date}</span>
                  <span className="opacity-40">{ev.locationName}</span>
                </div>
                <div className="flex gap-6">
                  <button onClick={() => { setEditingId(ev._id); setEventDate(ev.date); setEventTime(ev.time); setEventLoc(ev.locationName); }} className="text-white hover:text-[#ff00ff] text-[10px] font-bold uppercase italic">[Edit]</button>
                  <button onClick={() => deleteEvent(ev._id)} className="text-zinc-700 hover:text-red-500 text-[10px] font-bold uppercase italic">[Delete]</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRIBE TABLE */}
        <div className="overflow-x-auto">
          <h2 className="text-[#ff00ff] text-[10px] uppercase tracking-[0.4em] mb-6 font-bold italic">Member_Archives</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] uppercase tracking-widest text-zinc-500">
                <th className="py-4 px-2">Joined</th>
                <th className="py-4 px-2">Member_Name</th>
                <th className="py-4 px-2">Instagram</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2 text-right">Database_Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] uppercase tracking-wider">
              {members.map((m: any) => (
                <tr key={m._id} className="border-b border-zinc-900/50 hover:bg-zinc-950/50 transition-colors group">
                  <td className="py-5 px-2 opacity-30">{new Date(m.appliedAt).toLocaleDateString()}</td>
                  <td className="py-5 px-2 font-bold text-white">
                    {m.fullName}
                    <div className="text-[8px] text-zinc-600 mt-1 font-normal tracking-normal">ID: {m._id}</div>
                  </td>
                  <td className="py-5 px-2 text-[#ff00ff]">@{m.instagram?.replace('@', '')}</td>
                  <td className="py-5 px-2">
                    <span className="text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-sm text-[9px]">ACTIVE</span>
                  </td>
                  <td className="py-5 px-2 text-right">
                    <button onClick={() => deleteMember(m._id)} className="text-zinc-800 group-hover:text-red-900 transition-colors text-