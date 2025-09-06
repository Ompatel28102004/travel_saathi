import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Users,
  AlertTriangle,
  Mail,
  Lock,
  Smartphone,
  Globe,
} from "lucide-react";

// --- Login Page Component ---
const Login = ({
  handleLogin,
  loginData,
  setLoginData,
  loading,
  showPassword,
  setShowPassword,
  setCurrentPage,
}) => (
  <div className="min-h-screen bg-gray-50 flex">
    {/* Left Side - Branding */}
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
        <div className="mb-8">
          <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center mb-6">
            <img src="/logo.jpg" alt="logo" className="rounded" />
          </div>
          <h1 className="text-4xl font-light mb-4">Smart Tourist Safety</h1>
          <p className="text-blue-100 text-lg font-light">
            Monitoring & Incident Response System
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 mt-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium">Real-time Geo-fencing</h3>
              <p className="text-sm text-blue-100">
                Monitor tourist movements in restricted zones
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium">Emergency Response</h3>
              <p className="text-sm text-blue-100">
                Instant alerts and automated incident reporting
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium">Tourist Management</h3>
              <p className="text-sm text-blue-100">
                Digital ID system with blockchain security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Right Side - Login Form */}
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="lg:hidden w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-light text-gray-900 mb-2">
            Administrator Login
          </h2>
          <p className="text-gray-600">Access the control dashboard</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@touristsafety.gov"
                  required
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Keep me signed in
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <div className="text-center pt-4">
              <span className="text-gray-600">Need admin access? </span>
              <button
                type="button"
                onClick={() => setCurrentPage("signup")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Register here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
);

// --- Signup Page Component ---
const SignupPage = ({
  handleSignup,
  signupData,
  setSignupData,
  loading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  setCurrentPage,
}) => (
  <div className="min-h-screen bg-gray-50 flex">
    {/* Left Side - Form */}
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-light text-gray-900 mb-2">
            Administrator Registration
          </h2>
          <p className="text-gray-600">
            Create your admin account to manage the system
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signupData.fullName}
                  onChange={(e) =>
                    setSignupData({ ...signupData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) =>
                    setSignupData({ ...signupData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData({ ...signupData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="admin@department.gov.in"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={signupData.department}
                  onChange={(e) =>
                    setSignupData({ ...signupData, department: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Operations">Police Department</option>
                  <option value="Tourism">Tourism Department</option>
                  <option value="Support">Emergency Services</option>
                  <option value="Management">System Administration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={signupData.employeeId}
                  onChange={(e) =>
                    setSignupData({ ...signupData, employeeId: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="EMP001"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Create a secure password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                required
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the Terms of Service and acknowledge that I am
                authorized to access this system as a government official.
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {loading ? "Creating Account..." : "Create Admin Account"}
            </button>
            <div className="text-center pt-4">
              <span className="text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => setCurrentPage("login")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    {/* Right Side - Info */}
    <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 flex flex-col justify-center p-12 text-white">
        <div className="mb-8">
          <h3 className="text-2xl font-light mb-6">System Features</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Smartphone className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Digital Tourist ID</h4>
                <p className="text-sm text-gray-300">
                  Blockchain-based secure identity system for all tourists
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Globe className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">AI Anomaly Detection</h4>
                <p className="text-sm text-gray-300">
                  Machine learning algorithms detect unusual patterns and
                  behaviors
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Real-time Monitoring</h4>
                <p className="text-sm text-gray-300">
                  Live tracking and geo-fence alerts for restricted areas
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-6">
          <h4 className="font-medium mb-2">Need Help?</h4>
          <p className="text-sm text-gray-300 mb-3">
            Contact the system administrator for account approval and technical
            support.
          </p>
          <p className="text-sm text-blue-300">support@touristsafety.gov.in</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main AuthPages Component ---
const AuthPages = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "Operations",
    employeeId: "",
    state: "Gujarat",
    password: "",
    confirmPassword: "",
  });

  const backendUrl = "http://localhost:5000";

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    const loginEndpoint = `${backendUrl}/api/admin/admin-login`;

    axios
      .post(loginEndpoint, loginData)
      .then((response) => {
        console.log("Login successful:", response.data);
        const { token, admin } = response.data;

        // Correctly access the nested 'admin' object
        localStorage.setItem("adminToken", token);
        localStorage.setItem("email", admin.email);
        localStorage.setItem("fullName", admin.name);

        navigate("/admin");
      })
      .catch((error) => {
        const errorMessage = error.response
          ? error.response.data.message
          : error.message;
        console.error("Login failed:", errorMessage);
        alert(`Login failed: ${errorMessage}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    const { confirmPassword, ...signupPayload } = signupData;
    const signupEndpoint = `${backendUrl}/api/admin/admin-register`;

    axios
      .post(signupEndpoint, signupPayload)
      .then((response) => {
        console.log("Signup successful:", response.data);
        alert("Account created successfully! Please sign in.");
        setCurrentPage("login");
      })
      .catch((error) => {
        const errorMessage = error.response
          ? error.response.data.message
          : error.message;
        console.error("Signup failed:", errorMessage);
        alert(`Signup failed: ${errorMessage}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (currentPage === "login") {
    return (
      <Login
        handleLogin={handleLogin}
        loginData={loginData}
        setLoginData={setLoginData}
        loading={loading}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        setCurrentPage={setCurrentPage}
      />
    );
  }

  return (
    <SignupPage
      handleSignup={handleSignup}
      signupData={signupData}
      setSignupData={setSignupData}
      loading={loading}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      showConfirmPassword={showConfirmPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      setCurrentPage={setCurrentPage}
    />
  );
};

export default AuthPages;
