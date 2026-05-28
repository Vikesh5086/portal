import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

const MOSAIC_COLORS = [
  "#c0392b","#e74c3c","#e67e22","#f39c12","#f1c40f",
  "#27ae60","#2ecc71","#16a085","#1abc9c","#2980b9",
  "#3498db","#8e44ad","#9b59b6","#d35400","#c0392b",
  "#e74c3c","#e67e22","#f39c12","#27ae60","#2980b9",
];

export function NavHeader() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <>
      <header style={{ background: "#2d2d2d", color: "#fff", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/homepage">
            <img src="/icon-ti-nav.png" alt="TI" style={{ height: 32, width: 32, objectFit: "contain", cursor: "pointer" }} />
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>

        <div style={{ flex: 1, maxWidth: 480, margin: "0 16px", display: "flex", gap: 8 }}>
          <button style={{ background: "#555", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
            Menu <span style={{ fontSize: 10 }}>▼</span>
          </button>
          <div style={{ flex: 1, position: "relative" }}>
            <input type="text" placeholder="Search in Menu" style={{ width: "100%", borderRadius: 20, border: "none", padding: "4px 32px 4px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            <svg style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/homepage">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          <div style={{ position: "relative" }} className="group">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer" }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
            <div className="absolute right-0 top-full mt-2 bg-white text-black w-48 shadow-lg hidden group-hover:block border border-gray-200 z-50" style={{ fontSize: 13 }}>
              <div style={{ padding: "8px 16px", borderBottom: "1px solid #eee", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Student"}
              </div>
              <button onClick={handleLogout} style={{ width: "100%", textAlign: "left", padding: "8px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13 }} className="hover:bg-gray-100">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mosaic Banner Strip - 8px */}
      <div style={{ height: 8, display: "flex", width: "100%" }}>
        {MOSAIC_COLORS.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
    </>
  );
}

interface TileProps {
  title: string;
  icon: string;
  href?: string;
  colSpan?: number;
  extraContent?: React.ReactNode;
}

function Tile({ title, icon, href, colSpan, extraContent }: TileProps) {
  const inner = (
    <div style={{
      background: "#fff",
      border: "1px solid #cccccc",
      padding: "10px 12px 12px 12px",
      minHeight: 160,
      display: "flex",
      flexDirection: "column",
      cursor: href ? "pointer" : "default",
      fontFamily: "Arial, sans-serif",
      gridColumn: colSpan ? `span ${colSpan}` : undefined,
      boxSizing: "border-box",
    }} className="tile-hover">
      <div style={{ fontSize: 13, fontWeight: "bold", color: "#000", marginBottom: "auto", lineHeight: 1.3 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, paddingTop: 8 }}>
        <img src={icon} alt={title} style={{ width: 72, height: 72, objectFit: "contain" }} />
        {extraContent && <div style={{ fontSize: 12, color: "#555", marginTop: 6, textAlign: "center" }}>{extraContent}</div>}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ display: "block", textDecoration: "none", gridColumn: colSpan ? `span ${colSpan}` : undefined }}>{inner}</Link>;
  }
  return inner;
}

export default function Homepage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) setLocation("/");
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0", fontFamily: "Arial, sans-serif" }}>
      <style>{`.tile-hover:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); }`}</style>
      <NavHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: "normal", color: "#333", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            Student Homepage <span style={{ fontSize: 14, color: "#555" }}>▼</span>
          </h1>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <Tile title="Student Response Survey" icon="/icon-survey.png" />
          <Tile title="Change My Password" icon="/icon-password.png" />
          <Tile title="Profile" icon="/icon-profile.png" />
          <Tile title="Student_Center" icon="/icon-student-center.png" />

          <Tile title="Manage Classes" icon="/icon-classes.png" />
          <Tile title="I Grade Application" icon="/icon-grades-app.png" />
          <Tile title="Raise Document Request" icon="/icon-document.png" />
          <Tile title="Backlog Course Registration" icon="/icon-backlog.png" />

          <Tile title="Makeup Test Registration" icon="/icon-makeup.png" />
          <Tile title="No Dues Status" icon="/icon-dues.png" />
          <div style={{ gridColumn: "span 2" }}>
            <div style={{ background: "#fff", border: "1px solid #cccccc", padding: "10px 12px 12px 12px", minHeight: 160, display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", boxSizing: "border-box" }}>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "#000", marginBottom: 4 }}>Academic Progress</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, gap: 20 }}>
                <img src="/icon-progress.png" alt="Academic Progress" style={{ width: 72, height: 72, objectFit: "contain" }} />
                <div style={{ fontSize: 12, color: "#555" }}>The Academic Requirements report is not available.</div>
              </div>
            </div>
          </div>

          <Tile title="Financial" icon="/icon-financial.png" />
          <Tile title="View My Grades" icon="/icon-viewgrades.png" href="/assignments" />
        </div>
      </main>
    </div>
  );
}
