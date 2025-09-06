import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// --- Map Imports ---
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

// --- We need the leaflet-draw library and its CSS ---
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// --- Icon Imports ---
import {
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  MapPin,
  Trash2,
  Copy,
} from "lucide-react";

// --- Leaflet Icon Fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- Internal Component to handle Map Drawing Logic ---
const DrawControl = ({ onCreated, onDeleted }) => {
  const map = useMap();
  const drawnItemsRef = useRef(new L.FeatureGroup());

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: { color: "#e53e3e" }, // Red color for drawing
        },
        // Disable all other drawing tools
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItems,
      },
    });

    map.addControl(drawControl);

    const handleDrawCreate = (event) => {
      const layer = event.layer;
      drawnItems.clearLayers(); // Ensure only one shape exists at a time
      drawnItems.addLayer(layer);
      onCreated(layer);
    };

    const handleDrawDelete = () => {
      onDeleted();
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreate);
    map.on(L.Draw.Event.DELETED, handleDrawDelete);

    // Cleanup function for when the component unmounts
    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreate);
      map.off(L.Draw.Event.DELETED, handleDrawDelete);

      // Correctly remove the control and layer on cleanup
      if (map.hasLayer(drawnItems)) {
        map.removeLayer(drawnItems);
      }
      map.removeControl(drawControl);
    };
  }, [map, onCreated, onDeleted]);

  return null; // This component does not render any visible JSX
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCoords, setShowCoords] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShapeCreated = (layer) => {
    const latlngs = layer
      .getLatLngs()[0]
      .map((latlng) => ({ lat: latlng.lat, lng: latlng.lng }));
    setCoordinates(latlngs);
    setError(""); // Clear any previous error
  };

  const handleShapeDeleted = () => {
    setCoordinates([]);
  };

  const copyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(coordinates, null, 2));
      // small ephemeral feedback
      setSuccess("Coordinates copied to clipboard");
      setTimeout(() => setSuccess(""), 2000);
    } catch {
      setError("Unable to copy. Please copy manually.");
    }
  };

  const resetForm = () => {
    setFormData({
      zoneName: "",
      state: "Gujarat",
      countryType: "India",
      allowedGender: "Both",
    });
    setCoordinates([]);
    setError("");
    setSuccess("");
  };

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
      console.log("Submitting payload:", payload);
      const response = await axios.post(
        `${backendUrl}/api/geofence/create`,
        payload
      );
      setSuccess("Geo-fence created successfully!");
      console.log("API Response:", response.data);
      setFormData({
        zoneName: "",
        state: "Gujarat",
        countryType: "India",
        allowedGender: "Both",
      });
      setCoordinates([]);
      // You might need a way to programmatically clear the drawn layer here (draw control handles delete)
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-6 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Add New Geo-fence
            </h1>
            <p className="text-sm opacity-90 mt-1">
              Draw a polygon on the map to define a restricted or controlled
              zone.
            </p>
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <div className="text-xs bg-white/10 text-white px-3 py-1 rounded-full">
              Step 1: Draw
            </div>
            <div className="text-xs bg-white/10 text-white px-3 py-1 rounded-full">
              Step 2: Details
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Map + instructions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Step 1 — Draw Zone
              </h3>
              <p className="text-sm text-gray-500">
                Use the polygon tool (top-right of the map). Only one polygon
                allowed — draw then edit/delete using the draw toolbar.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCoords(!showCoords)}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 hover:shadow"
              >
                <Copy className="w-4 h-4" /> {showCoords ? "Hide" : "Preview"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-gray-100 hover:shadow"
              >
                <Trash2 className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          <div
            className="relative rounded-lg overflow-hidden border border-dashed border-gray-100"
            style={{ height: 500 }}
          >
            {/* little translucent instruction pill on top of map */}
            <div className="absolute top-4 left-4 z-20 bg-white/85 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <div className="text-sm">
                <div className="font-medium">Polygon tool</div>
                <div className="text-xs text-gray-600">
                  Click to start drawing — complete by clicking the final vertex
                </div>
              </div>
            </div>

            <MapContainer
              center={[23.0225, 72.5714]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <DrawControl
                onCreated={handleShapeCreated}
                onDeleted={handleShapeDeleted}
              />
            </MapContainer>
          </div>

          {/* Coordinates preview */}
          {showCoords && (
            <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-700 font-medium">
                  Coordinates ({coordinates.length})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCoordinates}
                    type="button"
                    className="text-sm px-3 py-1 rounded bg-white border border-gray-100 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </div>
              </div>
              {coordinates.length === 0 ? (
                <div className="text-xs text-gray-500">
                  No shape drawn yet — draw a polygon to see coordinates here.
                </div>
              ) : (
                <pre className="text-xs max-h-40 overflow-auto bg-white p-2 rounded text-gray-700">
                  {JSON.stringify(coordinates, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Form panel */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Step 2 — Zone Details
            </h3>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Zone Name
              </label>
              <input
                type="text"
                name="zoneName"
                value={formData.zoneName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., Kankaria Lake Area"
              />

              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200"
              />

              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                name="countryType"
                value={formData.countryType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200"
              >
                <option value="India">India</option>
                <option value="International">International</option>
              </select>

              <label className="block text-sm font-medium text-gray-700">
                Allowed Gender
              </label>
              <div className="flex gap-2">
                {["Both", "Male", "Female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, allowedGender: g }))
                    }
                    className={`px-3 py-2 rounded-lg text-sm border transition ${
                      formData.allowedGender === g
                        ? "bg-blue-600 text-white shadow"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                    }`}
                  >
                    {g === "Both" ? "Both" : `${g} Only`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] transform transition disabled:opacity-60"
              >
                {loading ? (
                  <Loader className="animate-spin w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{loading ? "Saving..." : "Save Geo-fence"}</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-100 text-gray-700 bg-white hover:shadow"
              >
                <Trash2 className="w-4 h-4" /> Reset
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Tip: Use the polygon tool in the top-right of the map to draw. Use
              the edit/trash on the draw toolbar to modify or remove the
              polygon.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddGeofencePage;
