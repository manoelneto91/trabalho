import axios from "axios";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const base = searchParams.get("base") || "BRL"; // base padrão BRL
    const API_KEY = process.env.EXCHANGE_API_KEY;

    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key não configurada." }),
        { status: 500 }
      );
    }

    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`
    );

    const data = response.data;

    if (data.result !== "success") {
      return new Response(JSON.stringify({ error: "Erro ao buscar cotações." }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        base: data.base_code,
        conversion_rates: data.conversion_rates,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na API:", error.message);
    return new Response(JSON.stringify({ error: "Erro interno do servidor." }), {
      status: 500,
    });
  }
}
