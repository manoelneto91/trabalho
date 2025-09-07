"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import { motion } from "framer-motion";
import Ticker from "../components/Ticker";
import { loadCurrencies, getCurrencyInfoFrom } from "../utils/currencyUtils";

const topCurrencies = ["USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD"];

export default function Home() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("BRL");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState(null);
  const [iofType, setIofType] = useState("especie");
  const [rates, setRates] = useState({});
  const [currencies, setCurrencies] = useState({});

  const IOF = { especie: 0.011, cartao: 0.0538 };

  useEffect(() => {
    (async () => {
      const map = await loadCurrencies();
      setCurrencies(map);
    })();
    fetchRates();
  }, []);

  async function fetchRates() {
    try {
      const res = await axios.get("/api/exchange/rates?base=BRL");
      const data = res.data?.conversion_rates || {};
      setRates(data);
    } catch (err) {
      console.error("Erro ao buscar cotações:", err);
    }
  }

  const convert = () => {
    if (!rates[from] || !rates[to]) return;

    let valueInBRL = amount;
    if (from !== "BRL") {
      valueInBRL = (amount / rates[from]) * rates["BRL"];
    }
    let converted = (valueInBRL / rates["BRL"]) * rates[to];

    if (from === "BRL") {
      converted = converted * (1 + IOF[iofType]);
    }

    setResult(converted);
  };

  const currencyCodes = Object.keys(rates);

  // Ordena para mostrar top 10 primeiro nas principais cotações
  const sortedCodes = [
    ...topCurrencies.filter((code) => currencyCodes.includes(code)),
    ...currencyCodes.filter((code) => !topCurrencies.includes(code)),
  ];

  return (
    <>
      <Head>
        <title>Moeda Já</title>
        <meta
          name="description"
          content="Moeda Já oferece conversão de moedas rápida e segura, cotações atualizadas em tempo real e cálculo de IOF para brasileiros."
        />
        <meta
          name="keywords"
          content="conversor de moedas, câmbio, cotação de moedas, IOF, dólar, euro, real, Moeda Já, câmbio internacional, viagem"
        />
      </Head>

      <Ticker currencies={currencies} rates={rates} />

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 flex flex-col items-center justify-start">
        <motion.h1
          className="text-3xl font-bold text-indigo-900 mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🌍 Moeda Já
        </motion.h1>

        <div className="w-full max-w-2xl grid gap-6">
          {/* Conversor */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Conversão</h2>
            <div className="grid gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="p-2 border rounded-lg w-full"
                placeholder="Valor"
              />

              <div className="flex gap-2">
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="p-2 border rounded-lg flex-1"
                >
                  {currencyCodes.map((code) => {
                    const info = getCurrencyInfoFrom(currencies, code);
                    return (
                      <option key={code} value={code}>
                        {code} — {info.name}
                      </option>
                    );
                  })}
                </select>

                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="p-2 border rounded-lg flex-1"
                >
                  {currencyCodes.map((code) => {
                    const info = getCurrencyInfoFrom(currencies, code);
                    return (
                      <option key={code} value={code}>
                        {code} — {info.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {from === "BRL" && (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="especie"
                      checked={iofType === "especie"}
                      onChange={(e) => setIofType(e.target.value)}
                    />
                    Espécie (1,1%)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="cartao"
                      checked={iofType === "cartao"}
                      onChange={(e) => setIofType(e.target.value)}
                    />
                    Cartão (5,38%)
                  </label>
                </div>
              )}

              <button
                onClick={convert}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Converter
              </button>

              {result !== null && (
                <motion.div
                  className="mt-4 text-lg font-semibold text-indigo-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {to === "BRL" ? "R$ " : ""}
                  {result.toFixed(2).replace(".", ",")} {to}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Principais Cotações */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-md overflow-x-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-center">
              Principais Cotações (base BRL)
            </h2>
            <ul className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sortedCodes.map((code) => {
                const info = getCurrencyInfoFrom(currencies, code);
                const value = rates[code];
                if (!value) return null;
                return (
                  <li
                    key={code}
                    className="bg-indigo-50 p-3 rounded-xl shadow flex flex-col items-center"
                  >
                    <span className="font-bold text-indigo-900">{code}</span>
                    <span className="text-sm text-indigo-700">{info.name}</span>
                    <span className="mt-1 font-mono text-indigo-800">
                      {Number(value).toFixed(2).replace(".", ",")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </main>
    </>
  );
}