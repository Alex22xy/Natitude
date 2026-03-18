import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 1. PUBLIC GET: This lets the world see your Rituals
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("natitude");
    
    // Fetch all events from the 'events' collection
    const events = await db.collection("events")
      .find({})
      .sort({ createdAt: -1 }) // Show newest first
      .toArray();
      
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. SECURE POST: Only works for YOU (Admin)
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  // Security Check: If not logged in, block them
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, date, time, locationName } = await req.json();
    const client = await clientPromise;
    const db = client.db("natitude");

    if (id) {
      // Update existing ritual
      await db.collection("events").updateOne(
        { _id: new ObjectId(id) },
        { $set: { date, time, locationName, updatedAt: new Date() } }
      );
    } else {
      // Create new ritual
      await db.collection("events").insertOne({
        date,
        time,
        locationName,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}