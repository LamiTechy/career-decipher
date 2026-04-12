#!/usr/bin/env node
/**
 * Seed script — populates data/bookings.json with realistic demo data
 * Run: node seed.js
 */

const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const services = [
  { id: "career-consultation", name: "Career Consultation", duration: "30 mins", price: 45 },
  { id: "resume-review", name: "Resume Review", duration: "30 mins", price: 45 },
  { id: "resume-cover-letter", name: "Resume & Cover Letter Review", duration: "1 hr", price: 70 },
  { id: "interview-prep", name: "Interview Preparation", duration: "1 hr", price: 70 },
  { id: "linkedin-optimization", name: "LinkedIn Optimization", duration: "Custom", price: null },
  { id: "mentorship", name: "On-the-Job Mentorship", duration: "1 hr", price: 120 },
  { id: "bundle-package", name: "Bundle Package", duration: "5 hrs", price: 250 },
];

const customers = [
  { name: "Amara Kessington", email: "amara.k@gmail.com", phone: "+1 (555) 123-4567", details: "Looking to transition from marketing into product management. 4 years experience." },
  { name: "James Okafor", email: "james.okafor@outlook.com", phone: "+1 (555) 234-5678", details: "Preparing for final round interviews at Google and Meta." },
  { name: "Fatima Adeyemi", email: "fatima.a@proton.me", phone: "", details: "Recently laid off, need help refreshing my resume and LinkedIn profile." },
  { name: "Chen Wei", email: "chen.wei@yahoo.com", phone: "+1 (555) 456-7890", details: "Senior engineer looking for VP-level roles. Need executive presence coaching." },
  { name: "Priya Sharma", email: "priya.sharma@gmail.com", phone: "+1 (555) 567-8901", details: "New grad looking to land first job in data science." },
  { name: "Marcus Johnson", email: "mjohnson@hotmail.com", phone: "+1 (555) 678-9012", details: "Returning to workforce after 2-year career break. Need full overhaul." },
  { name: "Yemi Adebayo", email: "yemi.adebayo@gmail.com", phone: "+1 (555) 789-0123", details: "Moving from Nigeria to Canada — need help positioning my experience for Canadian market." },
  { name: "Sarah O'Brien", email: "sarah.obrien@company.com", phone: "+1 (555) 890-1234", details: "Targeting FAANG companies specifically. 6 years of PM experience." },
];

const statuses = ["confirmed", "confirmed", "confirmed", "completed", "completed", "pending", "cancelled"];
const times = ["9:00 AM", "10:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

const bookings = customers.map((customer, i) => ({
  id: randomUUID(),
  service: randomFrom(services),
  date: daysFromNow(i < 4 ? i + 1 : -(i - 3)),
  time: randomFrom(times),
  customer,
  paymentStatus: "paid",
  status: statuses[i % statuses.length],
  createdAt: daysFromNow(-(i + 1)),
  updatedAt: daysFromNow(-(i)),
}));

const outPath = path.join(__dirname, "data", "bookings.json");
fs.writeFileSync(outPath, JSON.stringify(bookings, null, 2));
console.log(`✅ Seeded ${bookings.length} demo bookings to ${outPath}`);
console.log(`💰 Total revenue: $${bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.service.price || 0), 0)}`);
