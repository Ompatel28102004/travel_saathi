import React from "react";
import { LayoutDashboard, Bell, Users, Map, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom"; // if you’re using react-router

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Brand / Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-green-600">SmartTour Admin</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </Link>

        <Link
          to="/alerts"
          className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <Bell className="w-5 h-5 mr-3" />
          Alerts
        </Link>

        <Link
          to="/tourists"
          className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <Users className="w-5 h-5 mr-3" />
          Tourists
        </Link>

        <Link
          to="/map"
          className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <Map className="w-5 h-5 mr-3" />
          Map
        </Link>

        <Link
          to="/settings"
          className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
