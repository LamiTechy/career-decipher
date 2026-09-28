// Currency helpers.
//
// USD is the source of truth for every price in /data. Naira prices are
// derived with a fixed rate (default 1000 NGN per USD) and rounded UP to the
// nearest ₦1,000 — e.g. $45 → ₦45,000, $90 → ₦90,000.
// Override the rate with NEXT_PUBLIC_USD_TO_NGN_RATE if needed.

export const USD_TO_NGN = Number(process.env.NEXT_PUBLIC_USD_TO_NGN_RATE) > 0
  ? Number(process.env.NEXT_PUBLIC_USD_TO_NGN_RATE)
  : 1000;

export const toNgn = (usd) => {
  const amount = Number(usd);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.ceil((amount * USD_TO_NGN) / 1000) * 1000;
};

export const formatMoney = (amount, currency = "USD") => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  if (currency === "NGN") {
    return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(value)}`;
  }
  if (currency === "CAD") return `CAD ${value}`;
  return `$${value}`;
};

// Location picks the gateway: Nigeria → Paystack (charged in ₦),
// everywhere else → Stripe (charged in USD).
export const detectGateway = async () => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch("https://ipapi.co/country_code/", { signal: controller.signal });
    clearTimeout(timer);
    const code = (await res.text()).trim().toUpperCase();
    if (code.length === 2) return code === "NG" ? "paystack" : "stripe";
  } catch (error) {
    // fall through to timezone detection
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    return tz === "Africa/Lagos" ? "paystack" : "stripe";
  } catch (error) {
    return "stripe";
  }
};

export const gatewayCurrency = (gateway) => (gateway === "paystack" ? "NGN" : "USD");
