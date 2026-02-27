import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { post, scheduledTime, email } = await req.json();

  const scheduledDate = new Date(scheduledTime);
  const now = new Date();
  const delayMs = scheduledDate.getTime() - now.getTime();

  if (delayMs < 0) {
    return NextResponse.json({ success: false, error: "Scheduled time is in the past." });
  }

  // Schedule the email
  setTimeout(async () => {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL as string,
      to: email,
      subject: `Time to post on LinkedIn!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0077B5;">Your LinkedIn Post is Ready!</h2>
          <p style="color: #666;">It's time to post! Copy the post below and paste it into LinkedIn.</p>
          <div style="background: #f5f5f5; border-left: 4px solid #0077B5; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; color: #333; margin: 0;">${post}</pre>
          </div>
          <a href="https://www.linkedin.com/feed/" style="background: #0077B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Open LinkedIn
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Sent by your LinkedIn Post Scheduler</p>
        </div>
      `,
    });
  }, delayMs);

  return NextResponse.json({ success: true });
}
