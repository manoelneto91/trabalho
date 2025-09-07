// meu-conversor/components/Ticker.jsx
"use client";
import React, { useEffect, useState } from "react";

export default function Ticker() {
  const [quotes, setQuotes] = useState({});
  const topCurrencies = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "CNY", "NZD", "KRW"];

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch("/api/exchange/rates");
        const data = await res.json();
        setQuotes(data.conversion_rates || {});
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000); // atualiza a cada 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", overflowX: "auto", gap: "20px" }}>
      {topCurrencies.map((currency) => {
        const value = quotes[currency];
        if (!value) return null;
        return (
          <div key={currency} style={{ minWidth: "100px", textAlign: "center" }}>
            <div>{currency}</div>
            <div>R$ {value.toFixed(2).replace(".", ",")}</div>
          </div>
        );
      })}
    </div>
  );
}