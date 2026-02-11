import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Added for UX feedback
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const login = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:8080/auth/login", data);
      
      // Since your Java service returns LoginResponse(token, message)
      // we must access res.data.token specifically.
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", data.username);
        
        // Navigation trigger
        navigate("/dashboard");
      } else {
        // Handles cases where backend returns 200 but message says "User not found"
        alert(res.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || "Login failed";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            WORK WITH
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              SECURE FILES
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-4 tracking-widest">WE ENCRYPT THE FUTURE</p>
          
          <p className="text-gray-500 leading-relaxed mb-8">
            As an award-winning encryption platform, we enable users to make their mark in history. Begin your secure journey with us.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <h3 className="font-semibold mb-1">Encryption</h3>
              <p className="text-xs text-gray-400">Military-grade security</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
              </div>
              <h3 className="font-semibold mb-1">Sharing</h3>
              <p className="text-xs text-gray-400">Collaborate securely</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-gray-400 text-sm mb-8">Login to access your secure cloud storage</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 focus:outline-none transition-all placeholder-gray-600"
                    placeholder="Enter your username"
                    value={data.username}
                    onChange={(e) => setData({ ...data, username: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 focus:outline-none transition-all placeholder-gray-600"
                    placeholder="Enter your password"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    onKeyPress={(e) => e.key === "Enter" && login()}
                  />
                </div>

                <button
                  onClick={login}
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all transform active:scale-95 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "AUTHENTICATING..." : "LOGIN NOW"}
                </button>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-indigo-400 font-semibold hover:underline">
                      Create account.
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out infinite; animation-delay: 2s; }
      `}</style>
    </div>
  );
}