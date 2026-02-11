import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8080/auth/verify-otp?username=${state.username}&code=${code}`
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", state.username);
      navigate("/dashboard");
    } catch {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans px-4">
      {/* Top Navigation / Logo area */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="bg-purple-600 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight">EncryptionFILE</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center max-w-6xl w-full gap-12">
        
        {/* Left Side: Branding Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            VERIFY YOUR <br /> IDENTITY
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Security is our priority. Enter the code sent to your email to access your secure vault.
          </p>
        </div>

        {/* Right Side: Verify OTP Card */}
        <div className="md:w-1/2 w-full max-w-md">
          <div className="bg-gradient-to-br from-[#1a1333] to-[#0d0d0d] p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-bold mb-2">Verify OTP</h2>
            <p className="text-gray-400 text-sm mb-8">
              Code sent to <span className="text-purple-400">{state?.username || "your email"}</span>
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">OTP Code</label>
                <input
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-4 text-center text-2xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-700 transition-all"
                  placeholder="000000"
                  value={code}
                  maxLength={6}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                className={`w-full mt-4 py-3 rounded-full font-bold transition-all transform active:scale-95 flex items-center justify-center ${
                  loading 
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {loading ? "VERIFYING..." : "CONFIRM CODE"}
              </button>

              <div className="text-center space-y-2 mt-6">
                <p className="text-sm text-gray-400">
                  Didn't receive a code?{" "}
                  <button className="text-purple-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer">
                    Resend
                  </button>
                </p>
                <Link to="/login" className="block text-xs text-gray-500 hover:text-white transition-colors">
                  Go back to login
                </Link>
              </div>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest">
            Protected by military-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}