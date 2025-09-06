import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// --- Map Imports ---
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

// --- We need the leaflet-draw library and its CSS ---
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';


// --- Icon Imports ---
import { Save, Loader, AlertCircle, CheckCircle } from 'lucide-react';

// --- Leaflet Icon Fix ---
// This setup is needed to fix an issue with default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Internal Component to handle Map Drawing Logic ---
const DrawControl = ({ onCreated, onDeleted }) => {
    const map = useMap();
    const drawnItemsRef = useRef(new L.FeatureGroup());

    useEffect(() => {
        const drawnItems = drawnItemsRef.current;
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polygon: {
                    allowIntersection: false,
                    shapeOptions: { color: '#e53e3e' } // Red color for drawing
                },
                // Disable all other drawing tools
                rectangle: false, circle: false, circlemarker: false, marker: false, polyline: false,
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
        zoneName: '',
        state: 'Gujarat',
        countryType: 'India',
        allowedGender: 'Both',
    });
    const [coordinates, setCoordinates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleShapeCreated = (layer) => {
        const latlngs = layer.getLatLngs()[0].map(latlng => ({ lat: latlng.lat, lng: latlng.lng }));
        setCoordinates(latlngs);
        setError(''); // Clear any previous error
    };
    
    const handleShapeDeleted = () => {
        setCoordinates([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (coordinates.length < 3) {
            setError('Please draw a valid zone on the map before submitting.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        const payload = { ...formData, coordinates };

        try {
            console.log('Submitting payload:', payload);
            const response = await axios.post(`${backendUrl}/api/geofence/create`, payload);
            setSuccess('Geo-fence created successfully!');
            console.log('API Response:', response.data);
            setFormData({ zoneName: '', state: 'Gujarat', countryType: 'India', allowedGender: 'Both' });
            setCoordinates([]);
            // You might need a way to programmatically clear the drawn layer here
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
             <div className="bg-white rounded-xl border p-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Geo-fence</h2>
                <p className="text-gray-600 mt-1">Draw a zone on the map and fill in the details below.</p>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Draw Zone Boundary</h3>
                    <p className="text-sm text-gray-500 mb-4">Use the polygon tool on the right to draw the restricted area.</p>
                    <div className="h-[500px] w-full rounded-lg overflow-hidden z-0">
                        <MapContainer center={[23.0225, 72.5714]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <DrawControl onCreated={handleShapeCreated} onDeleted={handleShapeDeleted} />
                        </MapContainer>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-6 space-y-4 h-fit">
                    <h3 className="text-lg font-semibold">Step 2: Zone Details</h3>
                    <div>
                        <label htmlFor="zoneName" className="block text-sm font-medium mb-1">Zone Name</label>
                        <input type="text" name="zoneName" value={formData.zoneName} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Kankaria Lake Area" />
                    </div>
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="countryType" className="block text-sm font-medium mb-1">Country</label>
                        <select name="countryType" value={formData.countryType} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"><option value="India">India</option><option value="International">International</option></select>
                    </div>
                    <div>
                        <label htmlFor="allowedGender" className="block text-sm font-medium mb-1">Allowed Gender</label>
                        <select name="allowedGender" value={formData.allowedGender} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"><option value="Both">Both</option><option value="Male">Male Only</option><option value="Female">Female Only</option></select>
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50">
                            {loading && <Loader className="animate-spin w-5 h-5" />}
                            <Save className="w-5 h-5"/>
                            <span>{loading ? 'Saving...' : 'Save Geo-fence'}</span>
                        </button>
                    </div>
                    {error && <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg"><AlertCircle className="w-5 h-5 mr-2" />{error}</div>}
                    {success && <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-lg"><CheckCircle className="w-5 h-5 mr-2" />{success}</div>}
                </div>
            </form>
        </div>
    );
};

export default AddGeofencePage;