import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Check } from "lucide-react";
import { mainServices } from "../../data/mainServices";
import { services as detailedServices } from "../../data/services";

const Calendar = dynamic(() => import("react-calendar"), { ssr: false });

const WEEKDAY_SLOTS = ["4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM"];
const WEEKEND_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM",
];

const STEPS = ["Service", "Date & Time", "Your Info", "Payment", "Confirm"];

export default function ServiceBooking() {
  const router = useRouter();
  const { service } = router.query;

  const mainService = mainServices.find((s) => s.slug === service);
  const detailedService = detailedServices.find((s) => s.id === service);

  const serviceData = {
    name: detailedService?.name || mainService?.name,
    description: detailedService?.description || mainService?.description,
    shortDesc: detailedService?.shortDesc || mainService?.shortDesc,
    price: detailedService?.price ?? mainService?.price,
    duration: detailedService?.duration || mainService?.duration,
    highlights: detailedService?.highlights || mainService?.highlights || [],
    includes: mainService?.includes || detailedService?.highlights || [],
    benefits: mainService?.benefits || [],
    faq: mainService?.faq || [],
    caseStudies: mainService?.caseStudies || [],
    slug: mainService?.slug || detailedService?.id,
  };

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", details: "" });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState("paystack");

  if (!router.isReady || !serviceData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-700">Loading...</p>
      </div>
    );
  }

  const isWeekend = (date) => [0, 6].includes(date.getDay());
  const getAvailableTimeSlots = (date) => {
    if (!date) return [];
    return isWeekend(date) ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
  };
  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const check = new Date(date);
    check.setHours(0, 0, 0, 0);
    return check < today;
  };

  const canProceed = () => {
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (step === 4) return paymentStatus === "paid";
    return true;
  };

  const availabilityLabel = selectedDate
    ? isWeekend(selectedDate)
      ? "Available times: Saturday & Sunday, 9:00 AM – 6:00 PM"
      : "Available times: Monday – Friday, 4:30 PM – 7:00 PM"
    : "Select a date to see available times";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: serviceData,
          date: selectedDate?.toISOString(),
          time: selectedTime,
          customer: form,
          paymentStatus: "paid",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBooking(data.booking);
        setStep(5);
        toast.success("Booking confirmed! Check your email.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";

  return (
    <>
      <Head>
        <title>Book {serviceData.name} - Career Decipher</title>
        <meta name="description" content={`Book your ${serviceData.name} session with Career Decipher`} />
      </Head>

      <section className="min-h-screen bg-cream-50 pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <Link href="/services" className="inline-flex items-center gap-1 text-forest-500 hover:text-forest-600 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>

          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-bold text-slate-850 mb-2">Book Your Session</h1>
            <p className="text-slate-850/60">Complete the steps below to confirm your booking</p>
          </div>

          {/* Step indicator */}
          {step < 5 && (
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              {STEPS.map((s, i) => {
                const num = i + 1;
                const isActive = num === step;
                const isDone = num < step;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isActive ? "bg-forest-500 text-white" :
                      isDone ? "bg-forest-500/20 text-forest-600" :
                      "bg-cream-200 text-slate-850/40"
                    }`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive ? "bg-white text-forest-500" :
                        isDone ? "bg-forest-500 text-white" :
                        "bg-cream-200 text-slate-850/40"
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : num}
                      </span>
                      {s}
                    </div>
                    {i < STEPS.length - 2 && <span className="text-cream-200 text-lg">→</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 1: Service Overview */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h2 className="font-display text-2xl font-bold text-slate-850 mb-3">{serviceData.name}</h2>
              <p className="text-slate-700 mb-6">{serviceData.description}</p>

              {serviceData.highlights.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-850 mb-3">Highlights</h3>
                  <div className="grid gap-3">
                    {serviceData.highlights.map((item) => (
                      <div key={item} className="rounded-2xl bg-cream-50 p-4 border border-cream-200 text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {serviceData.includes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-850 mb-3">What’s included</h3>
                  <ul className="grid gap-2 text-slate-700">
                    {serviceData.includes.map((item) => (
                      <li key={item} className="rounded-2xl bg-cream-50 p-3 border border-cream-200">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl bg-cream-50 p-6 border border-cream-200">
                <p className="font-semibold text-slate-850 mb-2">Ready to book?</p>
                <p className="text-slate-700 text-sm">Continue to appointment selection and fill your details on the next screen.</p>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Time */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h2 className="font-display text-2xl font-bold text-slate-850 mb-2">Pick a Date & Time</h2>
              <p className="text-slate-850/50 text-sm mb-6">All times shown in Eastern Time (EST)</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold text-slate-850 mb-3 text-sm">Select Date</p>
                  <div className="bg-cream-50 rounded-xl p-4">
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      minDate={new Date()}
                      tileDisabled={({ date }) => isDateInPast(date)}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-850 mb-3 text-sm">
                    {availabilityLabel}
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {getAvailableTimeSlots(selectedDate).map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        disabled={!selectedDate}
                        className={`py-2.5 px-3 text-sm rounded-lg border font-medium transition-all ${
                          selectedTime === t
                            ? "border-forest-500 bg-forest-500 text-white"
                            : !selectedDate
                            ? "border-cream-200 text-slate-850/30 cursor-not-allowed"
                            : "border-cream-200 hover:border-forest-400 text-slate-850 hover:bg-cream-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Contact Info */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h2 className="font-display text-2xl font-bold text-slate-850 mb-6">Your Information</h2>
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-850 mb-2">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:border-forest-400 focus:ring-2 focus:ring-forest-500/20 outline-none text-sm transition-all bg-cream-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-850 mb-2">Email Address *</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:border-forest-400 focus:ring-2 focus:ring-forest-500/20 outline-none text-sm transition-all bg-cream-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-850 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:border-forest-400 focus:ring-2 focus:ring-forest-500/20 outline-none text-sm transition-all bg-cream-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-850 mb-2">
                    Tell us about your situation / goals
                  </label>
                  <textarea
                    rows={4}
                    placeholder="I'm looking to transition from marketing to product management. I have 4 years of experience and..."
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:border-forest-400 focus:ring-2 focus:ring-forest-500/20 outline-none text-sm transition-all bg-cream-50 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Payment */}
          {step === 4 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h2 className="font-display text-2xl font-bold text-slate-850 mb-2">Payment</h2>
              <div className="flex items-center gap-2 text-xs text-slate-850/50 mb-6">
                <ShieldCheck className="w-4 h-4" /> Secure payment processing
              </div>

              {/* Order summary */}
              <div className="bg-cream-50 rounded-xl p-5 mb-6 border border-cream-200">
                <p className="text-sm font-semibold text-slate-850 mb-3">Order Summary</p>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-slate-850">{serviceData.name}</p>
                    <p className="text-slate-850/50 text-xs">{serviceData.duration} • {formatDate(selectedDate)} at {selectedTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-forest-600 text-lg">${serviceData.price}</p>
                  </div>
                </div>
              </div>

              {paymentStatus === "paid" ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4 text-forest-700">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="font-semibold text-gold-700 text-lg">Payment Successful!</p>
                  <p className="text-sm text-slate-850/60 mt-1">Proceed to confirm your booking</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
                    <p className="font-semibold text-slate-850 mb-2">Payment method</p>
                    <p className="text-sm text-slate-850/70">
                      Payment processing will be integrated with Paystack or Stripe on next update.
                    </p>
                  </div>
                  <button
                    onClick={() => setPaymentStatus("paid")}
                    className="w-full py-4 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-semibold transition-all"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Confirmation */}
          {step === 5 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-10 text-center">
              <div className="w-20 h-20 bg-forest-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-forest-700">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-850 mb-2">You're all booked!</h2>
              <p className="text-slate-850/60 mb-8">A confirmation has been sent to <strong>{form.email}</strong></p>

              <div className="bg-cream-50 rounded-2xl p-6 text-left border border-cream-200 mb-8">
                <h3 className="font-semibold text-slate-850 mb-4 text-sm uppercase tracking-wide">Booking Details</h3>
                <div className="space-y-3">
                  {[
                    ["Service", serviceData.name],
                    ["Date", formatDate(selectedDate)],
                    ["Time", selectedTime],
                    ["Duration", serviceData.duration],
                    ["Amount Paid", `$${serviceData.price}`],
                    ["Status", "Confirmed"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-850/50">{label}</span>
                      <span className="font-medium text-slate-850">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/" className="inline-flex px-8 py-3 border-2 border-forest-500 text-forest-600 rounded-xl font-semibold hover:bg-forest-500 hover:text-white transition-all">
                Back to Home
              </Link>
            </div>
          )}

          {/* Navigation */}
          {step < 5 && (
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="px-6 py-3 bg-cream-100 hover:bg-cream-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-850 rounded-xl font-medium transition-all"
              >
                ← Back
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="px-8 py-3 bg-forest-500 hover:bg-forest-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={!canProceed() || loading}
                  className="px-8 py-3 bg-forest-500 hover:bg-forest-600 disabled:opacity-40 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Confirming…
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Booking
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
