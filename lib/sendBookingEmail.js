import nodemailer from "nodemailer";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildHtml(booking) {
  const { id, service, date, time, customer } = booking;
  const shortId = id?.slice(0, 8).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed</title>
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
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">Booking Confirmed ✓</h1>
              <p style="margin:12px 0 0 0;font-size:14px;color:#a8c5b5;">Your session is locked in. We're looking forward to working with you.</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <p style="margin:0;font-size:16px;color:#1a2e25;">Hi <strong>${customer.name}</strong>,</p>
              <p style="margin:12px 0 0 0;font-size:14px;color:#4a5568;line-height:1.6;">
                Your booking has been confirmed and payment received. Here's everything you need to know about your upcoming session.
              </p>
            </td>
          </tr>

          <!-- Booking Details Card -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;border-radius:12px;border:1px solid #e8e0d0;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e8e0d0;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#8a7560;letter-spacing:1.5px;text-transform:uppercase;">Booking Details</p>
                  </td>
                </tr>
                ${[
                  ["Booking ID", `#${shortId}`],
                  ["Service", service?.name || "—"],
                  ["Duration", service?.duration || "—"],
                  ["Date", formatDate(date)],
                  ["Time", time],
                  ["Status", "Confirmed"],
                ].map(([label, value], i, arr) => `
                <tr>
                  <td style="padding:14px 24px;${i < arr.length - 1 ? "border-bottom:1px solid #e8e0d0;" : ""}">
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

          <!-- What to Expect -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f4ee;border-radius:12px;border:1px solid #c5dfd0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;color:#2d4a3e;">What to expect</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:#3d6b52;line-height:1.6;">
                      📅 &nbsp;You'll receive a calendar invite with a meeting link shortly.
                    </p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:#3d6b52;line-height:1.6;">
                      📋 &nbsp;Come prepared with any questions, your CV, or relevant materials.
                    </p>
                    <p style="margin:0;font-size:13px;color:#3d6b52;line-height:1.6;">
                      💬 &nbsp;Need to reschedule? Reply to this email at least 24 hours in advance.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding:0 40px 32px 40px;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#8a7560;">Confirmation sent to:</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#1a2e25;">${customer.name} &nbsp;·&nbsp; ${customer.email}${customer.phone ? ` &nbsp;·&nbsp; ${customer.phone}` : ""}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0ebe0;padding:24px 40px;text-align:center;border-top:1px solid #e8e0d0;">
              <p style="margin:0 0 4px 0;font-size:12px;color:#8a7560;">Career Decipher &nbsp;·&nbsp; careerdecipher.com</p>
              <p style="margin:0;font-size:11px;color:#b0a090;">You're receiving this because you made a booking on our platform.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendBookingConfirmation(booking) {
  const { customer, service, time, date } = booking;

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,  // your Brevo login email
      pass: process.env.BREVO_SMTP_KEY,   // SMTP key from Brevo dashboard
    },
  });

  const shortId = booking.id?.slice(0, 8).toUpperCase();
  const formattedDate = formatDate(date);

  await transporter.sendMail({
    from: `"Career Decipher" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: customer.email,
    subject: `Booking Confirmed — ${service?.name} on ${formattedDate} ✓`,
    text: `Hi ${customer.name},\n\nYour booking is confirmed!\n\nBooking ID: #${shortId}\nService: ${service?.name}\nDuration: ${service?.duration}\nDate: ${formattedDate}\nTime: ${time}\nStatus: Confirmed\n\nIf you need to reschedule, reply to this email at least 24 hours in advance.\n\nCareer Decipher`,
    html: buildHtml(booking),
  });

  console.log(`📧 Confirmation email sent to ${customer.email} — Booking #${shortId}`);
}