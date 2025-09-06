import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";

// Import Layouts
import AdminLayout from "./layouts/AdminLayout";
import MapLayout from "./layouts/MapLayout";

// Import Pages
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import UsersPage from "./pages/UsersPage";
import AlertsPage from "./pages/AlertsPage";
import Login from "./pages/Login";
import Geofencing from "./pages/Geofencing";
import NotFound from "./pages/NotFound"; // Import your NotFound page

// ... etc

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- ADD THIS: The dedicated route for your Login page --- */}
        <Route path="/login" element={<Login />} />

        {/* --- ADD THIS: Redirect the root URL "/" to the "/login" page --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Route 1: The Full-Screen Map Experience */}
        <Route path="/map" element={<MapLayout />}>
          <Route index element={<MapPage />} />
        </Route>
        {/* Route 2: The Standard Admin Dashboard Experience */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="geofencing" element={<Geofencing />} />
          {/* Add other dashboard-related pages here */}
        </Route>
        {/* Fallback route for any URL that doesn't match */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
