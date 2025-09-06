import React from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapPage = () => {
  const mapCenter = [23.033863, 72.585022];
  const geofenceCoordinates = [
    [23.035, 72.579],
    [23.039, 72.585],
    [23.033, 72.59],
    [23.029, 72.583],
  ];
  const touristLocations = [
    { id: "TID2847", position: [23.036, 72.582], inZone: true },
    { id: "TID1923", position: [23.03, 72.578], inZone: false },
  ];

  const createCustomIcon = (inZone) => {
    const color = inZone ? "#EF4444" : "#3B82F6";
    const html = `<div style="background-color: ${color}; width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`;
    return L.divIcon({
      html,
      className: "custom-map-icon",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polygon
          pathOptions={{ color: "red", fillOpacity: 0.2 }}
          positions={geofenceCoordinates}
        >
          <Tooltip sticky>Restricted Zone</Tooltip>
        </Polygon>
        {touristLocations.map((tourist) => (
          <Marker
            key={tourist.id}
            position={tourist.position}
            icon={createCustomIcon(tourist.inZone)}
          >
            <Popup>Tourist ID: {tourist.id}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;
