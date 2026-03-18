import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    // 1. SESSION CHECK
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await clientPromise;
    // CRITICAL: Ensure this string "natitude" matches your join/route.ts exactly
    const db = client.db("natitude");
    
    // 2. FETCH ALL (No filters)
    const members = await db.collection("members")
      .find({}) 
      .sort({ appliedAt: -1 })
      .toArray();

    // This log will show up in your Vercel Dashboard / Terminal
    console.log(`DATABASE_CHECK: Found ${members.length} records in 'members' collection.`);

    return NextResponse.json(members);
  } catch (error: any) {
    console.error("ADMIN_API_ERROR:", error.message);
    return NextResponse.json({ error: "Database Connection Failed" }, { status: 500 });
  }
}