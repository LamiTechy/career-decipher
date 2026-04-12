export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, message: "Method not allowed" });
  }

  const { email, name, phone, amount, reference, verify } = req.body;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || "";

  if (!secretKey) {
    return res.status(500).json({ status: false, message: "Missing Paystack secret key." });
  }

  if (verify) {
    if (!reference) {
      return res.status(400).json({ status: false, message: "Missing transaction reference." });
    }

    try {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.status) {
        return res.status(400).json({ status: false, message: "Paystack verification failed.", details: verifyData });
      }
      return res.status(200).json({ status: true, data: verifyData.data });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Unable to verify Paystack transaction.", error: error.message });
    }
  }

  const rawAmount = parseInt(amount, 10);
  if (!email || !name || Number.isNaN(rawAmount) || rawAmount < 100) {
    return res.status(400).json({ status: false, message: "Missing email, name, or amount. Amount must be at least 100 kobo." });
  }

  try {
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: rawAmount,
        currency: "NGN",
        metadata: {
          name,
          phone,
        },
      }),
    });
    const initData = await initRes.json();

    if (!initData.status) {
      return res.status(400).json({ status: false, message: initData.message || "Unable to initialize Paystack payment.", details: initData });
    }

    return res.status(200).json({
      status: true,
      authorization_url: initData.data.authorization_url,
      reference: initData.data.reference,
      amount: initData.data.amount,
      publicKey,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Unable to initialize Paystack payment.", error: error.message });
  }
}