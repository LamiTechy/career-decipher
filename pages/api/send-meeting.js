import { getBookingById } from "../../lib/bookings";
import { sendMeetingInvite } from "../../lib/sendMeetingEmail";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { bookingId, meetingLink, adminNote } = req.body;

  if (!bookingId || !meetingLink) {
    return res.status(400).json({ success: false, error: "bookingId and meetingLink are required" });
  }

  // Basic URL validation
  try {
    new URL(meetingLink);
  } catch {
    return res.status(400).json({ success: false, error: "Invalid meeting link URL" });
  }

  const booking = getBookingById(bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, error: "Booking not found" });
  }

  try {
    await sendMeetingInvite({ booking, meetingLink, adminNote: adminNote?.trim() || "" });
    return res.status(200).json({ success: true, message: `Meeting invite sent to ${booking.customer.email}` });
  } catch (err) {
    console.error("Failed to send meeting invite:", err.message);
    return res.status(500).json({ success: false, error: "Failed to send email. Check your SMTP config." });
  }
}