import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  UserCircle,
  Settings,
} from "lucide-react";

const AdminNavbar = ({ sidebarOpen, setSidebarOpen, handleLogout }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  // This function makes the title dynamic and clear
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/admin":
        return "Dashboard";
      case "/admin/users":
        return "User Management";
      case "/admin/alerts":
        return "Safety Alerts";
      default:
        return "Admin Panel";
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left Side: Title and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Side: Search, Notifications, and Profile */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full max-w-xs bg-gray-50 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <UserCircle className="w-8 h-8 text-gray-500" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
                <div className="p-2">
                  <a
                    href="#"
                    className="flex items-center w-full p-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-2 text-sm text-red-600 rounded-md hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
