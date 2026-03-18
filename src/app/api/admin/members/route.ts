import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongodb';

// FORCE DYNAMIC: This ensures the admin always sees the absolute latest signups
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    // 1. SECURITY CHECK
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("natitude");
    
    // 2. FETCH ALL MEMBERS
    // We fetch every record in the 'members' collection, sorted by date (newest first)
    const members = await db.collection("members")
      .find({})
      .sort({ appliedAt: -1 })
      .toArray();

    console.log(`ADMIN_SYNC: Found ${members.length} members in database.`);

    return NextResponse.json(members);
  } catch (error: any) {
    console.error("ADMIN_MEMBERS_ERROR:", error.message);
    return NextResponse.json(
      { error: "Database Connection Interrupted" }, 
      { status: 500 }
    );
  }
}