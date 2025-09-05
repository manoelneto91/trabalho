"use client";

import { useEffect, useState } from "react";

const topCurrencies = ["USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD"];

export default function Ticker({ rates }) {
  const [displayRates, setDisplayRates] = useState([]);

  useEffect(() => {
    if (!rates) return;
    const filtered = topCurrencies
      .map((code) => {
        const value = rates[code];
        if (!value) return null;
        return { code, value };
      })
      .filter(Boolean);
    setDisplayRates(filtered);
  }, [rates]);

  return (
    <div className="overflow-x-hidden relative bg-indigo-100 p-4 shadow-sm">
      <div className="flex gap-4 whitespace-nowrap animate-marquee">
        {displayRates.map(({ code, value }, i) => (
          <div
            key={i}
            className="bg-white p-3 rounded-xl shadow flex items-center justify-center min-w-[120px]"
          >
            <span className="font-bold text-indigo-900 mr-2">{code}</span>
            <span className="font-mono text-indigo-800">R$ {Number(value).toFixed(2).replace(".", ",")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
