import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await loginMutation.mutateAsync({ data: { college_id: collegeId, password } });
      login(user);
      if (user.role === "admin" || user.role === "teacher") {
        setLocation("/admin");
      } else {
        setLocation("/homepage");
      }
    } catch {
      setError("Invalid User ID or Password");
    }
  };

  const inp: React.CSSProperties = {
    width: "100%",
    border: "1px solid #bbb",
    padding: "8px 10px",
    fontSize: 14,
    fontFamily: "Arial, sans-serif",
    background: "rgba(255,255,255,0.7)",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Redwood strip at very top */}
      <div style={{
        height: 6,
        backgroundImage: "url('/redwood-strip.png')",
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 6px",
        width: "100%",
        flexShrink: 0,
      }} />

      {/* Full-screen campus background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img src="/campus.jpg" alt="Campus" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Centered card */}
      <div style={{
        flex: 1,
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px 60px",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.88)",
          padding: "36px 44px 32px",
          width: 480,
          maxWidth: "92vw",
          border: "1px solid rgba(180,180,180,0.6)",
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <img src="/ti-logo.png" alt="Thapar Institute Logo" style={{ width: 200, height: "auto" }} />
          </div>

          {error && (
            <div style={{ marginBottom: 14, padding: "6px 10px", background: "rgba(255,220,220,0.9)", color: "#cc0000", fontSize: 13, border: "1px solid #e8a0a0", textAlign: "center" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 14, marginBottom: 5, color: "#333" }}>User ID</label>
              <input
                type="text"
                value={collegeId}
                onChange={e => setCollegeId(e.target.value)}
                style={inp}
                required
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, marginBottom: 5, color: "#333" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inp}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                width: "100%",
                background: "#2d2d2d",
                color: "#fff",
                border: "none",
                padding: "10px 0",
                fontSize: 15,
                cursor: loginMutation.isPending ? "not-allowed" : "pointer",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
              }}
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </button>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <a href="#" style={{ color: "#0066cc", fontSize: 13, textDecoration: "none" }}>Forgot Password</a>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        padding: "6px 0",
        background: "rgba(255,255,255,0.75)",
        textAlign: "center",
        fontSize: 12,
        color: "#555",
        zIndex: 2,
      }}>
        Copyright 2000, 2022, Oracle and its affiliates
      </div>
    </div>
  );
}
