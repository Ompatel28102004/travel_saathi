import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Filter,
  Plus,
  UserX,
  MapPin,
  Loader2,
  AlertTriangle,
  BrainCircuit,
  Check,
} from "lucide-react";

// A simple, self-contained Toast Notification Component
const Toast = ({ message, show }) => {
  if (!show) return null;
  return (
    <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out flex items-center gap-2">
      <Check className="w-5 h-5 text-green-400" />
      <span>{message}</span>
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [analyzingUserId, setAnalyzingUserId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  const backendUrl = import.meta.env.VITE_API_URL ||"http://localhost:5000";

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${backendUrl}/api/geofence/location/all-users`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        const transformedUsers = data.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: `https://i.pravatar.cc/150?u=${user._id}`,
          status: user.lastLocation.insideZone ? "SOS" : "Active",
          lastSeen: {
            time: user.lastLocation.timestamp,
            location:
              user.lastLocation.zoneInfo[0]?.zoneName ||
              user.lastLocation.address ||
              "Unknown Location",
          },
        }));
        setUsers(transformedUsers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRunAnalysis = async (userId, userName) => {
    setAnalyzingUserId(userId);
    try {
      await axios.post(`${backendUrl}/api/ai/start-analysis/${userId}`);
      setToast({ show: true, message: `Analysis started for ${userName}.` });
      setTimeout(() => setToast({ show: false, message: "" }), 3000);
    } catch (err) {
      alert(`Failed to start analysis for ${userName}.`);
    } finally {
      setTimeout(() => setAnalyzingUserId(null), 1000);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "SOS":
        return "bg-red-100 text-red-700 animate-pulse";
      case "Inactive":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  if (error)
    return <div className="p-6 bg-red-50 text-red-700 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <Toast message={toast.message} show={toast.show} />
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600">
            Monitor, manage, and assist all registered tourists.
          </p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative flex-shrink-0">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>SOS</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-sm font-semibold">User</th>
              <th className="p-4 text-sm font-semibold">Status</th>
              <th className="p-4 text-sm font-semibold">Last Seen</th>
              <th className="p-4 text-sm font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50">
                <td className="p-4 flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.id.slice(-12)} &middot; {user.email}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-sm font-medium">
                    {user.lastSeen.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.lastSeen.time).toLocaleString()}
                  </p>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleRunAnalysis(user.id, user.name)}
                      disabled={analyzingUserId === user.id}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md disabled:opacity-50"
                      title="Run AI Analysis"
                    >
                      {analyzingUserId === user.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <BrainCircuit className="w-5 h-5" />
                      )}
                    </button>
                    <Link
                      to="/map"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="View on Map"
                    >
                      <MapPin className="w-5 h-5" />
                    </Link>
                    <button
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Deactivate User"
                    >
                      <UserX className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
