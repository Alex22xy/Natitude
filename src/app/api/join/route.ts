import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Resend } from 'resend';

// Initialize Resend
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

    // 2. SEND THE ENCRYPTED TRANSMISSION (Welcome Email)
    await resend.emails.send({
      from: 'NATITUDE <onboarding@resend.dev>',
      to: body.email, 
      subject: 'TRANSMISSION RECEIVED // NATITUDE',
      html: `
        <div style="background-color: #000; color: #fff; padding: 60px 20px; font-family: 'Courier New', Courier, monospace; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #333; padding: 40px; background-color: #000;">
            
            <img src="https://natitude.vercel.app/Email_logo.png" alt="NATITUDE" style="width: 120px; margin-bottom: 30px;" />
            
            <h1 style="color: #ff00ff; letter-spacing: 12px; margin-bottom: 50px; font-size: 24px; font-weight: normal; text-transform: uppercase;">
              NATITUDE
            </h1>
            
            <div style="line-height: 1.8; font-size: 14px; color: #fff; text-align: left;">
              <p style="margin-bottom: 25px;">Greetings, ${body.fullName}.</p>
              
              <p style="margin-bottom: 25px;">
                Your transmission has been received and safely encrypted into the jungle archives.
              </p>
              
              <p style="margin-bottom: 40px;">
                We are currently reviewing the latest batch of seekers. Watch your frequency for further instructions.
              </p>
              
              <div style="margin-top: 60px; border-top: 1px solid #222; padding-top: 30px; text-align: center;">
                <p style="letter-spacing: 4px; font-size: 10px; color: #aaa; text-transform: uppercase;">
                  STAY WILD. STAY CONNECTED.
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("JOIN_ERROR:", error.message);
    return NextResponse.json(
      { error: "Transmission Interrupted" }, 
      { status: 500 }
    );
  }
}