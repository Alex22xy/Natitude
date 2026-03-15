import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 1. PUBLIC GET: This allows your Ritual page to see the data
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("natitude");
    // Fetch all events and sort by date
    const events = await db.collection("events").find({}).sort({ date: 1 }).toArray();
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. SECURE POST: Only works if you are logged in as Admin
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  // Security Check
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, date, time, locationName } = await req.json();
    const client = await clientPromise;
    const db = client.db("natitude");

    if (id) {
      // UPDATE EXISTING
      await db.collection("events").updateOne(
        { _id: new ObjectId(id) },
        { $set: { date, time, locationName, updatedAt: new Date() } }
      );
    } else {
      // CREATE NEW
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