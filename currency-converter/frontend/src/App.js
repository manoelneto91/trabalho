import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [currencies, setCurrencies] = useState({});
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("BRL");
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(0);
  const [iof, setIof] = useState("cash"); // cash = 1.1%, card = 6.38%
  const [currentSlide, setCurrentSlide] = useState(0);

  const TOP_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];

  useEffect(() => {
    fetch("http://localhost:5000/api/rates/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data?.conversion_rates) {
          const formatted = {};
          Object.entries(data.conversion_rates).forEach(([code, value]) => {
            formatted[code] = {
              name: code,
              value,
            };
          });
          setCurrencies(formatted);
        }
      })
      .catch((err) => console.error("Erro ao buscar cotações:", err));
  }, []);

  useEffect(() => {
    if (currencies[fromCurrency] && currencies[toCurrency]) {
      const raw = (amount / currencies[fromCurrency].value) * currencies[toCurrency].value;
      const iofRate = iof === "cash" ? 0.011 : 0.0638;
      const total = raw * (1 + iofRate);
      setResult(total);
    }
  }, [amount, fromCurrency, toCurrency, iof, currencies]);

  // safety check para evitar undefined
  const getRateInBRL = (currency) => {
    if (!currencies[currency] || !currencies["BRL"]) return 0;
    return currencies["BRL"].value / currencies[currency].value;
  };

  const formatCurrency = (val) =>
    val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // carrossel auto slide
  useEffect(() => {
    if (TOP_CURRENCIES.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % TOP_CURRENCIES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [TOP_CURRENCIES.length]);

  return (
    <div className="app-container">
      <h1>Conversor de Moedas</h1>

      {/* Carrossel */}
      <div className="carousel">
        {TOP_CURRENCIES.map((currency, idx) =>
          currencies[currency] && currencies["BRL"] ? (
            <div
              key={currency}
              className={`carousel-item ${idx === currentSlide ? "active" : ""}`}
            >
              <div className="ci-name">{currencies[currency]?.name || currency}</div>
              <div className="ci-rate">R$ {formatCurrency(getRateInBRL(currency))}</div>
            </div>
          ) : null
        )}
      </div>

      {/* Conversor */}
      <div className="converter">
        <div className="block from-block">
          <label>De</label>
          <div className="inline-inputs">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {Object.keys(currencies).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="block to-block">
          <label>Para</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            {Object.keys(currencies).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p>{formatCurrency(result)} {toCurrency}</p>
        </div>

        <button className="invert-button" onClick={handleSwap}>
          ⟲ Inverter Moedas
        </button>

        {/* Método de pagamento */}
        <div className="payment-method">
          <h2>Método de Pagamento (IOF)</h2>
          <label>
            <input
              type="radio"
              value="cash"
              checked={iof === "cash"}
              onChange={() => setIof("cash")}
            />
            Espécie (1,1%)
          </label>
          <label>
            <input
              type="radio"
              value="card"
              checked={iof === "card"}
              onChange={() => setIof("card")}
            />
            Cartão (6,38%)
          </label>
          <p>IOF: R$ {formatCurrency(result * (iof === "cash" ? 0.011 : 0.0638))}</p>
        </div>
      </div>

      {/* Tabela de cotações */}
      <div className="table-container">
        <h2>Cotações para Real Brasileiro (BRL)</h2>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Valor em BRL</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(currencies).map((c) =>
              currencies[c] && currencies["BRL"] ? (
                <tr key={c}>
                  <td>{c}</td>
                  <td>{currencies[c]?.name}</td>
                  <td>R$ {formatCurrency(getRateInBRL(c))}</td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>

      <footer>
        <p>Desenvolvido por Manoel Inácio Neto</p>
      </footer>
    </div>
  );
}

export default App;