import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    const client = await clientPromise;
    const db = client.db("natitude");

    // 1. Get the member's details first so we know who to email
    const member = await db.collection("members").findOne({ _id: new ObjectId(id) });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // 2. Update the status in the Database
    await db.collection("members").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'approved', approvedAt: new Date() } }
    );

    // 3. Send the "Welcome to the Inner Circle" Email
    await resend.emails.send({
      from: 'NATITUDE <onboarding@resend.dev>',
      to: member.email,
      subject: 'ACCESS GRANTED // THE INNER CIRCLE',
      html: `
        <div style="background-color: #000; color: #fff; padding: 60px 20px; font-family: 'Courier New', Courier, monospace; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ff00ff; padding: 40px; background-color: #000;">
            <h1 style="color: #ff00ff; letter-spacing: 12px; margin-bottom: 30px; font-size: 24px;">WELCOME</h1>
            <p style="margin-bottom: 25px;">Greetings, ${member.fullName}.</p>
            <p style="margin-bottom: 25px; color: #ff00ff;">YOUR SIGNAL HAS BEEN CLEARED.</p>
            <p style="line-height: 1.8; margin-bottom: 25px;">
              You have been formally inducted into the NATITUDE archives. You are no longer a seeker; you are a member of the tribe.
            </p>
            <div style="border: 1px solid #333; padding: 20px; margin-bottom: 25px; text-align: left;">
              <p style="font-size: 12px; color: #666; margin: 0;">SECRET_LOCATION_FREQUENCY:</p>
              <p style="margin: 10px 0 0 0; color: #fff;">[DETAILS TO BE TRANSMITTED 24H BEFORE RITUAL]</p>
            </div>
            <p style="margin-top: 40px; font-size: 12px; opacity: 0.6;">STAY WILD. THE JUNGLE AWAITS.</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}