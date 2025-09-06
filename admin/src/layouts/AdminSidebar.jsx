import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Map,
  Shield,
  LogOut,
  UserCircle,
  MapPin, // ✅ New icon for geofencing
} from "lucide-react";

const AdminSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const getLinkClass = ({ isActive }) =>
    `flex items-center p-3 rounded-lg transition-colors text-gray-700 ${
      isActive
        ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30"
        : "hover:bg-gray-100"
    }`;
  const onLogout = () => {
    if (handleLogout) handleLogout(); // do your cleanup (like clearing auth state)
    navigate("/login"); // then redirect
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand Section */}
      <div className="p-4 border-b flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Tourist Safety</h1>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/admin" end className={getLinkClass}>
          <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={getLinkClass}>
          <Users className="w-5 h-5 mr-3" /> Users
        </NavLink>
        <NavLink to="/admin/alerts" className={getLinkClass}>
          <AlertTriangle className="w-5 h-5 mr-3" /> Alerts
        </NavLink>
        <NavLink to="/map" className={getLinkClass}>
          <Map className="w-5 h-5 mr-3" /> Live Map
        </NavLink>
        <NavLink to="/admin/geofencing" className={getLinkClass}>
          <MapPin className="w-5 h-5 mr-3" /> Add Geofencing
        </NavLink>
      </nav>

      {/* User Profile & Logout Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <UserCircle className="w-10 h-10 text-gray-400" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
