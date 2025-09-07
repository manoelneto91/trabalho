// meu-conversor/app/api/exchange/rates/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const API_KEY = process.env.EXCHANGE_API_KEY;
    const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/BRL`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Erro ao buscar dados da API de câmbio");
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Erro interno" },
      { status: 500 }
    );
  }
}
