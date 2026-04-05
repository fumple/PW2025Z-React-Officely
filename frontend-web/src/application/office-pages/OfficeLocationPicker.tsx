import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";

const markerIcon = L.icon({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
});

type NominatimAddress = {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  hamlet?: string;
};

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
};

function formatAddress(addr: NominatimAddress | undefined, fallback: string) {
  const city =
    addr?.city ?? addr?.town ?? addr?.village ?? addr?.suburb ?? addr?.hamlet;

  const line1 = [addr?.road, addr?.house_number]
    .filter(Boolean)
    .join(" ")
    .trim();

  const out = [line1, city].filter(Boolean).join(", ").trim();
  return out || fallback;
}

function SetView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export function OfficeLocationPicker(props: {
  address: string;
  lat: number;
  lng: number;
  onChange: (next: { address: string; lat: number; lng: number }) => void;
}) {
  const { address, lat, lng, onChange } = props;

  const [query, setQuery] = useState(address);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  const timer = useRef<number | null>(null);

  useEffect(() => {
    setQuery(address);
  }, [address]);

  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const search = (q: string) => {
    const url =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({
        q,
        format: "json",
        addressdetails: "1",
        limit: "5",
      }).toString();

    fetch(url, {
      headers: {
        Accept: "application/json",
      },
    })
      .then((r) => r.json())
      .then((data: Suggestion[]) => setSuggestions(data))
      .catch(() => setSuggestions([]));
  };

  const reverse = (latNum: number, lngNum: number) => {
    const url =
      "https://nominatim.openstreetmap.org/reverse?" +
      new URLSearchParams({
        lat: String(latNum),
        lon: String(lngNum),
        format: "json",
        adressdetails: "1",
      }).toString();

    fetch(url, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => {
        const fallback = (data?.display_name as string) ?? "";
        const formatted = formatAddress(
          data?.address as NominatimAddress | undefined,
          fallback,
        );
        onChange({ address: formatted, lat: latNum, lng: lngNum });
      })
      .catch(() => onChange({ address: "", lat: latNum, lng: lngNum }));
  };

  const onQueryChange = (v: string) => {
    setQuery(v);
    setOpen(true);

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const trimmed = v.trim();
      if (trimmed.length < 3) {
        setSuggestions([]);
        return;
      }
      search(trimmed);
    }, 350);
  };

  const pickSuggestion = (s: Suggestion) => {
    const latNum = Number(s.lat);
    const lngNum = Number(s.lon);
    const formatted = formatAddress(s.address, s.display_name);
    onChange({ address: formatted, lat: latNum, lng: lngNum });
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <Box sx={{ display: "grid", gap: "8px" }}>
      {/* Address input + suggestions */}
      <Box sx={{ position: "relative" }}>
        <OutlinedInput
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions.length > 0) {
              e.preventDefault();
              pickSuggestion(suggestions[0]);
            }
          }}
          placeholder="Type an address…"
          fullWidth
          sx={{
            bgcolor: "#fff",
            "&:hover": { bgcolor: "#fff" },
            "&.Mui-focused": { bgcolor: "#fff" },
          }}
        />

        {open && suggestions.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 20,
              bgcolor: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            }}
          >
            {suggestions.map((s, idx) => (
              <Button
                key={idx}
                type="button"
                onClick={() => pickSuggestion(s)}
                fullWidth
                variant="text"
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: "12px",
                  color: "#111",
                  px: "10px",
                  py: "8px",
                  borderRadius: 0,
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                {formatAddress(s.address, s.display_name)}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {/* Map */}
      <Box
        sx={{
          height: 240,
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid #e6e6e6",
          bgcolor: "#fff",
          "& .leaflet-control-container .leaflet-top.leaflet-left": {
            marginLeft: "8px",
            marginTop: "8px",
          },
        }}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url={tileUrl} />
          <SetView lat={lat} lng={lng} />
          <Marker
            position={[lat, lng]}
            draggable
            icon={markerIcon}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const p = m.getLatLng();
                reverse(p.lat, p.lng);
              },
            }}
          />
        </MapContainer>
      </Box>
    </Box>
  );
}
