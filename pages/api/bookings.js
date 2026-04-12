import { getBookings, saveBooking, updateBookingStatus } from "../../lib/bookings";
import { v4 as uuidv4 } from "uuid";
import { sendBookingConfirmation } from "../../lib/sendBookingEmail";

export default function handler(req, res) {
  if (req.method === "GET") {
    const bookings = getBookings();
    return res.status(200).json({ success: true, bookings });
  }

  if (req.method === "POST") {
    const { service, date, time, customer, paymentStatus } = req.body;

    if (!service || !date || !time || !customer?.name || !customer?.email) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const booking = {
      id: uuidv4(),
      service,
      date,
      time,
      customer,
      paymentStatus: paymentStatus || "paid",
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveBooking(booking);

    // Send confirmation email (non-blocking — don't fail the booking if email fails)
    sendBookingConfirmation(booking).catch((err) => {
      console.error("Failed to send confirmation email:", err.message);
    });

    return res.status(200).json({ success: true, booking });
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body;
    const valid = ["confirmed", "pending", "completed", "cancelled"];
    if (!id || !valid.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid ID or status" });
    }
    const updated = updateBookingStatus(id, status);
    if (!updated) return res.status(404).json({ success: false, error: "Booking not found" });
    return res.status(200).json({ success: true, booking: updated });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}