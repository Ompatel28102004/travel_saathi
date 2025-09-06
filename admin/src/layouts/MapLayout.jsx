import React from "react";
import { Outlet } from "react-router-dom";
import MapNavbar from "../components/MapNavbar";

const MapLayout = () => {
  return (
    <div className="relative min-h-screen bg-gray-100">
      <MapNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MapLayout;
