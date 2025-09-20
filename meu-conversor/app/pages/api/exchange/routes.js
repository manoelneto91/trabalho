export default async function handler(req, res) {
  const { base = "BRL" } = req.query;
  const API_KEY = process.env.EXCHANGE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key não configurada." });
  }

  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`
  );
  const data = await response.json();

  if (data.result !== "success") {
    return res.status(500).json({ error: "Erro ao buscar cotações." });
  }

  return res.status(200).json({
    base: data.base_code,
    conversion_rates: data.conversion_rates,
  });
}