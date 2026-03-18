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

    // 1. SAVE TO DATABASE (Instant Approval)
    const result = await db.collection("members").insertOne({
      fullName: body.fullName,
      email: body.email,
      instagram: body.instagram,
      status: 'approved', // Changed from 'pending'
      appliedAt: new Date(),
    });

    // 2. SEND THE DIGITAL PASSPORT (Welcome Email)
    await resend.emails.send({
      from: 'NATITUDE <onboarding@resend.dev>',
      to: body.email, 
      subject: 'ACCESS GRANTED // NATITUDE TRIBE',
      html: `
        <div style="background-color: #000; color: #fff; padding: 60px 20px; font-family: 'Courier New', Courier, monospace; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #333; padding: 40px; background-color: #000;">
            
            <img src="https://natitude.vercel.app/Email_logo.png" alt="NATITUDE" style="width: 240px; margin-bottom: 15px;" />
            
            <h1 style="color: #ff00ff; letter-spacing: 12px; margin-bottom: 50px; font-size: 24px; font-weight: normal; text-transform: uppercase;">
              NATITUDE
            </h1>
            
            <div style="line-height: 1.8; font-size: 14px; color: #fff; text-align: left;">
              <p style="margin-bottom: 25px;">Welcome to the tribe, ${body.fullName}.</p>
              
              <p style="margin-bottom: 25px;">
                Your membership is now active. Your digital signature has been recorded in the jungle archives.
              </p>
              
              <div style="background-color: #111; border: 1px dashed #ff00ff; padding: 20px; margin-bottom: 30px; text-align: center;">
                <p style="color: #ff00ff; font-size: 12px; margin-bottom: 5px; letter-spacing: 2px;">MEMBER_ID:</p>
                <p style="font-size: 18px; letter-spacing: 4px; color: #fff;">${result.insertedId.toString().toUpperCase()}</p>
              </div>
              
              <p style="margin-bottom: 40px;">
                You are now clear for all upcoming rituals. Present this transmission or your ID at the gate.
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

    return NextResponse.json({ success: true, memberId: result.insertedId });

  } catch (error: any) {
    console.error("JOIN_ERROR:", error.message);
    return NextResponse.json(
      { error: "Transmission Interrupted" }, 
      { status: 500 }
    );
  }
}