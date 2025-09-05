export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=br&q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "CalculadoraViagem/1.0 (contato@seudominio.com)" } }
    );

    const data = await res.json();

    // Mapeia resultado
    const locais = data.map(d => {
      let display = "";

      // Formato cidade ou town
      if (d.type === "city" || d.type === "town") {
        display = `${d.display_name.split(",")[0]} - ${d.address.state}`;
      } else {
        // Formato endereço/rua
        display = d.display_name;
      }

      return {
        display,
        lat: d.lat,
        lon: d.lon
      };
    });

    return new Response(JSON.stringify(locais), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify([]), { status: 500 });
  }
}
