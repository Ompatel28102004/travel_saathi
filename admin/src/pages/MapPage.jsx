import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
} from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icon for tourist markers
const createCustomIcon = (inZone) => {
  const color = inZone ? "#EF4444" : "#3B82F6"; // Red if inside zone, blue if safe
  const html = `<div style="background-color: ${color}; width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid white;"></div>`;
  return L.divIcon({
    html,
    className: "custom-icon",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const MapPage = () => {
  const mapCenter = [26.5785, 93.172]; // Centered on first tourist location
  const [geoFences, setGeoFences] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Adjust if needed

      try {
        const [fencesRes, touristsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/geofence/get`),
          axios.get(`${backendUrl}/api/geofence/location/all-users`),
        ]);

        const fences = fencesRes.data || [];
        const users = touristsRes.data || [];

        // Format geofence coordinates
        const formattedFences = fences.map((fence) => ({
          _id: fence._id,
          zoneName: fence.zoneName,
          leafletCoordinates: fence.coordinates.map((coord) => [
            coord.lat,
            coord.lng,
          ]),
        }));

        // Format tourist data
        const formattedTourists = users
          .filter((user) => user.lastLocation?.lat && user.lastLocation?.lng)
          .map((user) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            lat: user.lastLocation.lat,
            lng: user.lastLocation.lng,
            inZone: user.lastLocation.insideZone,
            timestamp: user.lastLocation.timestamp,
          }));

        setGeoFences(formattedFences);
        setTourists(formattedTourists);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Could not load map data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading Live Map Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={14}
      scrollWheelZoom={true}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render geofencing zones */}
      {geoFences.map((fence) => (
        <Polygon
          key={fence._id}
          positions={fence.leafletCoordinates}
          pathOptions={{ color: "red", fillOpacity: 0.2 }}
        >
          <Tooltip sticky>{fence.zoneName}</Tooltip>
        </Polygon>
      ))}

      {/* Render tourist markers */}
      {tourists.map((tourist) => (
        <Marker
          key={tourist._id}
          position={[tourist.lat, tourist.lng]}
          icon={createCustomIcon(tourist.inZone)}
        >
          <Popup>
            <b>Name:</b> {tourist.name}<br />
            <b>Email:</b> {tourist.email}<br />
            <b>Status:</b> {tourist.inZone ? "In Restricted Zone" : "Safe"}<br />
            <b>Last Seen:</b>{" "}
            {new Date(tourist.timestamp).toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapPage;