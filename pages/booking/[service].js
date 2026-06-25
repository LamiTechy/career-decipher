import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { ArrowLeft, CheckCircle2, ShieldCheck, Check } from "lucide-react";
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

const getSteps = (isShortlet) => {
  const baseSteps = ["Service", "Date & Time", "Your Info", "Payment", "Confirm"];
  if (isShortlet) {
    return ["Service", "Select Apartment", "Check-in Date", "Your Info", "Payment", "Confirm"];
  }
  return baseSteps;
};

export default function ServiceBooking() {
  const router = useRouter();
  const { service } = router.query;

  const mainService = mainServices.find((s) => s.slug === service);
  const detailedService = detailedServices.find((s) => s.id === service);

  const serviceData = {
    name: detailedService?.name || mainService?.name,
    displayName: mainService?.displayName || detailedService?.name || mainService?.name,
    description: detailedService?.description || mainService?.description,
    shortDesc: detailedService?.shortDesc || mainService?.shortDesc,
    price: detailedService?.price ?? mainService?.price,    currency: detailedService?.currency || mainService?.currency || "CAD",    duration: detailedService?.duration || mainService?.duration,
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
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [apartmentAvailability, setApartmentAvailability] = useState({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", details: "" });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasVerifiedSession = useRef(false);

  const BOOKING_STATE_KEY = "career_decipher_booking_state";

  const saveBookingState = (state) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(BOOKING_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Unable to save booking state", error);
    }
  };

  const loadBookingState = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(BOOKING_STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Unable to load booking state", error);
      return null;
    }
  };

  const clearBookingState = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(BOOKING_STATE_KEY);
    } catch (error) {
      console.warn("Unable to clear booking state", error);
    }
  };

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
    const isShortlet = service === "shortlet";
    if (isShortlet) {
      if (step === 2) return !!selectedApartment;
      if (step === 3) return !!selectedDate;
      if (step === 4) return form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      if (step === 5) return paymentStatus === "paid";
    } else {
      if (step === 2) return !!selectedDate && !!selectedTime;
      if (step === 3) return form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      if (step === 4) return paymentStatus === "paid";
    }
    return true;
  };

  const checkApartmentAvailability = async (apartmentId, date) => {
    try {
      const res = await fetch("/api/apartments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentId, date: date.toISOString().split("T")[0] }),
      });
      const data = await res.json();
      return data.available;
    } catch (err) {
      console.error("Availability check failed:", err);
      return false;
    }
  };

  const handleApartmentSelect = async (apartment) => {
    if (selectedDate) {
      const isAvailable = await checkApartmentAvailability(apartment.id, selectedDate);
      if (!isAvailable) {
        toast.error("This apartment is already booked for the selected date.");
        return;
      }
    }
    setSelectedApartment(apartment);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const handlePayment = async () => {
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please complete your name and email before paying.");
      setStep(3);
      return;
    }

    if (service === "shortlet" && !selectedApartment) {
      toast.error("Please select an apartment before paying.");
      setStep(2);
      return;
    }

    saveBookingState({
      service: serviceData,
      selectedDate: selectedDate?.toISOString(),
      selectedTime,
      customer: form,
      selectedApartment,
    });

    setLoading(true);
    setPaymentError(null);

    try {
      const price = service === "shortlet" && selectedApartment ? selectedApartment.price : serviceData.price;
      const amount = Math.round(price * 100);
      const successUrl = `${origin}/booking/${service}?sessionId={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/booking/${service}`;

      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: serviceData.name,
          phone: form.phone,
          amount,
          currency: (serviceData.currency || "CAD").toLowerCase(),
          successUrl,
          cancelUrl,
        }),
      });

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Unable to initialize payment.");
      }

      window.location.href = data.url;
    } catch (err) {
      setPaymentError(err.message || "Unable to start payment.");
      toast.error(err.message || "Unable to start payment.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    setPaymentError(null);

    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verify: true, sessionId }),
      });
      const data = await res.json();

      if (!data.status) {
        throw new Error(data.message || "Payment verification failed.");
      }

      setPaymentStatus("paid");
      await completeBooking();
    } catch (err) {
      setPaymentError(err.message || "Unable to verify payment.");
      toast.error(err.message || "Unable to verify payment.");
    } finally {
      setLoading(false);
    }
  };

  const completeBooking = async () => {
    setLoading(true);
    const isShortlet = service === "shortlet";
    
    try {
      const bookingData = {
        service: {
          ...serviceData,
          ...(isShortlet && selectedApartment && { apartment: selectedApartment }),
        },
        date: selectedDate?.toISOString(),
        time: selectedTime || "N/A",
        customer: form,
        paymentStatus: "paid",
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      const data = await res.json();
      if (data.success) {
        setBooking(data.booking);
        const finalStep = isShortlet ? 6 : 5;
        setStep(finalStep);
        toast.success("Booking confirmed! Check your email.");
      } else {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      toast.error(err.message || "Unable to complete booking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const { sessionId } = router.query;

    if (sessionId && !hasVerifiedSession.current) {
      const savedState = loadBookingState();
      if (savedState) {
        setSelectedDate(savedState.selectedDate ? new Date(savedState.selectedDate) : null);
        setSelectedTime(savedState.selectedTime || null);
        setForm(savedState.customer || { name: "", email: "", phone: "", details: "" });
      }
      setStep(4);
      verifyPayment(sessionId);
      hasVerifiedSession.current = true;
    }
  }, [router.isReady, router.query]);

  // Load apartments for shortlet service
  useEffect(() => {
    const isShortlet = service === "shortlet";
    if (isShortlet) {
      fetch("/api/apartments")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setApartments(data.apartments);
          }
        })
        .catch((err) => console.error("Failed to load apartments:", err));
    }
  }, [service]);

  const availabilityLabel = selectedDate
    ? isWeekend(selectedDate)
      ? "Available times: Saturday & Sunday, 9:00 AM – 6:00 PM"
      : "Available times: Monday – Friday, 4:30 PM – 7:00 PM"
    : "Select a date to see available times";

  const handleConfirm = async () => {
    const paymentStep = service === "shortlet" ? 5 : 4;
    if (step === paymentStep && paymentStatus !== "paid") {
      toast.error("Please complete payment before confirming your booking.");
      return;
    }

    await completeBooking();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";

  return (
    <>
      <Head>
        <title>Book {serviceData.displayName} - Hanot Hub</title>
        <meta name="description" content={`Book your ${serviceData.displayName} session with Hanot Hub`} />
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
          {step < (service === "shortlet" ? 6 : 5) && (
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              {getSteps(service === "shortlet").map((s, i) => {
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
                    {i < getSteps(service === "shortlet").length - 2 && <span className="text-cream-200 text-lg">→</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 1: Service Overview */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h2 className="font-display text-2xl font-bold text-slate-850 mb-3">{serviceData.displayName}</h2>
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

          {/* STEP 2: Select Apartment (Shortlet only) */}
          {service === "shortlet" && step === 2 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h2 className="font-display text-2xl font-bold text-slate-850 mb-2">Select an Apartment</h2>
              <p className="text-slate-850/50 text-sm mb-6">Choose your preferred apartment</p>
              <div className="grid md:grid-cols-2 gap-6">
                {apartments.map((apartment) => (
                  <div
                    key={apartment.id}
                    onClick={() => handleApartmentSelect(apartment)}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedApartment?.id === apartment.id
                        ? "border-forest-500 bg-forest-500/5"
                        : "border-cream-200 hover:border-forest-400"
                    }`}
                  >
                    <div className="text-4xl mb-3">{apartment.image}</div>
                    <h3 className="font-semibold text-slate-850 mb-2">{apartment.name}</h3>
                    <p className="text-sm text-slate-700 mb-3">{apartment.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{apartment.bedrooms}BR • {apartment.location}</span>
                      <span className="font-bold text-forest-600">${apartment.price}/night</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2/3: Date & Time */}
          {step === (service === "shortlet" ? 3 : 2) && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h2 className="font-display text-2xl font-bold text-slate-850 mb-2">
                {service === "shortlet" ? "Pick Your Check-in Date" : "Pick a Date & Time"}
              </h2>
              <p className="text-slate-850/50 text-sm mb-6">
                {service === "shortlet" 
                  ? "Select when you'd like to check in" 
                  : "All times shown in Eastern Time (EST)"}
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold text-slate-850 mb-3 text-sm">Select Date</p>
                  <div className="bg-cream-50 rounded-xl p-4">
                    <Calendar
                      onChange={(date) => {
                        setSelectedDate(date);
                        if (service === "shortlet" && selectedApartment) {
                          checkApartmentAvailability(selectedApartment.id, date);
                        }
                      }}
                      value={selectedDate}
                      minDate={new Date()}
                      tileDisabled={({ date }) => isDateInPast(date)}
                    />
                  </div>
                </div>
                {service !== "shortlet" && (
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
                )}
              </div>
            </div>
          )}

          {/* STEP 3/4: Contact Info */}
          {step === (service === "shortlet" ? 4 : 3) && (
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

          {/* STEP 4/5: Payment */}
          {step === (service === "shortlet" ? 5 : 4) && (
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
                    <p className="font-medium text-slate-850">{serviceData.displayName}</p>
                    {service === "shortlet" && selectedApartment && (
                      <>
                        <p className="text-xs text-slate-700 mt-1">{selectedApartment.name}</p>
                        <p className="text-slate-850/50 text-xs">Check-in: {formatDate(selectedDate)}</p>
                      </>
                    )}
                    {service !== "shortlet" && (
                      <p className="text-slate-850/50 text-xs">{serviceData.duration} • {formatDate(selectedDate)} at {selectedTime}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-forest-600 text-lg">
                      ${selectedApartment?.price || serviceData.price}
                    </p>
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
                      Choose Stripe to complete your payment using a secure checkout.
                    </p>
                    {paymentError && (
                      <p className="mt-3 text-sm text-red-600">{paymentError}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handlePayment("stripe")}
                    disabled={loading}
                    className="w-full py-4 bg-forest-500 hover:bg-forest-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                  >
                    {loading ? "Redirecting to payment…" : "Pay with Stripe"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 5/6: Confirmation */}
          {step === (service === "shortlet" ? 6 : 5) && (
            <div className="bg-white rounded-2xl border border-cream-200 p-10 text-center">
              <div className="w-20 h-20 bg-forest-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-forest-700">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-850 mb-2">You're all booked!</h2>
              <p className="text-slate-850/60 mb-8">A confirmation has been sent to <strong>{form.email}</strong></p>

              <div className="bg-cream-50 rounded-2xl p-6 text-left border border-cream-200 mb-8">
                <h3 className="font-semibold text-slate-850 mb-4 text-sm uppercase tracking-wide">Booking Details</h3>
                <div className="space-y-3">
                  {service === "shortlet" && selectedApartment ? (
                    [
                      ["Service", serviceData.displayName],
                      ["Apartment", selectedApartment.name],
                      ["Location", selectedApartment.location],
                      ["Check-in Date", formatDate(selectedDate)],
                      ["Price per Night", `$${selectedApartment.price}`],
                      ["Status", "Confirmed"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-slate-850/50">{label}</span>
                        <span className="font-medium text-slate-850">{value}</span>
                      </div>
                    ))
                  ) : (
                    [
                      ["Service", serviceData.displayName],
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
                    ))
                  )}
                </div>
              </div>

              <Link href="/" className="inline-flex px-8 py-3 border-2 border-forest-500 text-forest-600 rounded-xl font-semibold hover:bg-forest-500 hover:text-white transition-all">
                Back to Home
              </Link>
            </div>
          )}

          {/* Navigation */}
          {step < (service === "shortlet" ? 6 : 5) && (
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="px-6 py-3 bg-cream-100 hover:bg-cream-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-850 rounded-xl font-medium transition-all"
              >
                ← Back
              </button>
              {step < (service === "shortlet" ? 5 : 4) ? (
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
