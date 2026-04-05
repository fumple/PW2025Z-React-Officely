import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
import Box from "@mui/material/Box";

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

function SetView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export const OfficeLocationDisplay = (props: {
  address: string;
  lat: number;
  lng: number;
}) => {
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <Box sx={{ display: "grid", gap: "8px" }}>
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
          center={[props.lat, props.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url={tileUrl} />
          <SetView lat={props.lat} lng={props.lng} />
          <Marker position={[props.lat, props.lng]} icon={markerIcon} />
        </MapContainer>
      </Box>
    </Box>
  );
};
