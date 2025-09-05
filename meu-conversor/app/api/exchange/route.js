import axios from "axios";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") || "USD";
    const to = searchParams.get("to") || "BRL";
    const amount = searchParams.get("amount") || 1;

    const apiKey = process.env.EXCHANGE_API_KEY;

    // Endpoint da ExchangeRate-API
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`;

    const res = await axios.get(url);
    const data = res.data;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Erro ao buscar dados" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
