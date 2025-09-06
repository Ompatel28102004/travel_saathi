import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  UserX,
  MapPin,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const UsersPage = () => {
  // --- State for API data, loading, and errors ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State for controls (unchanged) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- Data Fetching with useEffect ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // IMPORTANT: Replace with your actual backend URL
        const backendUrl = "http://localhost:5000";
        const response = await fetch(
          `${backendUrl}/api/geofence/location/all-users`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // --- Transform API data to match the structure our UI expects ---
        const transformedUsers = data.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          // API doesn't provide an avatar, so we generate one
          avatar: `https://i.pravatar.cc/150?u=${user._id}`,
          // API doesn't provide a status, so we'll set a default for now
          status: "Active",
          lastSeen: {
            time: user.lastLocation.timestamp,
            // Show zone name if available, otherwise show "Unknown"
            location:
              user.lastLocation.zoneInfo[0]?.zoneName || "Unknown Location",
          },
          // API doesn't provide device info, so we create a placeholder
          device: {
            id: "N/A",
            battery: user.lastLocation.insideZone ? 45 : 75, // Example logic
          },
        }));

        setUsers(transformedUsers);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // The empty array [] means this effect runs only once when the component mounts

  // --- Filtering Logic (works on the fetched data) ---
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Helper functions ---
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

  // --- UI Rendering ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="ml-2 text-gray-600">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
        <AlertTriangle className="w-6 h-6 mr-3" />
        <div>
          <p className="font-bold">Error fetching data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls are the same */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4"></div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative flex-shrink-0">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="w-full sm:w-48 pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>SOS</option>
          </select>
        </div>
      </div>

      {/* User Table now displays the fetched data */}
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
              <tr
                key={user.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-4 flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.id} &middot; {user.email}
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
                  <p className="text-sm font-medium text-gray-800">
                    {user.lastSeen.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.lastSeen.time).toLocaleString()}
                  </p>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <Link
                      to="/map"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View on Map"
                    >
                      <MapPin className="w-5 h-5" />
                    </Link>
                    <button
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
