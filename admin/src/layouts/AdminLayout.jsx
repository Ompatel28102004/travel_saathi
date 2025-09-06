import React from "react";
import Sidebar from "./AdminSidebar";
import Navbar from "./AdminNavbar";
import { Outlet } from "react-router-dom"; // Important import!

const AdminLayout = () => {
  return (
    <div className="flex">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />

        {/* Page content will be rendered here */}
        <main className="p-6 bg-gray-50 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
