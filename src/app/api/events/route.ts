import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongodb';

// GET: Fetch the current event details
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("natitude");
    // We just fetch the most recent event document
    const event = await db.collection("events").findOne({}, { sort: { _id: -1 } });
    return NextResponse.json(event || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Update the event details
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { date, time, locationName } = await req.json();
    const client = await clientPromise;
    const db = client.db("natitude");

    // Update the existing one or create new
    await db.collection("events").updateOne(
      {}, 
      { $set: { date, time, locationName, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}