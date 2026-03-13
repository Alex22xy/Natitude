import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET: Fetches all events from the database.
 * This is used by both the Admin panel and the Homepage.
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("natitude");
    
    // Fetch all events, sorted by date (earliest first)
    const events = await db.collection("events")
      .find({})
      .sort({ date: 1 })
      .toArray();

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

/**
 * POST: Handles both Creating NEW events and Editing EXISTING ones.
 */
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
      // MODE: EDIT EXISTING
      // Updates the specific document that matches the ID
      await db.collection("events").updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            date, 
            time, 
            locationName, 
            updatedAt: new Date() 
          } 
        }
      );
    } else {
      // MODE: CREATE NEW
      // Inserts a brand new document into the collection
      await db.collection("events").insertOne({
        date,
        time,
        locationName,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("EVENT_OPERATION_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}