export async function POST(req) {
  try {
    const body = await req.json();
    const {
      origem,
      destino,
      gasolina,
      etanol,
      diesel,
      consumoGasolina,
      consumoEtanol,
      consumoDiesel
    } = body;

    if (!origem || !destino) {
      return new Response(
        JSON.stringify({ error: "Origem e destino são obrigatórios" }),
        { status: 400 }
      );
    }

    // Buscar coordenadas no Nominatim
    const getCoords = async (cidade) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&countrycodes=br&q=${encodeURIComponent(
          cidade
        )}`,
        {
          headers: { "User-Agent": "CalculadoraViagem/1.0 (contato@seudominio.com)" },
        }
      );
      const data = await res.json();
      if (!data.length) throw new Error(`Cidade "${cidade}" não encontrada`);
      return {
        nome: `${data[0].display_name.split(",")[0]} - ${data[0].address.state}`,
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    };

    const origemCoord = await getCoords(origem);
    const destinoCoord = await getCoords(destino);

    // Rota via OSRM
    const osrmRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origemCoord.lon},${origemCoord.lat};${destinoCoord.lon},${destinoCoord.lat}?overview=full&geometries=geojson`
    );
    const osrmData = await osrmRes.json();
    if (!osrmData.routes?.length) throw new Error("Rota não encontrada");

    const distanciaKm = osrmData.routes[0].distance / 1000;
    const rotaGeoJSON = osrmData.routes[0].geometry;

    // Simulação de pedágios
    const pedagioValor = 20;

    const resultados = {
      distancia: distanciaKm.toFixed(2),
      pedagios: pedagioValor,
      gasolina:
        gasolina && consumoGasolina
          ? ((distanciaKm / consumoGasolina) * gasolina + pedagioValor).toFixed(2)
          : null,
      etanol:
        etanol && consumoEtanol
          ? ((distanciaKm / consumoEtanol) * etanol + pedagioValor).toFixed(2)
          : null,
      diesel:
        diesel && consumoDiesel
          ? ((distanciaKm / consumoDiesel) * diesel + pedagioValor).toFixed(2)
          : null,
      rota: rotaGeoJSON,
      origem: origemCoord,
      destino: destinoCoord,
    };

    return new Response(JSON.stringify(resultados), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}