// meu-conversor/app/page.jsx
import React, { useEffect, useState } from "react";
import Ticker from "../components/Ticker";

export default function HomePage() {
  const [quotes, setQuotes] = useState({});

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
  }, []);

  const topCurrencies = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "CNY", "NZD", "KRW"];

  const getCurrencyName = (code) => {
    const names = {
      USD: "Dólar Americano",
      EUR: "Euro",
      GBP: "Libra Esterlina",
      JPY: "Iene Japonês",
      CHF: "Franco Suíço",
      AUD: "Dólar Australiano",
      CAD: "Dólar Canadense",
      CNY: "Yuan Chinês",
      NZD: "Dólar Neozelandês",
      KRW: "Won Sul-Coreano",
    };
    return names[code] || code;
  };

  return (
    <main style={{ padding: "20px" }}>
      <h1>Moeda Já</h1>

      <section>
        <h2>Principais Cotações</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {topCurrencies.map((currency) => {
            const value = quotes[currency];
            if (!value) return null;
            return (
              <div key={currency} style={{ border: "1px solid #ccc", padding: "10px", width: "150px" }}>
                <div>{currency}</div>
                <div>{getCurrencyName(currency)}</div>
                <div>R$ {value.toFixed(2).replace(".", ",")}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2>Carrossel de Moedas</h2>
        <Ticker />
      </section>
    </main>
  );
}