import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  MapPin, Plus, Edit2, Trash2, Users, AlertTriangle, ListFilter,
  Shield, Bell, Search, Settings, LogOut, Menu, X, BarChart3,
  Navigation, FileText, Radio, Activity, Globe
} from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// --- Reusable Components (Navbar & Sidebar) ---

const Navbar = ({ sidebarOpen, setSidebarOpen, notifications, handleLogout }) => {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-[1001]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden">{sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Smart Tourist Safety</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Admin Control Panel</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 w-full max-w-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifications}</span>)}
            </button>
            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l">
               <button onClick={handleLogout} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Logout"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </nav>
    );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, menuItems }) => {
    const location = useLocation();
    return (
      <>
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-[1002] w-64 bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Control Panel</h2>
              <p className="text-sm text-gray-600">Northeast Tourism Safety</p>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  // Note: In a real app, routing would handle this. We simulate active state.
                  const isActive = location.pathname.includes(item.id);
                  return (
                    <button key={item.id} onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${ isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <Icon className="w-5 h-5" /><span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
        {sidebarOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 z-[1001] lg:hidden" onClick={() => setSidebarOpen(false)}/>)}
      </>
    );
};


// --- Geofencing Page Component ---

const GeofencingPage = () => {
    // --- State and Data ---
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Map settings
    const mapCenter = [23.033863, 72.585022]; // Ahmedabad, Gujarat
    const geofenceCoordinates = [
        [23.035, 72.579], [23.039, 72.585],
        [23.033, 72.590], [23.029, 72.583]
    ];

    // Mock tourist locations with real coordinates around Ahmedabad
    const touristLocations = [
        { id: 'TID2847', position: [23.036, 72.582], inZone: true },
        { id: 'TID1923', position: [23.030, 72.578], inZone: false },
        { id: 'TID8432', position: [23.034, 72.587], inZone: true },
        { id: 'TID5541', position: [23.040, 72.591], inZone: false },
    ];
    
    const geoZones = [
        { id: 1, name: 'Sabarmati Riverfront Park', risk: 'High', tourists: 2 },
        { id: 2, name: 'Kankaria Lake Restricted Zone', risk: 'Medium', tourists: 12 },
    ];
    
    const [activeZone, setActiveZone] = useState(geoZones[0]);

    // Custom icon for map markers
    const createCustomIcon = (inZone) => {
        const color = inZone ? '#EF4444' : '#3B82F6'; // red-500 or blue-500
        const html = `<div style="background-color: ${color}; width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`;
        return L.divIcon({ html, className: 'custom-map-icon', iconSize: [16, 16], iconAnchor: [8, 8] });
    };
    
    // --- Mocks for Layout ---
    const navigate = useNavigate();
    const handleLogout = () => { console.log("Logout"); navigate('/'); };
    const menuItems = [
      { id: 'overview', label: 'Dashboard', icon: BarChart3 },
      { id: 'geofencing', label: 'Geo-fencing', icon: MapPin },
      { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    ];

    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} menuItems={menuItems} />
        <div className="flex-1 flex flex-col h-screen">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} notifications={3} handleLogout={handleLogout}/>
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Geo-fencing & Zone Management</h2>
                <p className="text-gray-600">Monitor live tourist movements and manage restricted zones.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Map Section */}
                  <div className="lg:col-span-2 bg-white rounded-xl border p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Map: {activeZone.name}</h3>
                      <div className="h-[500px] w-full rounded-lg overflow-hidden z-0">
                          <MapContainer center={mapCenter} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                              <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Polygon pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} positions={geofenceCoordinates}>
                                  <Tooltip sticky>Restricted Zone</Tooltip>
                              </Polygon>
                              {touristLocations.map(tourist => (
                                  <Marker key={tourist.id} position={tourist.position} icon={createCustomIcon(tourist.inZone)}>
                                      <Popup>Tourist ID: {tourist.id}</Popup>
                                  </Marker>
                              ))}
                          </MapContainer>
                      </div>
                  </div>

                  {/* Zones List */}
                  <div className="bg-white rounded-xl border p-4">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Managed Zones</h3>
                          <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Plus className="w-5 h-5" /></button>
                      </div>
                      <div className="space-y-3">
                          {geoZones.map(zone => (
                              <div key={zone.id} onClick={() => setActiveZone(zone)}
                                  className={`p-3 rounded-lg cursor-pointer border-2 ${activeZone.id === zone.id ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                                  <div className="flex justify-between items-center">
                                      <p className="font-semibold text-gray-800">{zone.name}</p>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${zone.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{zone.risk}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600 mt-2"><Users className="w-4 h-4 mr-2" /><span>{zone.tourists} tourists inside</span></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Heatmap Section */}
              <div className="bg-white rounded-xl border">
                  <div className="p-6 flex justify-between items-center border-b">
                      <h3 className="text-lg font-semibold">Zone Activity Heatmap</h3>
                      <button className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"><ListFilter className="w-4 h-4"/><span>Filter</span></button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-gray-50">
                              <tr>
                                  <th className="p-4 text-sm font-semibold">Zone Name</th>
                                  <th className="p-4 text-sm font-semibold">Risk Level</th>
                                  <th className="p-4 text-sm font-semibold">Active Tourists</th>
                                  <th className="p-4 text-sm font-semibold">Alerts (24h)</th>
                                  <th className="p-4 text-sm font-semibold">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y">
                              {geoZones.map(zone => (
                                  <tr key={zone.id} className="hover:bg-gray-50">
                                      <td className="p-4 font-medium">{zone.name}</td>
                                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${zone.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{zone.risk}</span></td>
                                      <td className="p-4">{zone.tourists}</td>
                                      <td className="p-4">{zone.id * 3 - 2}</td>
                                      <td className="p-4"><div className="flex space-x-2"><button className="p-2 text-gray-500 hover:text-blue-600"><Edit2 className="w-4 h-4"/></button><button className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4"/></button></div></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </main>
        </div>
      </div>
    );
};

export default GeofencingPage;