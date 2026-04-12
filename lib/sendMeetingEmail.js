import nodemailer from "nodemailer";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildHtml({ booking, meetingLink, adminNote }) {
  const { id, service, date, time, customer } = booking;
  const shortId = id?.slice(0, 8).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Meeting Details</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#2d4a3e;padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#a8c5b5;letter-spacing:2px;text-transform:uppercase;">Career Decipher</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">Your Meeting is Ready 📅</h1>
              <p style="margin:12px 0 0 0;font-size:14px;color:#a8c5b5;">Here's everything you need to join your session.</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <p style="margin:0;font-size:16px;color:#1a2e25;">Hi <strong>${customer.name}</strong>,</p>
              <p style="margin:12px 0 0 0;font-size:14px;color:#4a5568;line-height:1.6;">
                Your session is confirmed and your meeting link is ready. Click the button below to join at the scheduled time.
              </p>
            </td>
          </tr>

          <!-- Meeting Link Button -->
          <tr>
            <td style="padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f4ee;border-radius:12px;border:1px solid #c5dfd0;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 16px 0;font-size:13px;font-weight:700;color:#2d4a3e;">Join Your Session</p>
                    <a href="${meetingLink}" style="display:inline-block;background:#2d4a3e;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:10px;">
                      Join Meeting →
                    </a>
                    <p style="margin:12px 0 0 0;font-size:11px;color:#3d6b52;word-break:break-all;">${meetingLink}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Session Details -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;border-radius:12px;border:1px solid #e8e0d0;overflow:hidden;">
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e8e0d0;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#8a7560;letter-spacing:1.5px;text-transform:uppercase;">Session Details</p>
                  </td>
                </tr>
                ${[
                  ["Booking ID", `#${shortId}`],
                  ["Service", service?.name || "—"],
                  ["Duration", service?.duration || "—"],
                  ["Date", formatDate(date)],
                  ["Time", time],
                ].map(([label, value], i, arr) => `
                <tr>
                  <td style="padding:12px 24px;${i < arr.length - 1 ? "border-bottom:1px solid #e8e0d0;" : ""}">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#8a7560;width:40%;">${label}</td>
                        <td style="font-size:13px;font-weight:600;color:#1a2e25;text-align:right;">${value}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          ${adminNote ? `
          <!-- Admin Note -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf0;border-radius:12px;border:1px solid #f0e0b0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;color:#8a7560;letter-spacing:1.5px;text-transform:uppercase;">Note from your coach</p>
                    <p style="margin:0;font-size:13px;color:#5a4a2a;line-height:1.7;">${adminNote}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ""}

          <!-- Tips -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1a2e25;">Before your session</p>
              <p style="margin:0 0 6px 0;font-size:13px;color:#4a5568;line-height:1.6;">📋 &nbsp;Have your CV or relevant materials ready to share.</p>
              <p style="margin:0 0 6px 0;font-size:13px;color:#4a5568;line-height:1.6;">🎧 &nbsp;Test your audio and video a few minutes before.</p>
              <p style="margin:0;font-size:13px;color:#4a5568;line-height:1.6;">💬 &nbsp;Need to reschedule? Reply to this email at least 24 hours before.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0ebe0;padding:24px 40px;text-align:center;border-top:1px solid #e8e0d0;">
              <p style="margin:0 0 4px 0;font-size:12px;color:#8a7560;">Career Decipher &nbsp;·&nbsp; careerdecipher.com</p>
              <p style="margin:0;font-size:11px;color:#b0a090;">You're receiving this because you have an upcoming session with us.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendMeetingInvite({ booking, meetingLink, adminNote }) {
  const { customer, service, date, time } = booking;
  const shortId = booking.id?.slice(0, 8).toUpperCase();
  const formattedDate = formatDate(date);

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

  await transporter.sendMail({
    from: `"Career Decipher" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: customer.email,
    subject: `Your Meeting Link — ${service?.name} on ${formattedDate}`,
    text: `Hi ${customer.name},\n\nYour meeting link is ready!\n\nJoin here: ${meetingLink}\n\nSession Details:\nBooking ID: #${shortId}\nService: ${service?.name}\nDate: ${formattedDate}\nTime: ${time}\n${adminNote ? `\nNote from your coach:\n${adminNote}\n` : ""}\nSee you soon!\nCareer Decipher`,
    html: buildHtml({ booking, meetingLink, adminNote }),
  });

  console.log(`📅 Meeting invite sent to ${customer.email} — Booking #${shortId}`);
}