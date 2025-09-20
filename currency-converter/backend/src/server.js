const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔓 Permitir que o React (localhost:3000) acesse o backend
app.use(cors());

// 🔑 Sua chave fica no .env, não no código
const API_KEY = process.env.EXCHANGE_API_KEY;
const BASE_URL = "https://v6.exchangerate-api.com/v6";

// Endpoint proxy para buscar cotações
app.get("/api/rates/:base", async (req, res) => {
  const { base } = req.params;

  try {
    const url = `${BASE_URL}/${API_KEY}/latest/${base}`;
    const response = await axios.get(url);
    res.json(response.data); // devolve os dados para o front
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados da API" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
