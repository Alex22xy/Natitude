import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("natitude");
    
    // This pulls all images from your 'gallery' collection
    const gallery = await db.collection("gallery").find({}).toArray();

    return NextResponse.json(gallery);
  } catch (error: any) {
    console.error("GALLERY_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}