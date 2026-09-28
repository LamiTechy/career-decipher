const PAYSTACK_BASE = "https://api.paystack.co";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, message: "Method not allowed" });
  }

  const { email, name, phone, amount, currency, successUrl, cancelUrl, verify, reference } =
    req.body;

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ status: false, message: "Missing Paystack secret key." });
  }

  // ── Verify a completed transaction ────────────────────────────────────────
  if (verify) {
    if (!reference) {
      return res.status(400).json({ status: false, message: "Missing transaction reference." });
    }

    try {
      const paystackRes = await fetch(
        `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${secretKey}` } }
      );
      const result = await paystackRes.json();

      if (!result.status) {
        return res
          .status(400)
          .json({ status: false, message: result.message || "Payment verification failed." });
      }

      const paid = result.data?.status === "success";
      return res.status(200).json({ status: paid, data: result.data });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Unable to verify Paystack payment.",
        error: error.message,
      });
    }
  }

  // ── Initialize a Paystack checkout ────────────────────────────────────────
  const rawAmount = parseFloat(amount);
  if (!email || !name || Number.isNaN(rawAmount) || rawAmount <= 0) {
    return res.status(400).json({
      status: false,
      message: "Missing email, name, or amount.",
    });
  }

  if (!successUrl || !cancelUrl) {
    return res.status(400).json({ status: false, message: "Missing successUrl or cancelUrl." });
  }

  // Amount is sent in whole units of the currency (₦ or $); Paystack takes kobo/cents.
  const payCurrency = (currency || "USD").toUpperCase();
  if (!["NGN", "USD"].includes(payCurrency)) {
    return res.status(400).json({ status: false, message: "Currency must be NGN or USD." });
  }

  const chargedAmount = payCurrency === "NGN" ? Math.round(rawAmount) : rawAmount;
  const amountInSubunit = Math.round(chargedAmount * 100);
  const minimumSubunit = payCurrency === "NGN" ? 10000 : 50;

  if (amountInSubunit < minimumSubunit) {
    return res.status(400).json({
      status: false,
      message: `Amount must be at least ${payCurrency === "NGN" ? "₦100" : "$0.50"} ${payCurrency}.`,
    });
  }

  try {
    const paystackRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInSubunit,
        currency: payCurrency,
        callback_url: successUrl,
        metadata: {
          name,
          phone: phone || "",
          service: name,
          amount_charged: chargedAmount,
          currency: payCurrency,
        },
      }),
    });

    const result = await paystackRes.json();

    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message || "Unable to initialize Paystack payment.",
        details: result,
      });
    }

    return res.status(200).json({
      status: true,
      reference: result.data.reference,
      url: result.data.authorization_url,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Unable to initialize Paystack payment.",
      error: error.message,
    });
  }
}
