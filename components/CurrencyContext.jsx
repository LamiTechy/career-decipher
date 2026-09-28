import { createContext, useContext, useEffect, useState } from "react";
import { detectGateway, gatewayCurrency } from "../lib/currency";

const CurrencyContext = createContext({
  gateway: "stripe",
  currency: "USD",
  ready: false,
});

export function CurrencyProvider({ children }) {
  const [gateway, setGateway] = useState("stripe");

  useEffect(() => {
    let cancelled = false;
    detectGateway().then((detected) => {
      if (!cancelled) setGateway(detected);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CurrencyContext.Provider
      value={{ gateway, currency: gatewayCurrency(gateway), ready: true }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
