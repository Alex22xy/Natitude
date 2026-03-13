import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  // We must 'await' the cookies in the latest Next.js versions
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  // If the secret cookie is missing, block the data
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("natitude");
    
    // Fetch all members, newest first
    const members = await db.collection("members")
      .find({})
      .sort({ appliedAt: -1 })
      .toArray();

    return NextResponse.json(members);
  } catch (error: any) {
    console.error("ADMIN_MEMBERS_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}