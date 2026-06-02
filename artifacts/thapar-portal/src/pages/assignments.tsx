import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { NavHeader } from "./homepage";
import { useGetStudentCourses } from "@workspace/api-client-react";
import { useEffect } from "react";

const S: React.CSSProperties = { fontFamily: "Arial, sans-serif", fontSize: 13 };

export function BreadcrumbBar({ path }: { path: string }) {
  return (
    <div style={{ background: "#b8cce4", height: 28, display: "flex", alignItems: "center", padding: "0 15px", fontSize: 12, color: "#333", fontFamily: "Arial, sans-serif" }}>
      <span style={{ cursor: "pointer" }}>Favorites ▼</span>
      <span style={{ margin: "0 6px" }}>&nbsp;&gt;&nbsp;</span>
      <span style={{ cursor: "pointer" }}>Main Menu ▼</span>
      <span style={{ margin: "0 6px" }}>&nbsp;&gt;&nbsp;</span>
      <span style={{ cursor: "pointer" }}>Nav Coll Navigator</span>
      <span style={{ margin: "0 6px" }}>&nbsp;&gt;&nbsp;</span>
      <span>{path}</span>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { user } = useAuth();
  return (
    <div style={{ marginBottom: 16 }}>
      {/* Student name + Go To */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: "bold", ...S }}>{user?.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <span>Go To</span>
          <select style={{ border: "1px solid #aaa", padding: "2px 4px", fontSize: 12, width: 220 }}>
            <option>View Assignments and Grades</option>
          </select>
          <button style={{ background: "#cc0000", color: "#fff", border: "none", padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>&gt;&gt;</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 12, borderBottom: "1px solid #ccc" }}>
        {["Search", "Plan", "Enroll", "My Academics"].map(tab => (
          <button key={tab} style={{
            padding: "4px 12px",
            fontSize: 13,
            fontWeight: tab === "Enroll" ? "bold" : "normal",
            background: tab === "Enroll" ? "#fff" : "transparent",
            border: tab === "Enroll" ? "1px solid #ccc" : "1px solid transparent",
            borderBottom: tab === "Enroll" ? "1px solid #fff" : "1px solid transparent",
            marginBottom: tab === "Enroll" ? -1 : 0,
            cursor: "pointer",
          }}>{tab}</button>
        ))}
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, fontSize: 13 }}>
        <span style={{ color: "#0066cc", cursor: "pointer", textDecoration: "underline" }}>My Class Schedule</span>
        <span style={{ color: "#333" }}>&nbsp;|&nbsp;</span>
        <span style={{ fontWeight: "bold", color: "#333" }}>Term Information</span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 17, fontWeight: "bold", margin: "0 0 6px 0", color: "#000", fontFamily: "Arial, sans-serif" }}>{title}</h1>

      {subtitle !== title && (
        <div style={{ fontSize: 13, marginBottom: 8, color: "#333", fontFamily: "Arial, sans-serif" }}>{subtitle}</div>
      )}

      {/* Term bar */}
      <div style={{ borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", padding: "3px 0", fontSize: 13, marginBottom: 10, fontFamily: "Arial, sans-serif" }}>
        JUNE 2026 | Undergraduate | Thapar Institute of Eng & Tech
      </div>
    </div>
  );
}

export default function Assignments() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: courses, isLoading } = useGetStudentCourses();

  useEffect(() => {
    if (!user) setLocation("/");
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "Arial, sans-serif" }}>
      <style>{`.group:hover > div { display: block !important; }`}</style>
      <BreadcrumbBar path="View My Assignments" />
      <NavHeader variant="student" />

      <main style={{ marginLeft: 12, marginTop: 16, marginRight: 16, maxWidth: 680, background: "#fff", padding: 20, border: "1px solid #d6d6d6" }}>
        <PageHeader title="View Assignments and Grades" subtitle="View Assignments and Grades" />

        {isLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "#666", ...S }}>Loading courses...</div>
        ) : (
          <div style={{ overflowX: "auto", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #cccccc", fontSize: 13, fontFamily: "Arial, sans-serif" }}>
              <thead>
                <tr style={{ background: "#fff" }}>
                  <th style={{ padding: "5px 8px", textAlign: "left", color: "#2a5db0", fontWeight: "normal", borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc", whiteSpace: "nowrap" }}>Course Title</th>
                  <th style={{ padding: "5px 8px", textAlign: "left", color: "#2a5db0", fontWeight: "normal", borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc", whiteSpace: "nowrap" }}>Course ID</th>
                  <th style={{ padding: "5px 8px", textAlign: "left", color: "#2a5db0", fontWeight: "normal", borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc", whiteSpace: "nowrap" }}>Class Nbr</th>
                  <th style={{ padding: "5px 8px", textAlign: "left", color: "#2a5db0", fontWeight: "normal", borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc", whiteSpace: "nowrap" }}>Subject Catalog Nbr</th>
                  <th style={{ padding: "5px 8px", textAlign: "left", color: "#2a5db0", fontWeight: "normal", borderBottom: "1px solid #cccccc", whiteSpace: "nowrap" }}>Class Section</th>
                </tr>
              </thead>
              <tbody>
                {courses?.map((course, idx) => (
                  <tr key={course.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f9f9f9", height: 28 }}>
                    <td style={{ padding: "3px 8px", borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc" }}>
                      <Link href={`/grades/${course.id}`} style={{ color: "#0066cc", textDecoration: "none", fontWeight: "normal" }}>
                        {course.course_title}
                      </Link>
                    </td>
                    <td style={{ padding: "3px 8px", borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc", color: "#0066cc" }}>{course.course_id}</td>
                    <td style={{ padding: "3px 8px", borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc", color: "#0066cc" }}>{course.class_nbr || ""}</td>
                    <td style={{ padding: "3px 8px", borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc", color: "#0066cc" }}>{course.subject_catalog_nbr || ""}</td>
                    <td style={{ padding: "3px 8px", borderBottom: "1px solid #cccccc", color: "#0066cc" }}>{course.class_section}</td>
                  </tr>
                ))}
                {(!courses || courses.length === 0) && (
                  <tr><td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#666" }}>No courses found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 16, paddingTop: 8 }}>
          <a href="#top" style={{ color: "#0066cc", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
            <img src="/icon-gototop.png" alt="" style={{ width: 14, height: 14 }} onError={e => (e.currentTarget.style.display = "none")} />
            &#9650; Go to top
          </a>
        </div>
      </main>
    </div>
  );
}
