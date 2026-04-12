import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

export function getBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(BOOKINGS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  return booking;
}

export function getBookingById(id) {
  const bookings = getBookings();
  return bookings.find((b) => b.id === id) || null;
}

export function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx !== -1) {
    bookings[idx].status = status;
    bookings[idx].updatedAt = new Date().toISOString();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
    return bookings[idx];
  }
  return null;
}
