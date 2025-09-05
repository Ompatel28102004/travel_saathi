import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/Login";       // Login/Signup page
import Dashboard from "./pages/Dashboard"; // Admin Dashboard
import UsersPage from "./pages/UsersPage"; // Example: Manage Users
import AlertsPage from "./pages/AlertsPage"; // Example: Safety Alerts
import ReportsPage from "./pages/ReportsPage"; // Example: Reports
import SettingsPage from "./pages/SettingsPage"; // Example: Settings
import NotFound from "./pages/NotFound";   // 404 Page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route → Auth page */}
        <Route path="/" element={<AuthPage />} />

        {/* Admin Dashboard + Sub Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
