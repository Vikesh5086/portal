import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useParams } from "wouter";
import { NavHeader } from "./homepage";
import { BreadcrumbBar, PageHeader } from "./assignments";
import { useGetStudentCourseGrades } from "@workspace/api-client-react";
import { useEffect, useState } from "react";

function fmt(v: number | null | undefined): string {
  if (v === null || v === undefined) return "";
  return v.toFixed(2);
}

export default function Grades() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const courseId = parseInt(params.courseId || "0", 10);
  const { data: gradesData, isLoading } = useGetStudentCourseGrades(courseId);
  const [classExpanded, setClassExpanded] = useState(true);
  const [assignmentsExpanded, setAssignmentsExpanded] = useState(true);

  useEffect(() => {
    if (!user) setLocation("/");
  }, [user, setLocation]);

  if (!user) return null;

  const tdStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "3px 8px",
    borderRight: "1px solid #cccccc",
    borderBottom: "1px solid #cccccc",
    fontSize: 13,
    fontFamily: "Arial, sans-serif",
    ...extra,
  });
  const thStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 8px",
    textAlign: "left",
    color: "#2a5db0",
    fontWeight: "normal",
    borderRight: "1px solid #cccccc",
    borderBottom: "1px solid #cccccc",
    fontSize: 13,
    fontFamily: "Arial, sans-serif",
    ...extra,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "Arial, sans-serif" }}>
      <style>{`.group:hover > div { display: block !important; }`}</style>
      <BreadcrumbBar path="View My Assignments" />
      <NavHeader variant="student" />

      <main style={{ marginLeft: 12, marginTop: 16, marginRight: 16, maxWidth: 680, background: "#fff", padding: 20, border: "1px solid #d6d6d6" }}>
        <PageHeader title="View Assignments and Grades" subtitle="Class Grades" />

        {isLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "#666" }}>Loading grades...</div>
        ) : !gradesData ? (
          <div style={{ padding: 24, textAlign: "center", color: "#666" }}>Course not found</div>
        ) : (
          <>
            {/* Term row */}
            <div style={{ fontSize: 13, marginBottom: 10 }}>
              JUNE 2026 | Undergraduate | Thapar Institute of Thapar Inst. of Eng & Tech
            </div>

            {/* Change Class button */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <button style={{ background: "#f0e68c", border: "1px solid #999", padding: "3px 16px", fontSize: 12, cursor: "pointer" }}>
                Change Class
              </button>
            </div>

            {/* Class info box */}
            <div style={{ border: "1px solid #ccc", marginBottom: 16, fontSize: 13 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", cursor: "pointer", borderBottom: classExpanded ? "1px solid #ccc" : "none", background: "#fff" }}
                onClick={() => setClassExpanded(!classExpanded)}
              >
                <span style={{ color: "#008000", fontSize: 16 }}>{classExpanded ? "▼" : "▶"}</span>
                <span style={{ fontWeight: "normal" }}>
                  {gradesData.course.subject_catalog_nbr} - {gradesData.course.class_section} ({gradesData.course.class_nbr})
                </span>
              </div>
              {classExpanded && (
                <div style={{ padding: "8px 20px" }}>
                  <div style={{ marginBottom: 8 }}>{gradesData.course.course_title} (Lecture)</div>
                  <table style={{ borderCollapse: "collapse", fontSize: 13, width: "auto" }}>
                    <thead>
                      <tr>
                        <th style={thStyle({ borderLeft: "1px solid #cccccc" })}>Days and Times</th>
                        <th style={thStyle()}>Room</th>
                        <th style={thStyle()}>Instructor</th>
                        <th style={{ ...thStyle(), borderRight: "1px solid #cccccc" }}>Dates</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ ...tdStyle(), borderLeft: "1px solid #cccccc" }}>Tu 07:00-08:00</td>
                        <td style={tdStyle()}>TBA</td>
                        <td style={tdStyle()}>{gradesData.course.instructor || ""}</td>
                        <td style={{ ...tdStyle(), borderRight: "1px solid #cccccc" }}>01/06/2026 - 01/07/2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Grades box */}
            <div style={{ background: "#ffffff", border: "1px solid #d6d6d6", padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ color: "#cc6600", fontWeight: "bold", fontSize: 14, marginBottom: 10 }}>Grades</div>
              <table style={{ fontSize: 13, borderCollapse: "collapse", margin: "0 auto" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "2px 16px 2px 0", textAlign: "right" }}>Current Mid-Term Grade</td>
                    <td style={{ padding: "2px 0" }}>
                      {gradesData.midterm_grade != null ? `${gradesData.midterm_grade.toFixed(2)}%` : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 16px 2px 0", textAlign: "right" }}>Current Overall Grade</td>
                    <td style={{ padding: "2px 0" }}>
                      {gradesData.overall_grade != null ? `${gradesData.overall_grade.toFixed(2)}%` : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Class Assignments section */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#fff", border: "1px solid #ccc", cursor: "pointer", marginBottom: 4 }}
                onClick={() => setAssignmentsExpanded(!assignmentsExpanded)}
              >
                <span style={{ color: "#008000", fontSize: 16 }}>{assignmentsExpanded ? "▼" : "▶"}</span>
                <span style={{ fontSize: 13, fontWeight: "normal" }}>Class Assignments</span>
              </div>

              {assignmentsExpanded && (
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #cccccc", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={thStyle({ borderLeft: "1px solid #cccccc" })}>Begin Date</th>
                      <th style={thStyle()}>Due Date</th>
                      <th style={thStyle()}>Assignment</th>
                      <th style={thStyle()}>Category</th>
                      <th style={{ ...thStyle(), textAlign: "right" }}>Grade</th>
                      <th style={{ ...thStyle(), textAlign: "right" }}>Out of</th>
                      <th style={{ ...thStyle(), borderRight: "1px solid #cccccc" }}>Other Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradesData.assignments.map((assignment, idx) => (
                      <tr key={assignment.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                        <td style={{ ...tdStyle(), borderLeft: "1px solid #cccccc" }}>{assignment.begin_date || ""}</td>
                        <td style={tdStyle()}>{assignment.due_date || ""}</td>
                        <td style={tdStyle()}>
                          <a href="#" style={{ color: "#0066cc", textDecoration: "none" }}>{assignment.assignment_name}</a>
                        </td>
                        <td style={tdStyle()}>{assignment.category}</td>
                        <td style={{ ...tdStyle(), textAlign: "right" }}>
                          {assignment.marks_obtained !== null && assignment.marks_obtained !== undefined
                            ? fmt(assignment.marks_obtained)
                            : ""}
                        </td>
                        <td style={{ ...tdStyle(), textAlign: "right" }}>{assignment.max_marks}</td>
                        <td style={{ ...tdStyle(), borderRight: "1px solid #cccccc" }}></td>
                      </tr>
                    ))}
                    {gradesData.assignments.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: 12, textAlign: "center", color: "#666" }}>No assignments found</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Collapsed sections */}
            {["Assignment Categories", "Instructor Comments", "Student Assignment Dates"].map(label => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", border: "1px solid #ccc", cursor: "pointer", marginBottom: 4, fontSize: 13, background: "#fff" }}>
                <span style={{ color: "#888", fontSize: 14 }}>▶</span>
                <span>{label}</span>
              </div>
            ))}
          </>
        )}

        <div style={{ marginTop: 20, paddingTop: 8, borderTop: "1px solid #eee" }}>
          <a href="#top" style={{ color: "#0066cc", fontSize: 13, textDecoration: "none" }}>&#9650; Go to top</a>
        </div>
      </main>
    </div>
  );
}
