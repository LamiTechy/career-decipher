export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, message: "Method not allowed" });
  }

  const { email, name, phone, amount, currency, successUrl, cancelUrl, verify, sessionId } =
    req.body;

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return res
      .status(500)
      .json({ status: false, message: "Missing Stripe secret key." });
  }

  // ── Verify (retrieve completed session) ───────────────────────────────────
  if (verify) {
    if (!sessionId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing session ID." });
    }

    try {
      const stripeRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        }
      );
      const session = await stripeRes.json();

      if (session.error) {
        return res
          .status(400)
          .json({ status: false, message: session.error.message });
      }

      const paid = session.payment_status === "paid";
      return res.status(200).json({ status: paid, data: session });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Unable to verify Stripe session.",
        error: error.message,
      });
    }
  }

  // ── Initialize Checkout Session ────────────────────────────────────────────
  const rawAmount = parseInt(amount, 10);
  if (!email || !name || Number.isNaN(rawAmount) || rawAmount < 50) {
    return res
      .status(400)
      .json({
        status: false,
        message:
          "Missing email, name, or amount. Amount must be at least 50 cents.",
      });
  }

  if (!successUrl || !cancelUrl) {
    return res
      .status(400)
      .json({ status: false, message: "Missing successUrl or cancelUrl." });
  }

  try {
    // Build URL-encoded form body for Stripe REST API
    const params = new URLSearchParams();
    params.append("payment_method_types[]", "card");
    params.append("mode", "payment");
    params.append("customer_email", email);
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    params.append("line_items[0][quantity]", "1");
    params.append("line_items[0][price_data][currency]", (currency || "usd").toLowerCase());
    params.append("line_items[0][price_data][unit_amount]", String(rawAmount));
    params.append("line_items[0][price_data][product_data][name]", name);
    if (phone) {
      params.append("metadata[phone]", phone);
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    if (session.error) {
      return res
        .status(400)
        .json({ status: false, message: session.error.message, details: session });
    }

    return res.status(200).json({
      status: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Unable to initialize Stripe payment.",
      error: error.message,
    });
  }
}
