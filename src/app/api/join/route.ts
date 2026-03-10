import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Resend } from 'resend';

// Initialize Resend with your environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("natitude");
    const body = await req.json();

    // 1. SAVE TO DATABASE
    const result = await db.collection("members").insertOne({
      fullName: body.fullName,
      email: body.email,
      instagram: body.instagram,
      status: 'pending',
      appliedAt: new Date(),
    });

    // 2. SEND NOTIFICATION EMAIL
    // Note: If you haven't verified a domain, you must send FROM 'onboarding@resend.dev'
    // and TO the email you signed up with.
    await resend.emails.send({
      from: 'Natitude <onboarding@resend.dev>',
      to: 'alex.john.norton9@gmail.com', // Replace with your actual email
      subject: 'NEW TRIBE MEMBER ⚡️',
      html: `
        <div style="font-family: sans-serif; background: #000; color: #fff; padding: 20px; border: 1px solid #FF00FF;">
          <h2 style="color: #FF00FF;">NEW APPLICATION</h2>
          <p><strong>NAME:</strong> ${body.fullName}</p>
          <p><strong>EMAIL:</strong> ${body.email}</p>
          <p><strong>INSTAGRAM:</strong> <a href="https://instagram.com/${body.instagram.replace('@', '')}" style="color: #FF00FF;">${body.instagram}</a></p>
          <hr style="border-color: #333;" />
          <p style="font-size: 10px; opacity: 0.5;">ID: ${result.insertedId}</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("JOIN_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}