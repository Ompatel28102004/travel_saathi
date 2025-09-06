import React from "react";
import { Link } from "react-router-dom";
import { Shield, LayoutDashboard, Search } from "lucide-react";

const MapNavbar = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-[1000] p-3">
      <div className="container mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Live Map View</h1>
              <p className="text-xs text-gray-500">Smart Tourist Safety</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search location..."
                className="pl-10 pr-4 py-2 w-48 border-transparent bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <Link
              to="/admin"
              className="p-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              title="Back to Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MapNavbar;
