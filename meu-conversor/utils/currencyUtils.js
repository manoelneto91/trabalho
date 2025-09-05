// /utils/currencyUtils.js
let currencyMap = null;

export async function loadCurrencies() {
  if (currencyMap) return currencyMap;

  const res = await fetch("/data/currencies.csv", { cache: "force-cache" });
  if (!res.ok) {
    console.error("Falha ao carregar /data/currencies.csv", res.status);
    currencyMap = {};
    return currencyMap;
  }

  const raw = await res.text();
  const text = raw.replace(/^\uFEFF/, "").trim();
  const lines = text.split(/\r?\n/);

  const map = {};
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    const parts = line.split(",");
    const code = (parts[0] || "").trim();
    const symbol = (parts[1] || "").trim();
    const name = parts.slice(2).join(",").trim();

    if (code) {
      map[code] = {
        symbol,
        name: name || code,
      };
    }
  }

  currencyMap = map;
  return currencyMap;
}

// função que recebe mapa e código, retorna info
export function getCurrencyInfoFrom(map, code) {
  const key = (code || "").trim();
  return (map && map[key]) || { symbol: "", name: code };
}

// função que usa o mapa global
export function getCurrencyInfo(code) {
  return getCurrencyInfoFrom(currencyMap || {}, code);
}
