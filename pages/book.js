import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { services } from "../data/services";
import { CheckCircle2, AlertTriangle, ShieldCheck, Check, Compass, FileText, FileCheck, Mail, Target, Link2, Leaf, Package, Circle } from "lucide-react";

const Calendar = dynamic(() => import("react-calendar"), { ssr: false });

const ICON_MAP = {
  Compass,
  FileText,
  FileCheck,
  Mail,
  Target,
  Link2,
  Leaf,
  Package,
  Circle,
};

const WEEKDAY_SLOTS = [
  "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM",
];
const WEEKEND_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM",
];

const STEPS = ["Service", "Date & Time", "Your Info", "Payment", "Confirm"];
const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || "";
const defaultUsdToNgnRate = Number(process.env.NEXT_PUBLIC_USD_TO_NGN_RATE) || 1500;

export default function Book() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", details: "" });
  const [paymentStatus, setPaymentStatus] = useState(null); // null | "processing" | "paid" | "error"
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState("paystack");
  const [paystackReady, setPaystackReady] = useState(false);
  const [cardForm, setCardForm] = useState({ name: "" });
  const [usdToNgnRate, setUsdToNgnRate] = useState(defaultUsdToNgnRate);
  const [rateSource, setRateSource] = useState(process.env.NEXT_PUBLIC_USD_TO_NGN_RATE ? "env" : "default");
  const paystackFormRef = useRef(null);

  useEffect(() => {
    if (router.query.service) {
      const svc = services.find((s) => s.id === router.query.service);
      if (svc) { setSelectedService(svc); setStep(2); }
    }
  }, [router.query]);

  // Handle Stripe redirect back to this page
  useEffect(() => {
    const { stripe, session_id } = router.query;
    if (!stripe) return;

    if (stripe === 'cancel') {
      setPaymentStatus(null);
      toast('Payment cancelled.');
      router.replace('/book', undefined, { shallow: true });
      return;
    }

    if (stripe === 'success' && session_id) {
      setPaymentStatus('processing');
      fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verify: true, sessionId: session_id }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.status) {
            setPaymentStatus('paid');
            setStep(5);
            toast.success('Payment successful! Confirming your booking…');
          } else {
            setPaymentStatus('error');
            toast.error('Payment verification failed. Please contact support.');
          }
        })
        .catch(() => {
          setPaymentStatus('error');
          toast.error('Could not verify payment. Please contact support.');
        })
        .finally(() => {
          router.replace('/book', undefined, { shallow: true });
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.stripe, router.query.session_id]);

  useEffect(() => {
    if (!paystackFormRef.current || typeof window === "undefined") return;

    const existingScript = paystackFormRef.current.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.type = "text/javascript";
      script.onload = () => {
        setPaystackReady(true);
        console.log("Paystack inline script loaded inside hidden form.");
      };
      script.onerror = () => {
        toast.error("Unable to load Paystack checkout. Please refresh the page.");
        console.error("Paystack inline script failed to load.");
      };
      paystackFormRef.current.appendChild(script);
    } else if (window.PaystackPop) {
      setPaystackReady(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchRate = async () => {
      try {
        const response = await fetch("/api/exchange-rate");
        const data = await response.json();

        if (data.status && data.rate && !Number.isNaN(Number(data.rate))) {
          setUsdToNgnRate(Number(data.rate));
          setRateSource(data.source || "live");
          console.log("Loaded USD to NGN rate:", data.rate, "source:", data.source);
        } else {
          console.warn("Exchange rate fetch failed, using fallback rate.", data);
        }
      } catch (error) {
        console.warn("Unable to fetch exchange rate, using fallback rate.", error);
      }
    };

    fetchRate();
  }, []);

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
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (step === 4) return paymentStatus === "paid";
    return true;
  };

  const getPaystackAmount = () => {
    const price = selectedService?.price ?? 0;
    const ngnAmount = Math.max(Math.round(price * usdToNgnRate * 100), 100);
    return ngnAmount;
  };

  // Human-readable NGN price for a given USD price
  const toNgnDisplay = (usdPrice) => {
    if (!usdPrice) return "Custom";
    const ngn = Math.round(usdPrice * usdToNgnRate);
    return `₦${ngn.toLocaleString("en-NG")}`;
  };

  const paymentButtonLabel = paymentGateway === "paystack" ? "Pay with Paystack" : "Pay with Stripe";
  const availabilityLabel = selectedDate
    ? isWeekend(selectedDate)
      ? "Available times: Saturday & Sunday, 9:00 AM – 6:00 PM"
      : "Available times: Monday – Friday, 4:30 PM – 7:00 PM"
    : "Select a date to see available times";

  const handlePaystackPayment = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please complete your name and email before paying.");
      return;
    }
    if (!paystackReady) {
      toast.error("Paystack is not ready yet. Please wait a moment.");
      console.error("Paystack not ready", { paystackReady, paystackFormRef: paystackFormRef.current });
      return;
    }

    setPaymentStatus("processing");

    try {
      if (!paystackPublicKey) {
        setPaymentStatus("error");
        toast.error("Paystack public key is not configured. Please add NEXT_PUBLIC_PAYSTACK_KEY to .env.local and restart the dev server.");
        return;
      }

      console.log("Paystack init request", {
        email: form.email,
        amount: getPaystackAmount(),
        paystackPublicKey,
      });
      const res = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone || "",
          amount: getPaystackAmount(),
        }),
      });
      const data = await res.json();
      console.log("Paystack init response", data, "window.PaystackPop", window.PaystackPop);

      if (!data.status || !window.PaystackPop) {
        setPaymentStatus("error");
        toast.error(data.message || "Unable to initialize Paystack payment.");
        return;
      }

      const paystack = window.PaystackPop;
      if (!paystack || !paystack.setup) {
        setPaymentStatus("error");
        toast.error("Paystack library failed to load. Please refresh the page.");
        return;
      }

      const amountValue = getPaystackAmount();
      console.log("Paystack amount", { responseAmount: data.amount, computedAmount: amountValue, type: typeof data.amount });

      const handler = paystack.setup({
        key: data.publicKey || paystackPublicKey,
        email: form.email,
        amount: amountValue,
        currency: "NGN",
        ref: data.reference,
        metadata: {
          custom_fields: [
            { display_name: "Full Name", variable_name: "full_name", value: form.name },
            { display_name: "Phone", variable_name: "phone", value: form.phone || "N/A" },
          ],
        },
        callback(response) {
          fetch("/api/paystack", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference, verify: true }),
          })
            .then((verifyRes) => verifyRes.json())
            .then((verifyData) => {
              if (verifyData.status) {
                setPaymentStatus("paid");
                toast.success("Payment successful! Please confirm your booking.");
              } else {
                setPaymentStatus("error");
                toast.error("Payment verification failed. Please try again.");
              }
            })
            .catch((verificationError) => {
              console.error("Paystack verification error", verificationError);
              setPaymentStatus("error");
              toast.error("Payment verification failed. Please try again.");
            });
        },
        onClose() {
          if (paymentStatus !== "paid") {
            setPaymentStatus(null);
            toast("Payment cancelled.");
          }
        },
      });

      console.log("Paystack handler created", handler);
      toast("Opening Paystack checkout...", { icon: "💳" });
      try {
        setTimeout(() => handler.openIframe(), 100);
      } catch (openError) {
        console.error("Paystack openIframe failed", openError);
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
          return;
        }
        setPaymentStatus("error");
        toast.error("Unable to open Paystack checkout. Please refresh and try again.");
      }
    } catch (error) {
      console.error("Paystack payment error", error);
      setPaymentStatus("error");
      toast.error("Unable to process payment. Please try again.");
    }
  };

  const handleStripePayment = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please complete your name and email before paying.");
      return;
    }

    setPaymentStatus("processing");

    try {
      // Convert NGN amount (kobo) → USD cents for Stripe
      const amountNgn = getPaystackAmount(); // already in kobo
      const amountUsd = Math.round((amountNgn / 100 / usdToNgnRate) * 100); // cents

      const origin = window.location.origin;
      const successUrl = `${origin}/book?stripe=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/book?stripe=cancel`;

      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone || "",
          amount: amountUsd,
          currency: "usd",
          successUrl,
          cancelUrl,
        }),
      });

      const data = await res.json();

      if (!data.status || !data.url) {
        setPaymentStatus("error");
        toast.error(data.message || "Unable to initialize Stripe payment.");
        return;
      }

      toast("Redirecting to Stripe checkout…", { icon: "💳" });
      window.location.href = data.url;
    } catch (error) {
      console.error("Stripe payment error", error);
      setPaymentStatus("error");
      toast.error("Unable to process payment. Please try again.");
    }
  };

  const handlePayment = async () => {
    if (paymentGateway === "stripe") {
      await handleStripePayment();
      return;
    }

    await handlePaystackPayment();
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: selectedService,
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
        <title>Book a Session – Career Decipher</title>
      </Head>

      <div className="min-h-screen bg-cream-50 pt-24 pb-16">
        <form ref={paystackFormRef} className="sr-only" aria-hidden="true"></form>
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
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

          {/* STEP 1: Service Selection */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-cream-200 p-8">
              <h2 className="font-display text-2xl font-bold text-slate-850 mb-6">Select a Service</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedService?.id === svc.id
                        ? "border-forest-500 bg-forest-500/5"
                        : "border-cream-200 hover:border-forest-300 hover:bg-cream-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-forest-500">
                        {(() => {
                          const ServiceIcon = ICON_MAP[svc.icon] || Circle;
                          return <ServiceIcon className="w-5 h-5" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-850 text-sm">{svc.name}</p>
                        <p className="text-xs text-slate-850/50 mt-0.5">{svc.duration}</p>
                      </div>
                      <span className="font-bold text-forest-600 text-sm shrink-0">
                        {svc.price ? `$${svc.price}` : "Custom"}
                      </span>
                    </div>
                  </button>
                ))}
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
                <ShieldCheck className="w-4 h-4" /> Nigerian clients pay in NGN via Paystack. International clients pay in USD via Stripe.
              </div>

              {/* Order summary */}
              <div className="bg-cream-50 rounded-xl p-5 mb-6 border border-cream-200">
                <p className="text-sm font-semibold text-slate-850 mb-3">Order Summary</p>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-slate-850">{selectedService?.name}</p>
                    <p className="text-slate-850/50 text-xs">{selectedService?.duration} • {formatDate(selectedDate)} at {selectedTime}</p>
                  </div>
                  <div className="text-right">
                    {paymentGateway === "paystack" ? (
                      <>
                        <p className="font-bold text-forest-600 text-lg leading-tight">{selectedService?.price ? `$${selectedService.price}` : "Custom"}</p>
                        {selectedService?.price && (
                          <p className="text-xs text-slate-850/40 mt-0.5">≈ ${selectedService.price} USD · converted for Paystack</p>
                        )}
                      </>
                    ) : (
                      <p className="font-bold text-forest-600 text-lg">{selectedService?.price ? `$${selectedService.price}` : "Custom"}</p>
                    )}
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
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className={`border rounded-2xl p-4 cursor-pointer transition-all ${paymentGateway === "paystack" ? "border-forest-500 bg-forest-500/5" : "border-cream-200 bg-white hover:border-forest-300"}`}>
                      <input
                        type="radio"
                        name="paymentGateway"
                        value="paystack"
                        checked={paymentGateway === "paystack"}
                        onChange={() => setPaymentGateway("paystack")}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-white flex items-center justify-center font-bold">P</div>
                        <div>
                          <p className="font-semibold text-slate-850">Paystack</p>
                          <p className="text-xs text-slate-850/60">Best for Nigerian customers.</p>
                        </div>
                      </div>
                    </label>

                    <label className={`border rounded-2xl p-4 cursor-pointer transition-all ${paymentGateway === "stripe" ? "border-slate-700 bg-slate-100" : "border-cream-200 bg-white hover:border-forest-300"}`}>
                      <input
                        type="radio"
                        name="paymentGateway"
                        value="stripe"
                        checked={paymentGateway === "stripe"}
                        onChange={() => setPaymentGateway("stripe")}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-850 text-white flex items-center justify-center font-bold">S</div>
                        <div>
                          <p className="font-semibold text-slate-850">Stripe</p>
                          <p className="text-xs text-slate-850/60">International cards via Stripe Checkout.</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
                    <p className="font-semibold text-slate-850 mb-2">Payment note</p>
                    <p className="text-sm text-slate-850/70">
                      Nigerian cards & bank transfers: use Paystack. International cards: use Stripe.
                    </p>
                  </div>

                  {paymentStatus === "error" && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Payment failed. Please try again.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={paymentStatus === "processing"}
                    className="w-full py-4 bg-forest-500 hover:bg-forest-600 disabled:opacity-60 text-white rounded-xl font-semibold transition-all"
                  >
                    {paymentStatus === "processing" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Processing…
                      </span>
                    ) : (
                      paymentButtonLabel
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Confirmation */}
          {step === 5 && booking && (
            <div className="bg-white rounded-2xl border border-cream-200 p-10 text-center">
              <div className="w-20 h-20 bg-forest-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-forest-700">
            <CheckCircle2 className="w-10 h-10" />
          </div>
              <h2 className="font-display text-3xl font-bold text-slate-850 mb-2">You're all booked!</h2>
              <p className="text-slate-850/60 mb-8">A confirmation has been sent to <strong>{booking.customer?.email}</strong></p>

              <div className="bg-cream-50 rounded-2xl p-6 text-left border border-cream-200 mb-8">
                <h3 className="font-semibold text-slate-850 mb-4 text-sm uppercase tracking-wide">Booking Details</h3>
                <div className="space-y-3">
                  {[
                    ["Booking ID", `#${booking.id?.slice(0, 8).toUpperCase()}`],
                    ["Service", booking.service?.name],
                    ["Date", formatDate(booking.date)],
                    ["Time", booking.time],
                    ["Duration", booking.service?.duration],
                    ["Amount Paid", booking.service?.price ? `$${booking.service.price} USD` : "Custom"],
                    ["Status", "Confirmed"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-850/50">{label}</span>
                      <span className="font-medium text-slate-850">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => { setStep(1); setSelectedService(null); setSelectedDate(null); setSelectedTime(null); setForm({ name: "", email: "", phone: "", details: "" }); setPaymentStatus(null); setBooking(null); }}
                  className="px-8 py-3 border-2 border-forest-500 text-forest-600 rounded-xl font-semibold hover:bg-forest-500 hover:text-white transition-all"
                >
                  Book Another Session
                </button>
              </div>
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
      </div>
    </>
  );
}