import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Clock,
  AlertTriangle,
  AlertCircle,
  Navigation,
  FileText,
  HeartPulse,
  ShieldAlert,
  BrainCircuit,
  Zap,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

const Dashboard = () => {
  // --- State for Dashboard Stats & Alerts ---
  const [dashboardStats, setDashboardStats] = useState({
    activeTourists: 0,
    emergencyAlerts: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- State for AI Analysis Log ---
  const [analysisLog, setAnalysisLog] = useState([]);
  const [logLoading, setLogLoading] = useState(true);

  // --- Backend API Configuration ---
  const backendUrl = import.meta.env.VITE_API_URL ||"http://localhost:5000";

  // --- Data Fetching Logic ---
  const fetchDashboardData = async () => {
    try {
      const [alertsResponse, usersResponse] = await Promise.all([
        axios.get(`${backendUrl}/api/alert/getAll`),
        axios.get(`${backendUrl}/api/geofence/location/all-users`),
      ]);

      const allAlerts = alertsResponse.data || [];
      const allUsers = usersResponse.data || [];

      const activeAlertsCount = allAlerts.filter(
        (a) => a.status && a.status.toLowerCase() === "active"
      ).length;

      setDashboardStats({
        activeTourists: allUsers.length,
        emergencyAlerts: activeAlertsCount,
      });

      const sortedAlerts = allAlerts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentAlerts(sortedAlerts.slice(0, 5));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(
        "Could not load dashboard data. Please ensure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisLog = async () => {
    setLogLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/ai/results`);
      setAnalysisLog(response.data);
    } catch (err) {
      console.error("Failed to fetch AI analysis log:", err);
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAnalysisLog();
    const intervalId = setInterval(fetchDashboardData, 30000); // Auto-refresh data
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // --- Helper Functions ---
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const getAlertIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "medical":
        return <HeartPulse className="w-5 h-5 text-red-500" />;
      case "sos":
        return <ShieldAlert className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  // --- Render Logic ---
  if (loading) {
    return <div className="p-6 text-center">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500">
          A real-time summary of tourist safety activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Tourists
              </p>
              <p className="text-4xl font-bold text-green-600">
                {dashboardStats.activeTourists.toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-4xl font-bold text-red-600">
                {dashboardStats.emergencyAlerts}
              </p>
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Log Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BrainCircuit className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI Analysis Log
              </h3>
              <p className="text-sm text-gray-500">
                Recently completed anomaly detection reports.
              </p>
            </div>
          </div>
          <button
            onClick={fetchAnalysisLog}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <RefreshCw
              className={`w-5 h-5 ${logLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="p-6 min-h-[10rem] flex flex-col justify-center">
          {logLoading ? (
            <div className="text-center text-gray-500 flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Loading analysis log...</span>
            </div>
          ) : analysisLog.length > 0 ? (
            <div className="space-y-4">
              {analysisLog.map((result) => (
                <div
                  key={result._id}
                  className="p-4 bg-gray-50 border-l-4 border-gray-300 rounded-r-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {result.userName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">AI Reasoning:</span>{" "}
                        {result.reasoning}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(result.createdAt)}
                      </p>
                    </div>
                    <div
                      className={`text-center ml-4 flex-shrink-0 p-2 rounded-lg ${
                        result.severity >= 7 ? "bg-red-100" : "bg-yellow-100"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          result.severity >= 7
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Severity
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          result.severity >= 7
                            ? "text-red-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {result.severity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <ShieldCheck className="w-10 h-10 mx-auto text-green-500 mb-2" />
              <p>No completed analysis reports found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Alerts & Incidents
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert.category)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.touristName} in{" "}
                        <span className="font-semibold">
                          {alert.touristLocation.address}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(alert.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        alert.status?.toLowerCase() === "active"
                          ? "bg-red-100 text-red-700"
                          : alert.status?.toLowerCase() === "investigating"
                          ? "bg-yellow-100 text-yellow-700"
                          : alert.status?.toLowerCase() === "resolved"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent alerts.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/alerts")}
              className="w-full flex items-center space-x-3 p-4 bg-red-50 rounded-lg text-left hover:bg-red-100 transition-colors"
            >
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">View Active Alerts</p>
                <p className="text-sm text-red-700">Respond to emergencies</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/map")}
              className="w-full flex items-center space-x-3 p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
            >
              <Navigation className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Live Map</p>
                <p className="text-sm text-green-700">Track all tourists</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/reports")}
              className="w-full flex items-center space-x-3 p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors"
            >
              <FileText className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-900">Generate Report</p>
                <p className="text-sm text-purple-700">
                  Create incident reports
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
