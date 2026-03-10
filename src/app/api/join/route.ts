import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("natitude");
    const body = await req.json();

    // 1. SAVE TO DATABASE
    await db.collection("members").insertOne({
      fullName: body.fullName,
      email: body.email,
      instagram: body.instagram,
      status: 'pending',
      appliedAt: new Date(),
    });

    // 2. SEND NOTIFICATION TO YOU (Admin)
    await resend.emails.send({
      from: 'Natitude <onboarding@resend.dev>',
      to: 'your-email@example.com', // Your email
      subject: 'NEW TRIBE MEMBER ⚡️',
      html: `<p><strong>${body.fullName}</strong> just joined the jungle.</p>`
    });

    // 3. SEND WELCOME TO THE USER (Success Response)
    // NOTE: On the free tier, this only works if the user's email is verified in Resend.
    // Once you add a custom domain, this will work for EVERYONE.
    await resend.emails.send({
      from: 'Natitude <onboarding@resend.dev>',
      to: body.email, 
      subject: 'WELCOME TO THE TRIBE 🌿',
      html: `
        <div style="font-family: 'Courier New', Courier, monospace; background-color: #000; color: #fff; padding: 40px; text-align: center;">
          <h1 style="color: #FF00FF; letter-spacing: 5px;">NATITUDE</h1>
          <p style="font-size: 18px;">Greetings, ${body.fullName}.</p>
          <p>Your transmission has been received and encrypted into the jungle archives.</p>
          <p>We are currently reviewing the latest batch of seekers. Watch your frequency for further instructions.</p>
          <br />
          <div style="border-top: 1px solid #333; padding-top: 20px;">
            <p style="font-size: 12px; color: #666;">STAY WILD. STAY CONNECTED.</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("JOIN_ERROR:", error.message);
    return NextResponse.json({ error: "Transmission Interrupted" }, { status: 500 });
  }
}