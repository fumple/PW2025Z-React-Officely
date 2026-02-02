type GeocodeResult = { lat: number; lon: number; displayName: string };

const geocodeCache = new Map<string, GeocodeResult>();
const reverseCache = new Map<string, string>();

let geocodeRunning = false;
let reverseRunning = false;

export const nominatimGeocode = async (
  query: string,
): Promise<GeocodeResult | null> => {
  const q = query.trim();
  if (!q) return null;

  const key = q.toLowerCase();
  const cached = geocodeCache.get(key);
  if (cached) return cached;

  if (geocodeRunning) return null;
  geocodeRunning = true;

  try {
    const url =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({
        q,
        format: "json",
        limit: "1",
        addressdetails: "1",
      }).toString();

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const arr = await res.json();
    const first = arr?.[0];
    if (!first?.lat || !first?.lon) return null;

    const a = first.address ?? {};

    const city =
      a.city ??
      a.town ??
      a.village ??
      a.municipality ??
      a.county ??
      a.state ??
      "";

    const road = a.road ?? a.pedestrian ?? a.footway ?? a.path ?? "";
    const house = a.house_number ? a.house_number : "";

    const line1 = (
      road ? `${road} ${house}` : (a.neighbourhood ?? a.suburb ?? "")
    ).trim();

    const display =
      [line1, city].filter(Boolean).join(", ") ||
      (typeof first.display_name === "string" ? first.display_name : q);

    const result: GeocodeResult = {
      lat: Number(first.lat),
      lon: Number(first.lon),
      displayName: display,
    };

    geocodeCache.set(key, result);
    return result;
  } catch {
    return null;
  } finally {
    geocodeRunning = false;
  }
};

export const nominatimReverse = async (
  lat: number,
  lon: number,
): Promise<string | null> => {
  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  const cached = reverseCache.get(key);
  if (cached) return cached;

  if (reverseRunning) return null;
  reverseRunning = true;

  try {
    const url =
      "https://nominatim.openstreetmap.org/reverse?" +
      new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        format: "json",
        zoom: "18",
      }).toString();

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const data = await res.json();

    const a = data?.address ?? {};
    const city =
      a.city ??
      a.town ??
      a.village ??
      a.municipality ??
      a.county ??
      a.state ??
      "";
    const road = a.road ?? a.pedestrian ?? a.footway ?? a.path ?? "";
    const house = a.house_number ? a.house_number : "";

    const line1 = (
      road ? `${road} ${house}` : (a.neighbourhood ?? a.suburb ?? "")
    ).trim();

    const display =
      [line1, city].filter(Boolean).join(", ") ||
      (typeof data?.display_name === "string" ? data.display_name : null);

    if (!display) return null;

    reverseCache.set(key, display);
    return display;
  } catch {
    return null;
  } finally {
    reverseRunning = false;
  }
};

export const clearNominatimCache = () => {
  geocodeCache.clear();
  reverseCache.clear();
};
