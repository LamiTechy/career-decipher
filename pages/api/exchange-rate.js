const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const FALLBACK_RATE = 1600;

function getCache() {
  if (!globalThis.__usdNgnCache) {
    globalThis.__usdNgnCache = { rate: null, timestamp: 0 };
  }
  return globalThis.__usdNgnCache;
}

async function fetchFromFrankfurter() {
  const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=NGN", {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  const rate = data?.rates?.NGN;
  if (!rate || typeof rate !== "number" || rate <= 0) throw new Error("Bad rate from Frankfurter");
  return rate;
}

async function fetchFromOpenErApi() {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  const rate = data?.rates?.NGN;
  if (!rate || typeof rate !== "number" || rate <= 0) throw new Error("Bad rate from open.er-api");
  return rate;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: false, message: "Method not allowed" });
  }

  const cache = getCache();

  if (cache.rate && Date.now() - cache.timestamp < CACHE_DURATION) {
    return res.status(200).json({ status: true, rate: cache.rate, source: "cache" });
  }

  const sources = [
    { name: "frankfurter", fn: fetchFromFrankfurter },
    { name: "open.er-api", fn: fetchFromOpenErApi },
  ];

  for (const source of sources) {
    try {
      const rate = await source.fn();
      cache.rate = rate;
      cache.timestamp = Date.now();
      return res.status(200).json({ status: true, rate, source: source.name });
    } catch (err) {
      console.warn(`exchange-rate: ${source.name} failed —`, err.message);
    }
  }

  const envRate = Number(process.env.NEXT_PUBLIC_USD_TO_NGN_RATE);
  const fallback = envRate > 0 ? envRate : FALLBACK_RATE;
  return res.status(200).json({ status: true, rate: fallback, source: "fallback" });
}
