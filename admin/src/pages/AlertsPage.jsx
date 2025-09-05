import React, { useState } from "react";
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
  Shield,
  Eye,
  Calendar,
  Navigation,
  FileText,
  Search,
  RefreshCw,
  PhoneCall,
  MapPinned,
  UserCheck,
  AlertOctagon,
  Clock3,
  MessageSquare,
  ExternalLink,
  Download,
} from "lucide-react";

// The component is renamed to AlertsPage to better reflect its purpose.
const AlertsPage = () => {
  // All state related to the alerts functionality is kept.
  // The 'isSidebarOpen' state has been removed.
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [helpResponse, setHelpResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");

  // Mock SOS data - replace with API calls in a real application
  const [sosAlerts, setSOSAlerts] = useState([
    {
      id: "SOS001",
      userId: "TID2847",
      userName: "Raj Kumar",
      phone: "+91 98765 43210",
      location: {
        lat: 25.5941,
        lng: 85.1376,
        address: "Kaziranga Core Area, Sector 4, Assam",
      },
      timestamp: "2024-01-15T10:30:00Z",
      status: "active",
      priority: "high",
      type: "sos",
      description:
        "Tourist pressed SOS button - No response for 5 minutes. Last seen near watchtower.",
      adminResponse: null,
      userConfirmed: false,
      assignedTo: "Admin Team 1",
      batteryLevel: 23,
      deviceId: "DEV001",
    },
    {
      id: "SOS002",
      userId: "TID3921",
      userName: "Priya Singh",
      phone: "+91 87654 32109",
      location: {
        lat: 25.2677,
        lng: 91.769,
        address: "Cherrapunji Falls Trek Route, Meghalaya",
      },
      timestamp: "2024-01-15T09:45:00Z",
      status: "investigating",
      priority: "medium",
      type: "missing",
      description:
        "No location updates for 2 hours. Last known position at waterfall viewpoint.",
      adminResponse:
        "Contacted local rescue team, searching area. Tourist found safe and escorted back.",
      userConfirmed: false,
      assignedTo: "Rescue Team Alpha",
      batteryLevel: 67,
      deviceId: "DEV002",
    },
    {
      id: "SOS003",
      userId: "TID4582",
      userName: "Amit Patel",
      phone: "+91 76543 21098",
      location: {
        lat: 25.1833,
        lng: 91.7333,
        address: "Dawki Bridge Border Area, Meghalaya",
      },
      timestamp: "2024-01-15T08:15:00Z",
      status: "resolved",
      priority: "high",
      type: "panic",
      description: "Panic button activated during river crossing activity.",
      adminResponse:
        "Emergency response team dispatched. Tourist safely rescued from river. Medical check completed.",
      userConfirmed: true,
      assignedTo: "Emergency Team Beta",
      batteryLevel: 89,
      deviceId: "DEV003",
    },
    {
      id: "SOS004",
      userId: "TID1234",
      userName: "Sarah Wilson",
      phone: "+91 65432 10987",
      location: {
        lat: 25.5783,
        lng: 85.1345,
        address: "Tawang Monastery Trek, Arunachal Pradesh",
      },
      timestamp: "2024-01-15T11:20:00Z",
      status: "pending_confirmation",
      priority: "medium",
      type: "medical",
      description:
        "Health monitoring device detected irregular heartbeat pattern.",
      adminResponse:
        "Medical team contacted tourist. Provided first aid guidance. Tourist stable and continuing journey.",
      userConfirmed: false,
      assignedTo: "Medical Response Unit",
      batteryLevel: 45,
      deviceId: "DEV004",
    },
  ]);

  // All helper functions and logic for filtering, sorting, and updating alerts are preserved.
  const filteredAlerts = sosAlerts
    .filter((alert) => {
      const matchesStatus =
        filterStatus === "all" || alert.status === filterStatus;
      const matchesSearch =
        alert.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location.address.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "timestamp":
          return new Date(b.timestamp) - new Date(a.timestamp);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleSOSResponse = async (sosId) => {
    setLoading(true);
    try {
      // API call would go here
      setSOSAlerts((prev) =>
        prev.map((alert) =>
          alert.id === sosId
            ? { ...alert, adminResponse: helpResponse, status: "investigating" }
            : alert
        )
      );
      setSelectedAlert(null);
      setHelpResponse("");
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (sosId) => {
    try {
      // API call would go here
      setSOSAlerts((prev) =>
        prev.map((alert) =>
          alert.id === sosId ? { ...alert, status: "resolved" } : alert
        )
      );
    } catch (error) {
      console.error("Error marking as resolved:", error);
    }
  };

  const requestUserConfirmation = async (sosId) => {
    try {
      // API call to send confirmation request to user
      setSOSAlerts((prev) =>
        prev.map((alert) =>
          alert.id === sosId
            ? { ...alert, status: "pending_confirmation" }
            : alert
        )
      );
    } catch (error) {
      console.error("Error requesting confirmation:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-700 border-red-200";
      case "investigating":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "pending_confirmation":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // The Sidebar component has been removed entirely.

  // The Alert Detail Modal is kept as it is integral to the dashboard's functionality.
  const AlertDetailModal = ({ alert, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${getPriorityColor(
                  alert.priority
                )}`}
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {alert.type.toUpperCase()} Alert - {alert.id}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  alert.status
                )}`}
              >
                {alert.status.replace("_", " ")}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Tourist Info */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Tourist Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {alert.userName}
                      </p>
                      <p className="text-sm text-gray-600">
                        ID: {alert.userId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.phone}</p>
                      <div className="flex space-x-2 mt-1">
                        <button className="text-sm text-blue-600 hover:underline flex items-center">
                          <PhoneCall className="w-3 h-3 mr-1" />
                          Call Now
                        </button>
                        <button className="text-sm text-green-600 hover:underline flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          SMS
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3 mb-2">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Current Location
                        </p>
                        <p className="text-sm text-gray-600">
                          {alert.location.address}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.location.lat}, {alert.location.lng}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-sm text-blue-600 hover:underline flex items-center">
                        <MapPinned className="w-3 h-3 mr-1" />
                        View on Map
                      </button>
                      <button className="text-sm text-purple-600 hover:underline flex items-center">
                        <Navigation className="w-3 h-3 mr-1" />
                        Live Track
                      </button>
                      <button className="text-sm text-gray-600 hover:underline flex items-center">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Google Maps
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Device Battery</p>
                      <p className="font-medium text-gray-900">
                        {alert.batteryLevel}%
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Device ID</p>
                      <p className="font-medium text-gray-900">
                        {alert.deviceId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Alert Timeline */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Alert Triggered
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                  {alert.adminResponse && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Admin Response
                        </p>
                        <p className="text-sm text-gray-600">
                          Response provided by {alert.assignedTo}
                        </p>
                      </div>
                    </div>
                  )}
                  {alert.status === "resolved" && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Resolved</p>
                        <p className="text-sm text-gray-600">
                          {alert.userConfirmed
                            ? "Confirmed by user"
                            : "Marked by admin"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right Column - Actions */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Alert Details
                </h4>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertOctagon className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 mb-2">
                        Emergency Description
                      </p>
                      <p className="text-sm text-red-800">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Priority Level</p>
                    <div className="flex items-center mt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${getPriorityColor(
                          alert.priority
                        )} mr-2`}
                      />
                      <p className="font-medium text-gray-900 capitalize">
                        {alert.priority}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Assigned To</p>
                    <p className="font-medium text-gray-900">
                      {alert.assignedTo}
                    </p>
                  </div>
                </div>
              </div>
              {/* Admin Response Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Response & Actions
                </h4>
                {alert.adminResponse ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <h5 className="font-medium text-blue-900 mb-2">
                      Previous Response:
                    </h5>
                    <p className="text-sm text-blue-800">
                      {alert.adminResponse}
                    </p>
                  </div>
                ) : null}
                {alert.status !== "resolved" && (
                  <div className="space-y-4">
                    <textarea
                      value={helpResponse}
                      onChange={(e) => setHelpResponse(e.target.value)}
                      placeholder="Describe the help provided, actions taken, or current status..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleSOSResponse(alert.id)}
                        disabled={!helpResponse.trim() || loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>
                          {loading ? "Submitting..." : "Update Response"}
                        </span>
                      </button>
                      <button
                        onClick={() => requestUserConfirmation(alert.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Request User Confirmation</span>
                      </button>
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  {alert.status !== "resolved" && (
                    <button
                      onClick={() => markAsResolved(alert.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Resolved</span>
                    </button>
                  )}
                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <Navigation className="w-4 h-4" />
                    <span>Live Track</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    <FileText className="w-4 h-4" />
                    <span>Create Report</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    // The main container div has been simplified. It no longer needs flexbox properties
    // related to the sidebar layout.
    <div className="flex flex-col w-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* The hamburger menu button has been removed. */}
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                SOS Alert Management
              </h1>
              <p className="text-sm text-gray-600">
                Monitor and respond to emergency alerts
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">Live Updates</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-600">Active Alerts</p>
            <p className="text-lg font-bold text-red-700">
              {sosAlerts.filter((a) => a.status === "active").length}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-600">Investigating</p>
            <p className="text-lg font-bold text-yellow-700">
              {sosAlerts.filter((a) => a.status === "investigating").length}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600">Pending Confirmation</p>
            <p className="text-lg font-bold text-blue-700">
              {
                sosAlerts.filter((a) => a.status === "pending_confirmation")
                  .length
              }
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-600">Resolved Today</p>
            <p className="text-lg font-bold text-green-700">
              {sosAlerts.filter((a) => a.status === "resolved").length}
            </p>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="pending_confirmation">Pending Confirmation</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="timestamp">Sort by Time</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredAlerts.length} of {sosAlerts.length} alerts
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <main className="flex-1 p-4 lg:p-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No alerts found</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow ${
                  alert.status === "active"
                    ? "border-red-200"
                    : alert.status === "investigating"
                    ? "border-yellow-200"
                    : alert.status === "pending_confirmation"
                    ? "border-blue-200"
                    : "border-gray-200"
                }`}
              >
                <div className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Alert Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(
                            alert.priority
                          )}`}
                        />
                        <span className="font-semibold text-gray-900">
                          {alert.id}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            alert.status
                          )}`}
                        >
                          {alert.status.replace("_", " ")}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase">
                          {alert.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {alert.userName}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({alert.userId})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {alert.phone}
                            </span>
                            <button className="text-blue-600 hover:text-blue-800">
                              <PhoneCall className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">
                                {alert.location.address}
                              </p>
                              <p className="text-xs text-gray-500">
                                {alert.location.lat}, {alert.location.lng}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock3 className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {formatTime(alert.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserCheck className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Assigned to: {alert.assignedTo}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  alert.batteryLevel > 50
                                    ? "bg-green-500"
                                    : alert.batteryLevel > 20
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="text-xs text-gray-500">
                                Battery: {alert.batteryLevel}%
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              Device: {alert.deviceId}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-800">
                          {alert.description}
                        </p>
                      </div>
                      {alert.adminResponse && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <h5 className="text-sm font-medium text-blue-900 mb-1">
                            Admin Response:
                          </h5>
                          <p className="text-sm text-blue-800">
                            {alert.adminResponse}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 lg:ml-6">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      {alert.status === "active" && (
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 whitespace-nowrap"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Respond Now</span>
                        </button>
                      )}
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 whitespace-nowrap">
                        <Navigation className="w-4 h-4" />
                        <span>Live Track</span>
                      </button>
                      {alert.status !== "resolved" && (
                        <button
                          onClick={() => markAsResolved(alert.id)}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
};

export default AlertsPage;
