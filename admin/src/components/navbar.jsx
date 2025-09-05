import React from "react";
import { Bell, UserCircle, Search } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between px-6 py-3">
      {/* Search Bar */}
      <div className="flex items-center w-1/2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
      </div>

      {/* Right Side: Notifications + Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            3
          </span>
        </button>

        {/* Profile */}
        <button className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-1 rounded-lg">
          <UserCircle className="w-8 h-8 text-gray-600" />
          <span className="hidden sm:inline text-gray-700 font-medium">Admin</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
