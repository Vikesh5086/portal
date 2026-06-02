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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    marginBottom: 4,
    color: "#333",
    fontFamily: "Arial, sans-serif",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #ccc",
    padding: "7px 9px",
    fontSize: 13,
    fontFamily: "Arial, sans-serif",
    background: "#fff",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif" }}>
      {/* Split layout */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* LEFT HALF — campus bg + login card */}
        <div style={{
          width: "50%",
          position: "relative",
          backgroundImage: "url('/campus.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          padding: "48px 0 48px 48px",
        }}>
          {/* Light white wash over left campus image */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.18)" }} />

          {/* Login Card */}
          <div style={{
            position: "relative",
            zIndex: 1,
            background: "#fff",
            width: 320,
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          }}>
            {/* Redwood strip at very top of card */}
            <div style={{
              height: 6,
              backgroundImage: "url('/redwood-strip.png')",
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 6px",
              width: "100%",
            }} />

            <div style={{ padding: "24px 28px 28px" }}>
              {/* Logo */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <img src="/ti-logo.png" alt="Thapar Institute" style={{ width: 170, height: "auto" }} />
              </div>

              {error && (
                <div style={{ marginBottom: 12, padding: "5px 8px", background: "#ffe8e8", color: "#cc0000", fontSize: 12, border: "1px solid #e8a0a0", textAlign: "center" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>User ID</label>
                  <input
                    type="text"
                    value={collegeId}
                    onChange={e => setCollegeId(e.target.value)}
                    style={inputStyle}
                    required
                    autoComplete="username"
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={inputStyle}
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
                    padding: "9px 0",
                    fontSize: 14,
                    cursor: loginMutation.isPending ? "not-allowed" : "pointer",
                    fontFamily: "Arial, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </button>

                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <a href="#" style={{ color: "#0066cc", fontSize: 13, textDecoration: "none" }}>Forgot Password</a>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT HALF — campus bg with red overlay */}
        <div style={{
          width: "50%",
          position: "relative",
          backgroundImage: "url('/campus.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(139,0,0,0.60)" }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: "rgba(255,255,255,0.9)",
        textAlign: "center",
        fontSize: 12,
        color: "#555",
        padding: "5px 0",
        borderTop: "1px solid #e0e0e0",
      }}>
        Copyright 2000, 2022, Oracle and its affiliates
      </div>
    </div>
  );
}
