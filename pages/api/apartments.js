import { mainServices } from "../../data/mainServices";
import sql from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const shortletService = mainServices.find((s) => s.id === "shortlet");
      if (!shortletService) {
        return res.status(404).json({ success: false, error: "Shortlet service not found" });
      }
      return res.status(200).json({ success: true, apartments: shortletService.apartments });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === "POST") {
    const { apartmentId, date } = req.body;

    if (!apartmentId || !date) {
      return res.status(400).json({ success: false, error: "Missing apartmentId or date" });
    }

    try {
      // Check if apartment is already booked for this date
      const bookings = await sql`
        SELECT * FROM bookings 
        WHERE (service->'id')::text = '"shortlet"'
        AND (service->'apartment'->>'id')::text = ${apartmentId}
        AND date = ${date}
        AND status != 'cancelled'
      `;

      if (bookings.length > 0) {
        return res.status(200).json({ 
          success: true, 
          available: false, 
          message: "Apartment already booked for this date" 
        });
      }

      return res.status(200).json({ 
        success: true, 
        available: true, 
        message: "Apartment is available" 
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
