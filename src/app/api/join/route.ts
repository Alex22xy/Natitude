import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * NATITUDE: JOIN THE TRIBE API
 * Handles the POST request from the Join Modal
 */
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    // Connects to the specific database we just created
    const db = client.db("natitude");
    
    // Parse the incoming form data
    const body = await req.json();

    // Insert the new member into the 'members' collection
    const result = await db.collection("members").insertOne({
      fullName: body.fullName,
      email: body.email,
      instagram: body.instagram,
      status: 'pending', // Default status for new applications
      appliedAt: new Date(),
    });

    // Log for your Vercel dashboard logs
    console.log(`New Tribe Member: ${body.fullName} (${result.insertedId})`);

    return NextResponse.json({ 
      success: true, 
      message: "Transmission received. Welcome to the Tribe." 
    });

  } catch (error: any) {
    console.error("DATABASE_ERROR:", error.message);
    
    return NextResponse.json(
      { error: "The Jungle is currently unreachable. Try again later." }, 
      { status: 500 }
    );
  }
}