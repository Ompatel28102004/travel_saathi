import React from "react";
import {
  Activity,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Wifi,
  Navigation,
  FileText,
} from "lucide-react";

const Dashboard = () => {
  // Mock data for the dashboard
  const dashboardStats = {
    activeTourists: 1923,
    emergencyAlerts: 5,
    iotDevices: 156,
  };

  const recentAlerts = [
    {
      id: 1,
      type: "emergency",
      message: "Tourist entered restricted zone - Kaziranga Core Area",
      time: "2 min ago",
      status: "active",
    },
    {
      id: 2,
      type: "missing",
      message: "No activity detected for 3 hours - Tourist ID: TID2847",
      time: "15 min ago",
      status: "investigating",
    },
    {
      id: 3,
      type: "panic",
      message: "Panic button pressed - Cherrapunji Trek Route",
      time: "1 hour ago",
      status: "resolved",
    },
    {
      id: 4,
      type: "geofence",
      message: "Multiple tourists near border zone - Dawki Bridge",
      time: "2 hours ago",
      status: "monitoring",
    },
    {
      id: 5,
      type: "health",
      message: "IoT device shows irregular heartbeat - Device ID: IOT156",
      time: "3 hours ago",
      status: "resolved",
    },
  ];

  const touristHeatmap = [
    { zone: "Shillong City Center", count: 456, risk: "low" },
    { zone: "Cherrapunji Falls", count: 234, risk: "medium" },
    { zone: "Kaziranga National Park", count: 189, risk: "high" },
    { zone: "Dawki River", count: 167, risk: "medium" },
    { zone: "Tawang Monastery", count: 145, risk: "low" },
  ];

  return (
    <div className="space-y-6">
      {/* ## Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Tourists */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <p className="text-3xl font-bold text-green-600">
                {dashboardStats.activeTourists.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-sm text-gray-600">Real-time tracking</span>
          </div>
        </div>

        {/* Emergency Alerts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Emergency Alerts
              </p>
              <p className="text-3xl font-bold text-red-600">
                {dashboardStats.emergencyAlerts}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">
              2 require immediate action
            </span>
          </div>
        </div>

        {/* IoT Devices */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">IoT Devices</p>
              <p className="text-3xl font-bold text-purple-600">
                {dashboardStats.iotDevices}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">98% online status</span>
          </div>
        </div>
      </div>

      {/* ## Recent Alerts + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Alerts & Incidents
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === "emergency"
                        ? "bg-red-500"
                        : alert.type === "panic"
                        ? "bg-orange-500"
                        : alert.type === "missing"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      alert.status === "active"
                        ? "bg-red-100 text-red-700"
                        : alert.status === "investigating"
                        ? "bg-yellow-100 text-yellow-700"
                        : alert.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Tourist Hotspots
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {touristHeatmap.map((zone, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {zone.zone}
                  </p>
                  <p className="text-xs text-gray-500">{zone.count} tourists</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    zone.risk === "high"
                      ? "bg-red-100 text-red-700"
                      : zone.risk === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {zone.risk} risk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ## Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="p-4 bg-red-50 rounded-lg text-center hover:bg-red-100 transition-colors">
            <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-red-900">
              View Active Alerts
            </p>
          </button>

          <button className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
            <Navigation className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">Live Map</p>
          </button>

          <button className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
            <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-900">
              Generate Report
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
