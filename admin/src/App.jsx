import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Layouts
import AdminLayout from "./layouts/AdminLayout";
import MapLayout from "./layouts/MapLayout";

// Import Pages
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import UsersPage from "./pages/UsersPage";
import AlertsPage from "./pages/AlertsPage";
import Login from "./pages/Login";
// ... etc

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: The Full-Screen Map Experience */}
        <Route path="/map" element={<MapLayout />}>
          <Route index element={<MapPage />} />
        </Route>
        {/* Route 2: The Standard Admin Dashboard Experience */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          {/* Add other dashboard-related pages here */}
        </Route>
        {/* Add other routes like Login and NotFound here */}
        Example: <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
