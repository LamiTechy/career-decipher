import { v4 as uuidv4 } from "uuid";
import sql from "../../lib/db";
import { sendBookingConfirmation } from "../../lib/sendBookingEmail";

export default async function handler(req, res) {

  if (req.method === "GET") {
    try {
      const bookings = await sql`
        SELECT * FROM bookings ORDER BY created_at DESC
      `;
      return res.status(200).json({ success: true, bookings });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === "POST") {
    const { service, date, time, customer, paymentStatus } = req.body;

    if (!service || !date || !time || !customer?.name || !customer?.email) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    try {
      const [booking] = await sql`
        INSERT INTO bookings (id, service, date, time, customer, payment_status, status, created_at, updated_at)
        VALUES (
          ${id},
          ${JSON.stringify(service)},
          ${date},
          ${time},
          ${JSON.stringify(customer)},
          ${paymentStatus || "paid"},
          'confirmed',
          ${now},
          ${now}
        )
        RETURNING *
      `;

      // Send confirmation email (non-blocking)
      sendBookingConfirmation(booking).catch((err) => {
        console.error("Failed to send confirmation email:", err.message);
      });

      return res.status(200).json({ success: true, booking });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body;
    const valid = ["confirmed", "pending", "completed", "cancelled"];
    if (!id || !valid.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid ID or status" });
    }

    try {
      const [booking] = await sql`
        UPDATE bookings
        SET status = ${status}, updated_at = ${new Date().toISOString()}
        WHERE id = ${id}
        RETURNING *
      `;
      if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });
      return res.status(200).json({ success: true, booking });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}