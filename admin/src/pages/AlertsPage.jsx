import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Phone,
  MapPin,
  User,
  X,
  Send,
  MessageCircle,
  Eye,
  Search,
  RefreshCw,
  Clock3,
  Loader2,
  Trash2,
} from "lucide-react";

// --- Sub-component for Modal ---
const AlertDetailModal = ({
  alert,
  onClose,
  helpResponse,
  setHelpResponse,
  actionLoading,
  handleSOSResponse,
  markAsResolved,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className={`w-6 h-6 text-red-600`} />
          <h3 className="text-lg font-semibold text-gray-900">
            {alert.category} Alert
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize bg-${
              alert.status === "active" ? "red" : "gray"
            }-100 text-${alert.status === "active" ? "red" : "gray"}-700`}
          >
            {alert.status}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">
            Tourist Information
          </h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">{alert.touristName}</p>
                <p className="text-sm text-gray-600">User ID: {alert.userId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <p className="font-medium text-gray-900">
                {alert.touristContact}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3 mb-2">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    Last Known Location
                  </p>
                  <p className="text-sm text-gray-600">
                    {alert.touristLocation.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.touristLocation.lat}, {alert.touristLocation.lng}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">
            Response & Actions
          </h4>
          {alert.adminResponse && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">
                Previous Response:
              </h5>
              <p className="text-sm text-blue-800">{alert.adminResponse}</p>
            </div>
          )}
          {alert.status !== "resolved" && (
            <div className="space-y-4">
              <textarea
                value={helpResponse}
                onChange={(e) => setHelpResponse(e.target.value)}
                placeholder="Describe actions taken..."
                className="w-full p-3 bg-gray-50 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSOSResponse(alert._id)}
                  disabled={!helpResponse.trim() || actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {actionLoading ? "Submitting..." : "Update Response"}
                  </span>
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
            {alert.status !== "resolved" && (
              <button
                onClick={() => markAsResolved(alert._id)}
                disabled={actionLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Resolved</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AlertsPage = () => {
  const [sosAlerts, setSOSAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [helpResponse, setHelpResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const backendUrl = "http://localhost:5000";

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/alert/getAll`);
      setSOSAlerts(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching SOS alerts:", err);
      setError("Failed to fetch alerts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredAlerts = sosAlerts
    .filter((alert) => {
      const matchesStatus =
        filterStatus === "all" || alert.status === filterStatus;
      const matchesSearch =
        alert.touristName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.userId
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        alert.touristLocation?.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getStatusClass = (status) =>
    ({
      active: "bg-red-100 text-red-700",
      investigating: "bg-yellow-100 text-yellow-700",
      "pending confirmation": "bg-blue-100 text-blue-700",
      resolved: "bg-green-100 text-green-700",
    }[status] || "bg-gray-100 text-gray-700");
  const getStatusAccentColor = (status) =>
    ({
      active: "border-red-500",
      investigating: "border-yellow-500",
      "pending confirmation": "border-blue-500",
      resolved: "border-green-500",
    }[status] || "border-gray-300");

  const updateAlertStatus = async (alertId, payload) => {
    setActionLoading(true);
    try {
      await axios.put(`${backendUrl}/api/alert/update/${alertId}`, payload);
      await fetchAlerts();
      return true;
    } catch (error) {
      console.error("Error updating alert:", error);
      alert("Failed to update alert.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSOSResponse = async (alertId) => {
    const success = await updateAlertStatus(alertId, {
      adminResponse: helpResponse,
      status: "investigating",
    });
    if (success) {
      setSelectedAlert(null);
      setHelpResponse("");
    }
  };

  const markAsResolved = (alertId) =>
    updateAlertStatus(alertId, { status: "resolved" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            SOS Alert Management
          </h1>
          <p className="text-sm text-gray-600">
            Monitor and respond to emergency alerts in real-time.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchAlerts();
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Now</span>
        </button>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, ID, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border-transparent rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="pending confirmation">Pending Confirmation</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredAlerts.length} of {sosAlerts.length} alerts
        </div>
      </div>
      <main>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="ml-2">Loading alerts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3 text-red-700" />
            <div>
              <p className="font-bold text-red-800">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No alerts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getStatusAccentColor(
                  alert.status
                )}`}
              >
                <div className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                            alert.status
                          )}`}
                        >
                          {alert.status}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase">
                          {alert.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {alert.touristName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock3 className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {formatTime(alert.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2 col-span-full">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <span className="text-sm">
                            {alert.touristLocation.address}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 lg:ml-6">
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setHelpResponse(alert.adminResponse || "");
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          helpResponse={helpResponse}
          setHelpResponse={setHelpResponse}
          actionLoading={actionLoading}
          handleSOSResponse={handleSOSResponse}
          markAsResolved={markAsResolved}
        />
      )}
    </div>
  );
};

export default AlertsPage;
