import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  useMap,
  Polygon,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";

// --- Required CSS imports ---
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// --- Icon Imports ---
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  MapPin,
  Trash2,
  Plus,
} from "lucide-react";

// --- Leaflet Icon Fix for React ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- Internal Component to Handle Map Drawing Logic ---
// This component correctly manages the leaflet-draw toolbar and its events.
const DrawControl = ({ onCreated, onDeleted, onEdit }) => {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: { color: "#3b82f6" },
        },
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: { featureGroup: drawnItems },
    });

    map.addControl(drawControl);

    const handleCreate = (event) => {
      const layer = event.layer;
      drawnItems.clearLayers(); // Clear previous drawings
      drawnItems.addLayer(layer);
      onCreated(event);
    };

    map.on(L.Draw.Event.CREATED, handleCreate);
    map.on(L.Draw.Event.DELETED, onDeleted);
    map.on(L.Draw.Event.EDITED, onEdit);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreate);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.off(L.Draw.Event.EDITED, onEdit);
      // The map.removeControl() is the correct and safe way to clean up
      map.removeControl(drawControl);
    };
  }, [map, onCreated, onDeleted, onEdit]);

  return null;
};

// --- The Main Page Component ---
const AddGeofencePage = () => {
  const [formData, setFormData] = useState({
    zoneName: "",
    state: "Gujarat",
    countryType: "India",
    allowedGender: "Both",
  });
  const [coordinates, setCoordinates] = useState([]);
  const [existingFences, setExistingFences] = useState([]);
  const [selectedFence, setSelectedFence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchFences = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/geofence/get`);
      setExistingFences(response.data);
    } catch (err) {
      setError("Failed to fetch existing zones.");
    }
  };

  useEffect(() => {
    fetchFences();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (coordinates.length < 3) {
      setError("Please draw a valid zone on the map before submitting.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    const payload = { ...formData, coordinates };
    try {
      await axios.post(`${backendUrl}/api/geofence/create`, payload);
      setSuccess("Geo-fence created successfully!");
      setFormData({
        zoneName: "",
        state: "Gujarat",
        countryType: "India",
        allowedGender: "Both",
      });
      setCoordinates([]);
      await fetchFences();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fenceId) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;
    try {
      await axios.delete(`${backendUrl}/api/geofence/delete/${fenceId}`);
      setExistingFences(
        existingFences.filter((fence) => fence._id !== fenceId)
      );
      setSuccess("Zone deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete zone.");
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // We wrap these map event handlers in useCallback to ensure they are stable
  // and don't cause the DrawControl component to re-render unnecessarily.
  const handleShapeCreated = useCallback((event) => {
    const layer = event.layer;
    const latlngs = layer
      .getLatLngs()[0]
      .map((latlng) => ({ lat: latlng.lat, lng: latlng.lng }));
    setCoordinates(latlngs);
    setError("");
  }, []);

  const handleShapeDeleted = useCallback(() => {
    setCoordinates([]);
  }, []);

  const handleShapeEdited = useCallback((event) => {
    const layers = event.layers;
    layers.eachLayer((layer) => {
      const latlngs = layer
        .getLatLngs()[0]
        .map((latlng) => ({ lat: latlng.lat, lng: latlng.lng }));
      setCoordinates(latlngs);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Geo-fence Management
          </h1>
          <p className="text-sm text-gray-600">
            Draw, create, and manage restricted zones.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 h-[650px]">
          <MapContainer
            center={[23.0225, 72.5714]}
            zoom={13}
            style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="&copy; CARTO"
            />
            <DrawControl
              onCreated={handleShapeCreated}
              onDeleted={handleShapeDeleted}
              onEdit={handleShapeEdited}
            />
            {existingFences.map((fence) => (
              <Polygon
                key={fence._id}
                positions={fence.coordinates.map((c) => [c.lat, c.lng])}
                pathOptions={
                  selectedFence === fence._id
                    ? {
                        color: "#9333ea",
                        weight: 3,
                        fillColor: "#ef4444",
                        fillOpacity: 0.5,
                      }
                    : { color: "#dc2626", fillOpacity: 0.2 }
                }
              >
                <Tooltip>{fence.zoneName}</Tooltip>
              </Polygon>
            ))}
          </MapContainer>
        </div>
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus />
              Create a New Zone
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1">
                Zone Name
              </label>
              <input
                type="text"
                name="zoneName"
                value={formData.zoneName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Restricted Area 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500">
              Draw a polygon on the map to define the boundary (
              {coordinates.length} points plotted).
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{loading ? "Saving..." : "Save New Geo-fence"}</span>
            </button>
          </form>
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <h3 className="text-lg font-semibold">Existing Zones</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {existingFences.length > 0 ? (
                existingFences.map((fence) => (
                  <div
                    key={fence._id}
                    onMouseEnter={() => setSelectedFence(fence._id)}
                    onMouseLeave={() => setSelectedFence(null)}
                    onClick={() => setSelectedFence(fence._id)} // Added onClick for better mobile/touch experience
                    className={`p-3 rounded-lg flex justify-between items-center transition-colors cursor-pointer ${
                      selectedFence === fence._id
                        ? "bg-blue-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {fence.zoneName}
                      </p>
                      <p className="text-xs text-gray-500">{fence.state}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(fence._id)}
                      className="p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No zones found.
                </p>
              )}
            </div>
          </div>
          {error && (
            <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGeofencePage;
