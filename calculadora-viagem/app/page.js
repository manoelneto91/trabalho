"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";

// Dynamic imports para componentes do Leaflet que não funcionam no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Ajusta o mapa para enquadrar toda a rota
function AjustarMapa({ rota }) {
  const map = useMap();

  useEffect(() => {
    if (map && rota?.coordinates?.length) {
      const bounds = rota.coordinates.map((c) => [c[1], c[0]]);
      map.fitBounds(bounds);
    }
  }, [rota, map]);

  return null;
}

export default function Home() {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [sugestoesOrigem, setSugestoesOrigem] = useState([]);
  const [sugestoesDestino, setSugestoesDestino] = useState([]);
  const [origemSelecionada, setOrigemSelecionada] = useState(null);
  const [destinoSelecionado, setDestinoSelecionado] = useState(null);
  const [resultado, setResultado] = useState(null);

  const [gasolina, setGasolina] = useState("");
  const [etanol, setEtanol] = useState("");
  const [diesel, setDiesel] = useState("");
  const [consumoGasolina, setConsumoGasolina] = useState("");
  const [consumoEtanol, setConsumoEtanol] = useState("");
  const [consumoDiesel, setConsumoDiesel] = useState("");

  // Buscar sugestões de cidade ou endereço
  const buscarSugestoes = async (texto, setSugestoes) => {
    if (texto.length < 3) {
      setSugestoes([]);
      return;
    }
    try {
      const res = await fetch(`/api/cidades?q=${encodeURIComponent(texto)}`);
      const data = await res.json();
      setSugestoes(data);
    } catch (err) {
      console.error(err);
      setSugestoes([]);
    }
  };

  // Calcular rota e custo
  const calcularRota = async () => {
    if (!origemSelecionada || !destinoSelecionado) {
      alert("Selecione origem e destino válidos");
      return;
    }

    try {
      const res = await fetch("/api/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origem: origemSelecionada.display,
          destino: destinoSelecionado.display,
          gasolina,
          etanol,
          diesel,
          consumoGasolina,
          consumoEtanol,
          consumoDiesel
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setResultado(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao calcular a rota");
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Calculadora de Viagem</h1>

      {/* Origem */}
      <div className="mb-4 relative">
        <input
          type="text"
          value={origem}
          onChange={(e) => {
            setOrigem(e.target.value);
            buscarSugestoes(e.target.value, setSugestoesOrigem);
          }}
          className="border p-2 w-full rounded"
          placeholder="Digite a cidade ou endereço de origem"
        />
        {sugestoesOrigem.length > 0 && (
          <ul className="absolute bg-white border rounded max-h-40 overflow-y-auto w-full z-10">
            {sugestoesOrigem.map((s, i) => (
              <li
                key={i}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setOrigem(s.display);
                  setOrigemSelecionada(s);
                  setSugestoesOrigem([]);
                }}
              >
                {s.display}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Destino */}
      <div className="mb-4 relative">
        <input
          type="text"
          value={destino}
          onChange={(e) => {
            setDestino(e.target.value);
            buscarSugestoes(e.target.value, setSugestoesDestino);
          }}
          className="border p-2 w-full rounded"
          placeholder="Digite a cidade ou endereço de destino"
        />
        {sugestoesDestino.length > 0 && (
          <ul className="absolute bg-white border rounded max-h-40 overflow-y-auto w-full z-10">
            {sugestoesDestino.map((s, i) => (
              <li
                key={i}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setDestino(s.display);
                  setDestinoSelecionado(s);
                  setSugestoesDestino([]);
                }}
              >
                {s.display}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preço e consumo */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="number"
          value={gasolina}
          onChange={(e) => setGasolina(e.target.value)}
          placeholder="Preço Gasolina"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={consumoGasolina}
          onChange={(e) => setConsumoGasolina(e.target.value)}
          placeholder="Consumo Gasolina (km/L)"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={etanol}
          onChange={(e) => setEtanol(e.target.value)}
          placeholder="Preço Etanol"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={consumoEtanol}
          onChange={(e) => setConsumoEtanol(e.target.value)}
          placeholder="Consumo Etanol (km/L)"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={diesel}
          onChange={(e) => setDiesel(e.target.value)}
          placeholder="Preço Diesel"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={consumoDiesel}
          onChange={(e) => setConsumoDiesel(e.target.value)}
          placeholder="Consumo Diesel (km/L)"
          className="border p-2 rounded"
        />
      </div>

      <button
        onClick={calcularRota}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4"
      >
        Calcular Rota
      </button>

      {/* Resultado */}
      {resultado && (
        <div className="mb-4">
          <p>
            <strong>Distância:</strong> {resultado.distancia} km
          </p>
          <p>
            <strong>Pedágios:</strong> R$ {resultado.pedagios}
          </p>
          {resultado.gasolina && <p><strong>Gasolina:</strong> R$ {resultado.gasolina}</p>}
          {resultado.etanol && <p><strong>Etanol:</strong> R$ {resultado.etanol}</p>}
          {resultado.diesel && <p><strong>Diesel:</strong> R$ {resultado.diesel}</p>}
        </div>
      )}

      {/* Mapa */}
      {resultado?.rota && (
        <div className="h-96 w-full mt-4">
          <MapContainer
            center={[resultado.origem.lat, resultado.origem.lon]}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline
              positions={resultado.rota.coordinates.map((c) => [c[1], c[0]])}
              color="blue"
            />
            <Marker position={[resultado.origem.lat, resultado.origem.lon]}>
              <Popup>Origem: {resultado.origem.display}</Popup>
            </Marker>
            <Marker position={[resultado.destino.lat, resultado.destino.lon]}>
              <Popup>Destino: {resultado.destino.display}</Popup>
            </Marker>
            <AjustarMapa rota={resultado.rota} />
          </MapContainer>
        </div>
      )}
    </main>
  );
}
