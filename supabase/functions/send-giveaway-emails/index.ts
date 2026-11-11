// Supabase Edge Function: send-giveaway-emails
// Deploy with: supabase functions deploy send-giveaway-emails --no-verify-jwt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  participant: {
    id: string;
    full_name: string;
    email: string;
    lucky_number: string;
    baby_age: string;
    country?: string;
    feeding_challenge?: string;
    registered_at: string;
  };
  adminEmail?: string;
  resendApiKey?: string;
  cumulativeCount?: number;
  cumulativeText?: string;
  luckyNumbersBlock?: string;
  rawCsv?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { participant } = payload;
    const adminEmail = payload.adminEmail || Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "moianito2007@gmail.com";
    const resendApiKey = payload.resendApiKey || Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.warn("No RESEND_API_KEY configured.");
      return new Response(
        JSON.stringify({
          success: false,
          error: "RESEND_API_KEY is missing. Please configure it in your environment or admin settings.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const regDateFormatted = new Date(participant.registered_at || Date.now()).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }) + " UTC";

    // 1. Exact required format for Administrator Notification:
    const adminEmailBody = `NEW CANDIDATE

Name: ${participant.full_name}
Email: ${participant.email}
Lucky Number: ${participant.lucky_number}
Baby’s Age: ${participant.baby_age}
Country: ${participant.country || "Not specified"}
Registration Date: ${regDateFormatted}`;

    const fromAddress = Deno.env.get("RESEND_FROM_EMAIL") || "BabyBites Giveaway <giveaway@babybites.app>";

    // Send Admin Notification
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [adminEmail],
        subject: "New BabyBites Giveaway Registration",
        text: adminEmailBody,
      }),
    });

    const adminResult = await adminRes.json();

    // 2. Participant Confirmation Email
    const participantHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>You're officially entered, mama! 💗</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F0; margin: 0; padding: 30px 15px; color: #332B25;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #F2E8E0;">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 30px; text-align: center; background: linear-gradient(135deg, #FFF5F7 0%, #FDF2F4 100%); border-bottom: 1px solid #FCE7EB;">
        <span style="font-size: 28px;">🥣</span>
        <h1 style="margin: 8px 0 0 0; font-size: 26px; color: #BE185D; font-weight: 700; letter-spacing: -0.5px;">BabyBites</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #9D174D; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Early Access Giveaway</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 36px 30px;">
        <h2 style="font-size: 22px; color: #1F2937; margin: 0 0 16px 0; font-weight: 700;">You’re officially entered, mama! 💗</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 24px 0;">
          Hi <strong>${participant.full_name}</strong>, thank you so much for registering! We are thrilled to welcome you to the BabyBites family.
        </p>

        <!-- Lucky Number Box -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFF5F7; border: 2px dashed #F472B6; border-radius: 12px; margin: 24px 0;">
          <tr>
            <td style="padding: 24px 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #9D174D; font-weight: 600;">Your Official Lucky Number is:</p>
              <div style="font-size: 36px; font-weight: 800; color: #BE185D; letter-spacing: 3px; font-family: monospace;">
                ${participant.lucky_number}
              </div>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #6B7280;">
                Keep this code safe! It will be used in our verified external drawing.
              </p>
            </td>
          </tr>
        </table>

        <!-- Campaign Info -->
        <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #374151; letter-spacing: 1px;">Key Campaign Dates</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">
            <li><strong>November 20, 2026:</strong> Registration closes at 11:59 PM EST.</li>
            <li><strong>November 21–25, 2026:</strong> External random selection of 12 lucky moms.</li>
            <li><strong>November 30, 2026:</strong> Official launch date &amp; 7-day VIP access begins!</li>
          </ul>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #6B7280; margin: 0 0 8px 0;">
          <strong>Baby's Age:</strong> ${participant.baby_age}<br>
          ${participant.country ? `<strong>Country:</strong> ${participant.country}<br>` : ''}
          <strong>Registered on:</strong> ${regDateFormatted}
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding: 24px 30px; background-color: #FDFCF9; border-top: 1px solid #F3EDE4; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
          &copy; 2026 BabyBites Inc. All rights reserved.<br>
          Questions? Reply directly to this email or visit our website.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const participantRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [participant.email],
        subject: `You're officially entered, mama! 💗 Your Lucky Number: ${participant.lucky_number}`,
        html: participantHtml,
        text: `Hi ${participant.full_name}!\n\nYou're officially entered into the BabyBites Early Access Giveaway.\n\nYour lucky number is: ${participant.lucky_number}\n\nKey Dates:\n- Registration Closes: November 20, 2026\n- Official Launch: November 30, 2026\n\nGood luck! 💗\nBabyBites Team`,
      }),
    });

    const participantResult = await participantRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        adminResult,
        participantResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error in send-giveaway-emails function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
