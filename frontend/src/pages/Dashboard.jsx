import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [sharedFiles, setSharedFiles] = useState([]);
  const [myFiles, setMyFiles] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Share states
  const [shareFileId, setShareFileId] = useState("");
  const [shareUsername, setShareUsername] = useState("");
  const [sharing, setSharing] = useState(false);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  /* ===================== AXIOS INSTANCE ===================== */
  const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  /* ===================== TOAST NOTIFICATION ===================== */
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4000);
  };

  /* ===================== UPLOAD ===================== */
  const uploadFile = async () => {
    if (!file) return alert("Select a file first");
    if (!token) return alert("Not authenticated");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await api.post("/files/upload", formData);
      
      let messageText = "File uploaded successfully";
      let fileId = null;
      
      if (res.data) {
        if (typeof res.data === "string") {
          messageText = res.data;
        } else if (typeof res.data === "object") {
          if (res.data.message) {
            messageText = res.data.message;
          }
          if (res.data.id) {
            fileId = res.data.id;
          }
        }
      }
      
      if (!fileId) {
        try {
          const myFilesRes = await api.get("/files/my-files");
          if (myFilesRes.data && myFilesRes.data.length > 0) {
            const latestFile = myFilesRes.data[myFilesRes.data.length - 1];
            fileId = latestFile.id;
          }
        } catch (err) {
          console.error("Could not fetch file ID", err);
        }
      }
      
      if (fileId) {
        setShareFileId(String(fileId));
        messageText += ` - File ID: ${fileId}`;
      }
      
      showToast(messageText, "success");
      setFile(null);

      const input = document.querySelector('input[type="file"]');
      if (input) input.value = "";
      
      loadMyFiles();
    } catch (err) {
      handleAxiosError(err, "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== DOWNLOAD ===================== */
  const downloadFile = async (id) => {
    if (!id) return alert("Invalid file ID");
    if (!token) return alert("Not authenticated");

    try {
      const res = await api.get(`/files/download/${id}`, {
        responseType: "blob",
      });

      if (!(res.data instanceof Blob)) {
        console.error("Expected Blob, got:", typeof res.data);
        showToast("Error: Invalid response format", "error");
        return;
      }

      const disposition = res.headers["content-disposition"];
      let fileName = "downloaded_file";
      
      if (disposition) {
        const rfc5987Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (rfc5987Match && rfc5987Match[1]) {
          fileName = decodeURIComponent(rfc5987Match[1]);
        } else {
          const standardMatch = disposition.match(/filename="([^"]+)"/i);
          if (standardMatch && standardMatch[1]) {
            fileName = standardMatch[1];
          } else {
            const simpleMatch = disposition.match(/filename=([^;]+)/i);
            if (simpleMatch && simpleMatch[1]) {
              fileName = simpleMatch[1].trim().replace(/['"]/g, '');
            }
          }
        }
      }

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      showToast(`File "${fileName}" downloaded successfully`, "success");
    } catch (err) {
      console.error("Download error:", err);
      if (err.response?.status === 403) {
        showToast("You don't have permission to download this file", "error");
      } else if (err.response?.status === 404) {
        showToast("File not found", "error");
      } else {
        handleAxiosError(err, "Download failed");
      }
    }
  };

  /* ===================== SHARE FILE ===================== */
  const shareFile = async () => {
    if (!shareFileId || !shareUsername)
      return alert("Enter file ID and username");

    if (!token) return alert("Not authenticated");

    setSharing(true);

    try {
      const res = await api.post(
        "/files/share",
        null,
        {
          params: {
            fileId: shareFileId,
            usernameToShare: shareUsername,
          },
        }
      );

      let messageText = "File shared successfully";
      if (res.data) {
        if (typeof res.data === "string") {
          messageText = res.data;
        } else if (typeof res.data === "object" && res.data.message) {
          messageText = res.data.message;
        } else if (typeof res.data === "object") {
          messageText = JSON.stringify(res.data);
        }
      }
      showToast(messageText, "success");
      setShareFileId("");
      setShareUsername("");
    } catch (err) {
      handleAxiosError(err, "Sharing failed");
    } finally {
      setSharing(false);
    }
  };

  /* ===================== MY FILES ===================== */
  const loadMyFiles = async () => {
    if (!token) return;
    try {
      const res = await api.get("/files/my-files");
      setMyFiles(res.data);
    } catch (err) {
      console.error("Failed to load my files", err);
    }
  };

  /* ===================== SHARED FILES ===================== */
  const loadSharedFiles = async () => {
    if (!token) return;
    try {
      const res = await api.get("/files/shared-with-me");
      setSharedFiles(res.data);
    } catch (err) {
      console.error("Failed to load shared files", err);
    }
  };

  /* ===================== ERROR HANDLER ===================== */
  const handleAxiosError = (err, fallback) => {
    if (err.response) {
      showToast(
        typeof err.response.data === "string"
          ? err.response.data
          : fallback,
        "error"
      );
    } else if (err.request) {
      showToast("Network error – server not reachable", "error");
    } else {
      showToast(fallback, "error");
    }
  };

  /* ===================== INIT ===================== */
  useEffect(() => {
    loadSharedFiles();
    loadMyFiles();
  }, []);

  /* ===================== LOGOUT ===================== */
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`min-w-[320px] max-w-md rounded-2xl shadow-2xl px-6 py-4 flex items-start gap-3 backdrop-blur-lg ${
              toast.type === "error"
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === "error" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="flex-shrink-0 ml-2 text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">EncryptionFILE</h1>
              <p className="text-xs text-gray-400">Secure Cloud Storage</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-sm font-bold">
                {username ? username.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-sm font-medium">{username}</span>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            WORK WITH FILES
          </h2>
          <p className="text-xl text-gray-400 mb-2">WE SECURE THE FUTURE</p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            As an award-winning encryption platform, we enable users to make their mark in history.
            Begin your secure journey with us.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Upload Card */}
          <div className="card hover-lift bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl transition-all duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6">📤 Upload Files</h3>
              
              <label className="block border-2 border-dashed border-white/20 rounded-2xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-white/5 transition-all duration-300 hover:scale-[1.02]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-lg mb-2">Drop files here or click to browse</p>
                <p className="text-sm text-gray-400">Encrypted & secure upload</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={loading}
                />
              </label>

              {file && (
                <div className="bg-white/5 rounded-xl p-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              <button
                onClick={uploadFile}
                disabled={loading || !file}
                className="w-full py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-2xl hover:shadow-white/20"
              >
                {loading ? "Uploading..." : "UPLOAD NOW"}
              </button>
            </div>
          </div>

          {/* Share Card */}
          <div className="card hover-lift bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 relative overflow-hidden transition-all duration-300">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-full blur-3xl transition-all duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6">🔗 Share Files</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">File ID</label>
                  <input
                    type="number"
                    value={shareFileId}
                    onChange={(e) => setShareFileId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 focus:outline-none transition-all duration-300 hover:bg-white/10"
                    placeholder="Enter file ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={shareUsername}
                    onChange={(e) => setShareUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 focus:outline-none transition-all duration-300 hover:bg-white/10"
                    placeholder="Username to share with"
                  />
                </div>
              </div>

              <button
                onClick={shareFile}
                disabled={sharing || !shareFileId || !shareUsername}
                className="w-full py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50"
              >
                {sharing ? "Sharing..." : "SHARE FILE"}
              </button>

              <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-sm font-medium mb-2">📥 Shared With You</p>
                <p className="text-2xl font-bold">{sharedFiles.length}</p>
                <p className="text-xs text-gray-400 mt-1">files waiting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Files Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Files */}
          <div className="card hover-lift bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">📁 My Files</h3>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                {myFiles.length} files
              </span>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-auto">
              {myFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No files yet</p>
                </div>
              ) : (
                myFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-indigo-400/50 hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{f.fileName}</p>
                        <p className="text-xs text-gray-400">ID: {f.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => downloadFile(f.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-30 0 hover:bg-indigo-500/30 text-xs font-medium transition-all duration-300 hover:scale-105"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => setShareFileId(String(f.id))}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-all duration-300 hover:scale-105"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shared Files */}
          <div className="card hover-lift bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">📥 Shared With Me</h3>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                {sharedFiles.length} files
              </span>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-auto">
              {sharedFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No shared files yet</p>
                </div>
              ) : (
                sharedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-purple-400/50 hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                          <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{f.fileName}</p>
                        <p className="text-xs text-gray-400">by {f.sharedBy}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(f.id)}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 text-xs font-medium transition-all duration-300 flex-shrink-0 hover:scale-105"
                    >
                      Download
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        /* Smooth transitions for all interactive elements */
        button, input, label, a, .card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Hover lift effect for cards */
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        
        /* Scale effect for buttons */
        button:hover:not(:disabled) {
          transform: scale(1.02);
        }
        
        button:active:not(:disabled) {
          transform: scale(0.98);
        }
        
        /* Glow effect on hover */
        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
        }
        
        /* Input focus glow */
        input:focus {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
}