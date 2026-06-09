import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { NavHeader } from "./homepage";
import { useEffect, useState, useCallback } from "react";

type Student = { id: number; college_id: string; name: string; role: string };
type Course = { id: number; course_title: string; course_id: string; class_nbr: string; subject_catalog_nbr: string; class_section: string; instructor: string };
type Assignment = { id: number; course_id: number; assignment_name: string; category: string; begin_date: string; due_date: string; max_marks: number };
type MarksGrid = { assignments: Assignment[]; students: Student[]; marks: { student_college_id: string; assignment_id: number; marks_obtained: number | null }[] };

const API = (path: string) => `/api${path}`;

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(API(path), { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: "6px 18px", fontSize: 13, fontWeight: active ? "bold" : "normal",
  background: active ? "#fff" : "#f0f0f0", border: "1px solid #ccc",
  borderBottom: active ? "1px solid #fff" : "1px solid #ccc",
  marginBottom: active ? -1 : 0, cursor: "pointer", marginRight: 2,
});
const btn = (color = "#0066cc"): React.CSSProperties => ({
  background: color, color: "#fff", border: "none", padding: "4px 12px",
  cursor: "pointer", fontSize: 13, fontFamily: "Arial, sans-serif",
});
const inp: React.CSSProperties = { border: "1px solid #aaa", padding: "4px 8px", fontSize: 13, fontFamily: "Arial, sans-serif", width: "100%", boxSizing: "border-box" };
const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "Arial, sans-serif" };
const th: React.CSSProperties = { background: "#e8e8e8", padding: "6px 10px", textAlign: "left", border: "1px solid #ccc", color: "#333" };
const td: React.CSSProperties = { padding: "5px 10px", border: "1px solid #ddd", verticalAlign: "middle" };

export default function Admin() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Manage Students", "Manage Subjects", "Manage Assignments", "Enter Marks", "Enroll Students", "Enter Grades"];

  useEffect(() => {
    if (!user) { setLocation("/"); return; }
    if (user.role !== "admin" && user.role !== "teacher") setLocation("/homepage");
  }, [user, setLocation]);

  if (!user || (user.role !== "admin" && user.role !== "teacher")) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0", fontFamily: "Arial, sans-serif" }}>
      <style>{`.group:hover > div { display: block !important; }`}</style>
      <NavHeader variant="home" />
      <main style={{ maxWidth: 1100, margin: "16px auto", background: "#fff", border: "1px solid #ccc", minHeight: 500 }}>
        <div style={{ background: "#2d2d2d", color: "#fff", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 15, fontWeight: "bold" }}>Teacher / Admin Panel</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
            <span>{user.name}</span>
            <button onClick={() => { logout(); setLocation("/"); }} style={{ ...btn("#555"), padding: "3px 10px" }}>Sign Out</button>
          </div>
        </div>
        <div style={{ display: "flex", padding: "12px 20px 0 20px", borderBottom: "1px solid #ccc", background: "#f8f8f8", flexWrap: "wrap" }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={tabStyle(activeTab === i)}>{t}</button>
          ))}
        </div>
        <div style={{ padding: 20 }}>
          {activeTab === 0 && <StudentsTab />}
          {activeTab === 1 && <SubjectsTab />}
          {activeTab === 2 && <AssignmentsTab />}
          {activeTab === 3 && <MarksTab />}
          {activeTab === 4 && <EnrollTab />}
          {activeTab === 5 && <GradesTab />}
        </div>
      </main>
    </div>
  );
}

/* ─── TAB 1: STUDENTS ──────────────────────────────────────────────── */
function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({ college_id: "", name: "", password: "" });
  const [msg, setMsg] = useState("");

  const load = useCallback(() => apiFetch("/admin/students").then(setStudents), []);
  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/student", { method: "POST", body: JSON.stringify(form) });
      setForm({ college_id: "", name: "", password: "" });
      setMsg("Student added!"); load();
    } catch { setMsg("Error adding student"); }
  };

  const del = async (id: string) => {
    if (!confirm(`Delete student ${id}?`)) return;
    await apiFetch(`/admin/students/${id}`, { method: "DELETE" });
    setMsg("Student deleted"); load();
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>Manage Students</h2>
      {msg && <div style={{ background: "#e6ffe6", border: "1px solid #aaa", padding: "6px 12px", marginBottom: 12, fontSize: 13 }}>{msg}</div>}
      <table style={tbl}>
        <thead><tr><th style={th}>Roll Number</th><th style={th}>Name</th><th style={th}>Action</th></tr></thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td style={td}>{s.college_id}</td>
              <td style={td}>{s.name}</td>
              <td style={td}><button onClick={() => del(s.college_id)} style={{ ...btn("#cc0000"), padding: "2px 10px" }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 16, background: "#fafafa" }}>
        <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 12 }}>Add Student</div>
        <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Roll Number</label>
            <input style={inp} value={form.college_id} onChange={e => setForm({ ...form, college_id: e.target.value })} required placeholder="e.g. 102203002" />
          </div>
          <div>
            <label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Full Name</label>
            <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. RAHUL SHARMA" />
          </div>
          <div>
            <label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Password</label>
            <input style={inp} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Password" />
          </div>
          <button type="submit" style={{ ...btn("#1a7a1a"), padding: "6px 16px", whiteSpace: "nowrap" }}>Add Student</button>
        </form>
      </div>
    </div>
  );
}

/* ─── TAB 2: SUBJECTS ──────────────────────────────────────────────── */
function SubjectsTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editInstructor, setEditInstructor] = useState("");
  const [form, setForm] = useState({ course_title: "", course_id: "", class_nbr: "", subject_catalog_nbr: "", class_section: "1R1", instructor: "" });
  const [msg, setMsg] = useState("");

  const load = useCallback(() => apiFetch("/admin/courses").then(setCourses), []);
  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/course", { method: "POST", body: JSON.stringify(form) });
      setForm({ course_title: "", course_id: "", class_nbr: "", subject_catalog_nbr: "", class_section: "1R1", instructor: "" });
      setMsg("Subject added!"); load();
    } catch { setMsg("Error adding subject"); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this subject and all its assignments/marks?")) return;
    await apiFetch(`/admin/courses/${id}`, { method: "DELETE" });
    setMsg("Subject deleted"); load();
  };

  const saveInstructor = async (id: number) => {
    await apiFetch(`/admin/courses/${id}/instructor`, { method: "PATCH", body: JSON.stringify({ instructor: editInstructor }) });
    setEditId(null); setMsg("Instructor updated!"); load();
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>Manage Subjects</h2>
      {msg && <div style={{ background: "#e6ffe6", border: "1px solid #aaa", padding: "6px 12px", marginBottom: 12, fontSize: 13 }}>{msg}</div>}
      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>Subject Name</th>
            <th style={th}>Course ID</th>
            <th style={th}>Class Nbr</th>
            <th style={th}>Subject Catalog Nbr</th>
            <th style={th}>Section</th>
            <th style={th}>Instructor</th>
            <th style={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => (
            <tr key={c.id}>
              <td style={td}>{c.course_title}</td>
              <td style={td}>{c.course_id}</td>
              <td style={td}>{c.class_nbr}</td>
              <td style={td}>{c.subject_catalog_nbr}</td>
              <td style={td}>{c.class_section}</td>
              <td style={td}>
                {editId === c.id ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input style={{ ...inp, width: 180 }} value={editInstructor} onChange={e => setEditInstructor(e.target.value)} />
                    <button onClick={() => saveInstructor(c.id)} style={{ ...btn("#1a7a1a"), padding: "2px 10px" }}>Save</button>
                    <button onClick={() => setEditId(null)} style={{ ...btn("#888"), padding: "2px 8px" }}>Cancel</button>
                  </div>
                ) : (
                  <span>{c.instructor} <button onClick={() => { setEditId(c.id); setEditInstructor(c.instructor); }} style={{ ...btn("#0066cc"), padding: "1px 8px", fontSize: 11, marginLeft: 6 }}>Edit</button></span>
                )}
              </td>
              <td style={td}><button onClick={() => del(c.id)} style={{ ...btn("#cc0000"), padding: "2px 10px" }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 16, background: "#fafafa" }}>
        <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 12 }}>Add Subject</div>
        <form onSubmit={add}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Subject Name</label><input style={inp} value={form.course_title} onChange={e => setForm({ ...form, course_title: e.target.value })} required placeholder="e.g. LINEAR ALGEBRA" /></div>
            <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Course ID</label><input style={inp} value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} required placeholder="e.g. 001340" /></div>
            <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Class Nbr</label><input style={inp} value={form.class_nbr} onChange={e => setForm({ ...form, class_nbr: e.target.value })} placeholder="e.g. 454" /></div>
            <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Subject Catalog Nbr</label><input style={inp} value={form.subject_catalog_nbr} onChange={e => setForm({ ...form, subject_catalog_nbr: e.target.value })} placeholder="e.g. UCT 201" /></div>
            <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Class Section</label><input style={inp} value={form.class_section} onChange={e => setForm({ ...form, class_section: e.target.value })} placeholder="e.g. 1R1" /></div>
          </div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Instructor Name(s)</label><input style={inp} value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} placeholder="e.g. SUNITA GARHWAL ." /></div>
          <button type="submit" style={{ ...btn("#1a7a1a"), padding: "6px 16px" }}>Add Subject</button>
        </form>
      </div>
    </div>
  );
}

/* ─── TAB 3: ASSIGNMENTS ───────────────────────────────────────────── */
function AssignmentsTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [form, setForm] = useState({ assignment_name: "", category: "MST", max_marks: "30", begin_date: "", due_date: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => { apiFetch("/admin/courses").then(setCourses); }, []);
  useEffect(() => {
    if (selectedCourseId) apiFetch(`/admin/courses/${selectedCourseId}/assignments`).then(setAssignments);
    else setAssignments([]);
  }, [selectedCourseId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/assignment", { method: "POST", body: JSON.stringify({ ...form, course_id: parseInt(selectedCourseId), max_marks: parseFloat(form.max_marks) }) });
      setForm({ assignment_name: "", category: "MST", max_marks: "30", begin_date: "", due_date: "" });
      setMsg("Assignment added!");
      apiFetch(`/admin/courses/${selectedCourseId}/assignments`).then(setAssignments);
    } catch { setMsg("Error adding assignment"); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this assignment and all its marks?")) return;
    await apiFetch(`/admin/assignments/${id}`, { method: "DELETE" });
    setMsg("Assignment deleted");
    apiFetch(`/admin/courses/${selectedCourseId}/assignments`).then(setAssignments);
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>Manage Assignments</h2>
      {msg && <div style={{ background: "#e6ffe6", border: "1px solid #aaa", padding: "6px 12px", marginBottom: 12, fontSize: 13 }}>{msg}</div>}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 13, fontWeight: "bold" }}>Select Subject:</label>
        <select style={{ ...inp, width: "auto", minWidth: 260 }} value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
          <option value="">-- Select Subject --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.course_title} ({c.subject_catalog_nbr})</option>)}
        </select>
      </div>
      {selectedCourseId && (
        <>
          <table style={tbl}>
            <thead><tr><th style={th}>Assignment Name</th><th style={th}>Category</th><th style={th}>Max Marks</th><th style={th}>Begin Date</th><th style={th}>Due Date</th><th style={th}>Action</th></tr></thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td style={td}>{a.assignment_name}</td><td style={td}>{a.category}</td><td style={td}>{a.max_marks}</td>
                  <td style={td}>{a.begin_date || ""}</td><td style={td}>{a.due_date || ""}</td>
                  <td style={td}><button onClick={() => del(a.id)} style={{ ...btn("#cc0000"), padding: "2px 10px" }}>Delete</button></td>
                </tr>
              ))}
              {assignments.length === 0 && <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: "#888" }}>No assignments found</td></tr>}
            </tbody>
          </table>
          <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 16, background: "#fafafa" }}>
            <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 12 }}>Add Assignment</div>
            <form onSubmit={add}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Assignment Name</label><input style={inp} value={form.assignment_name} onChange={e => setForm({ ...form, assignment_name: e.target.value })} required placeholder="e.g. mst" /></div>
                <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Category</label>
                  <select style={inp} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {["MST", "EST", "Quiz 1", "Quiz 2", "TUT1", "Session", "Makeup", "LE 1", "LE 2", "Assignment"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Max Marks</label><input style={inp} type="number" value={form.max_marks} onChange={e => setForm({ ...form, max_marks: e.target.value })} required /></div>
                <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Begin Date</label><input style={inp} value={form.begin_date} onChange={e => setForm({ ...form, begin_date: e.target.value })} placeholder="03/12/2026" /></div>
                <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Due Date</label><input style={inp} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} placeholder="04/20/2026" /></div>
              </div>
              <button type="submit" style={{ ...btn("#1a7a1a"), padding: "6px 16px" }}>Add Assignment</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── TAB 4: ENTER MARKS ───────────────────────────────────────────── */
function MarksTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [grid, setGrid] = useState<MarksGrid | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssign, setNewAssign] = useState({ assignment_name: "", category: "MST", max_marks: "30", begin_date: "", due_date: "" });
  const [addingAssign, setAddingAssign] = useState(false);

  useEffect(() => { apiFetch("/admin/courses").then(setCourses); }, []);

  const loadGrid = useCallback(async (courseId: string) => {
    if (!courseId) { setGrid(null); return; }
    const data: MarksGrid = await apiFetch(`/admin/courses/${courseId}/marks`);
    setGrid(data);
    const init: Record<string, string> = {};
    data.marks.forEach(m => {
      const key = `${m.student_college_id}_${m.assignment_id}`;
      init[key] = m.marks_obtained !== null && m.marks_obtained !== undefined ? String(m.marks_obtained) : "";
    });
    setInputs(init);
  }, []);

  useEffect(() => { loadGrid(selectedCourseId); setShowAddForm(false); }, [selectedCourseId, loadGrid]);

  const addAssignment = async (e: React.FormEvent) => {
    e.preventDefault(); setAddingAssign(true);
    try {
      await apiFetch("/admin/assignment", { method: "POST", body: JSON.stringify({ ...newAssign, course_id: parseInt(selectedCourseId), max_marks: parseFloat(newAssign.max_marks) }) });
      setNewAssign({ assignment_name: "", category: "MST", max_marks: "30", begin_date: "", due_date: "" });
      setShowAddForm(false); setMsg("✓ Assignment added!");
      await loadGrid(selectedCourseId);
    } catch { setMsg("Error adding assignment"); } finally { setAddingAssign(false); }
  };

  const save = async () => {
    if (!grid) return;
    setSaving(true); setMsg("");
    try {
      const marks = [];
      for (const student of grid.students) {
        for (const assignment of grid.assignments) {
          const key = `${student.college_id}_${assignment.id}`;
          const raw = inputs[key];
          const val = raw === "" || raw === undefined ? null : parseFloat(raw);
          marks.push({ student_college_id: student.college_id, assignment_id: assignment.id, marks_obtained: val });
        }
      }
      await apiFetch("/admin/marks/batch", { method: "POST", body: JSON.stringify({ marks }) });
      setMsg("✓ All marks saved successfully!");
      loadGrid(selectedCourseId);
    } catch { setMsg("Error saving marks"); } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>Enter / Update Marks</h2>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 13, fontWeight: "bold" }}>Select Subject:</label>
        <select style={{ ...inp, width: "auto", minWidth: 300 }} value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
          <option value="">-- Select Subject --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.course_title} ({c.subject_catalog_nbr})</option>)}
        </select>
      </div>
      {msg && <div style={{ background: msg.includes("✓") ? "#e6ffe6" : "#ffe6e6", border: "1px solid #aaa", padding: "8px 14px", marginBottom: 14, fontSize: 13 }}>{msg}</div>}
      {selectedCourseId && grid && (
        <>
          <div style={{ marginBottom: 16 }}>
            {!showAddForm ? (
              <button onClick={() => setShowAddForm(true)} style={{ ...btn("#1a5276"), padding: "5px 14px" }}>+ Add New Assignment</button>
            ) : (
              <div style={{ border: "1px solid #bbb", padding: 16, background: "#f9f9ff", marginTop: 8 }}>
                <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 12 }}>New Assignment</div>
                <form onSubmit={addAssignment}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Assignment Name</label><input style={inp} value={newAssign.assignment_name} onChange={e => setNewAssign({ ...newAssign, assignment_name: e.target.value })} required /></div>
                    <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Category</label>
                      <select style={inp} value={newAssign.category} onChange={e => setNewAssign({ ...newAssign, category: e.target.value })}>
                        {["MST", "EST", "Quiz 1", "Quiz 2", "TUT1", "Session", "Makeup", "LE 1", "LE 2", "Assignment"].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Max Marks</label><input style={inp} type="number" value={newAssign.max_marks} onChange={e => setNewAssign({ ...newAssign, max_marks: e.target.value })} required /></div>
                    <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Begin Date</label><input style={inp} value={newAssign.begin_date} onChange={e => setNewAssign({ ...newAssign, begin_date: e.target.value })} placeholder="MM/DD/YYYY" /></div>
                    <div><label style={{ fontSize: 12, display: "block", marginBottom: 3 }}>Due Date</label><input style={inp} value={newAssign.due_date} onChange={e => setNewAssign({ ...newAssign, due_date: e.target.value })} placeholder="MM/DD/YYYY" /></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" disabled={addingAssign} style={{ ...btn("#1a7a1a"), padding: "6px 16px" }}>{addingAssign ? "Adding..." : "Add Assignment"}</button>
                    <button type="button" onClick={() => setShowAddForm(false)} style={{ ...btn("#888"), padding: "6px 14px" }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
          {grid.assignments.length === 0 ? (
            <div style={{ color: "#888", fontSize: 13, padding: "16px 0" }}>No assignments yet. Add one above.</div>
          ) : (
            <>
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={{ ...tbl, minWidth: 600 }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, minWidth: 80 }}>Roll No.</th>
                      <th style={{ ...th, minWidth: 160 }}>Student Name</th>
                      {grid.assignments.map(a => (
                        <th key={a.id} style={{ ...th, minWidth: 100, textAlign: "center" }}>
                          <div style={{ whiteSpace: "nowrap" }}>{a.assignment_name}</div>
                          <div style={{ fontSize: 11, fontWeight: "normal", color: "#666" }}>{a.category} / {a.max_marks}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.students.map((s, si) => (
                      <tr key={s.college_id} style={{ background: si % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                        <td style={td}>{s.college_id}</td>
                        <td style={td}>{s.name}</td>
                        {grid.assignments.map(a => {
                          const key = `${s.college_id}_${a.id}`;
                          return (
                            <td key={a.id} style={{ ...td, textAlign: "center" }}>
                              <input type="number" min={0} max={a.max_marks} step={0.5} value={inputs[key] ?? ""} onChange={e => setInputs(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: 70, border: "1px solid #bbb", padding: "3px 6px", fontSize: 13, textAlign: "right" }} placeholder="—" />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {grid.students.length === 0 && <tr><td colSpan={2 + grid.assignments.length} style={{ ...td, textAlign: "center", color: "#888" }}>No students enrolled</td></tr>}
                  </tbody>
                </table>
              </div>
              <button onClick={save} disabled={saving} style={{ ...btn("#1a7a1a"), padding: "8px 24px", fontSize: 14 }}>{saving ? "Saving..." : "Save All Marks"}</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ─── TAB 5: ENROLL STUDENTS ───────────────────────────────────────── */
function EnrollTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiFetch("/admin/courses").then(setCourses);
    apiFetch("/admin/students").then(setAllStudents);
  }, []);

  useEffect(() => {
    if (!selectedCourseId) { setEnrolledIds(new Set()); setChecked({}); return; }
    apiFetch(`/admin/courses/${selectedCourseId}/enrollments`).then((enrolled: { college_id: string }[]) => {
      const ids = new Set(enrolled.map(e => e.college_id));
      setEnrolledIds(ids);
      const c: Record<string, boolean> = {};
      allStudents.forEach(s => { c[s.college_id] = ids.has(s.college_id); });
      setChecked(c);
    });
  }, [selectedCourseId, allStudents]);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      for (const s of allStudents) {
        const isChecked = checked[s.college_id];
        const wasEnrolled = enrolledIds.has(s.college_id);
        if (isChecked && !wasEnrolled) await apiFetch("/admin/enroll", { method: "POST", body: JSON.stringify({ student_college_id: s.college_id, course_id: parseInt(selectedCourseId) }) });
        else if (!isChecked && wasEnrolled) await apiFetch("/admin/enroll", { method: "DELETE", body: JSON.stringify({ student_college_id: s.college_id, course_id: selectedCourseId }) });
      }
      setMsg("✓ Enrollment saved!");
    } catch { setMsg("Error saving enrollment"); } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>Enroll Students</h2>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 13, fontWeight: "bold" }}>Select Subject:</label>
        <select style={{ ...inp, width: "auto", minWidth: 300 }} value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
          <option value="">-- Select Subject --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.course_title} ({c.subject_catalog_nbr})</option>)}
        </select>
      </div>
      {msg && <div style={{ background: msg.includes("✓") ? "#e6ffe6" : "#ffe6e6", border: "1px solid #aaa", padding: "8px 14px", marginBottom: 14, fontSize: 13 }}>{msg}</div>}
      {selectedCourseId && (
        <>
          <table style={tbl}>
            <thead><tr><th style={{ ...th, width: 50, textAlign: "center" }}>Enroll</th><th style={th}>Roll Number</th><th style={th}>Name</th></tr></thead>
            <tbody>
              {allStudents.map((s, i) => (
                <tr key={s.college_id} style={{ background: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                  <td style={{ ...td, textAlign: "center" }}><input type="checkbox" checked={!!checked[s.college_id]} onChange={e => setChecked(prev => ({ ...prev, [s.college_id]: e.target.checked }))} style={{ width: 16, height: 16 }} /></td>
                  <td style={td}>{s.college_id}</td>
                  <td style={td}>{s.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <button onClick={save} disabled={saving} style={{ ...btn("#1a7a1a"), padding: "8px 24px", fontSize: 14 }}>{saving ? "Saving..." : "Save Enrollment"}</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── TAB 6: ENTER GRADES ──────────────────────────────────────────── */
function GradesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const LETTER_GRADES = ["", "A+", "A", "A-", "B", "B-", "C", "E", "F", "I", "X"];

  useEffect(() => { apiFetch("/admin/courses").then(setCourses); }, []);

  useEffect(() => {
    if (!selectedCourseId) { setStudents([]); setGrades({}); return; }
    apiFetch(`/admin/courses/${selectedCourseId}/enrollments`).then(setStudents);
    apiFetch(`/admin/grades/${selectedCourseId}`).then((data: any[]) => {
      const g: Record<string, string> = {};
      data.forEach(d => { g[d.student_college_id] = d.letter_grade || ""; });
      setGrades(g);
    }).catch(() => {});
  }, [selectedCourseId]);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      for (const s of students) {
        const grade = grades[s.college_id] || "";
        if (grade) {
          await apiFetch("/admin/grades", { method: "POST", body: JSON.stringify({ student_college_id: s.college_id, course_id: parseInt(selectedCourseId), letter_grade: grade }) });
        }
      }
      setMsg("✓ Grades saved!");
    } catch { setMsg("Error saving grades"); } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>Enter Grades</h2>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 13, fontWeight: "bold" }}>Select Subject:</label>
        <select style={{ ...inp, width: "auto", minWidth: 300 }} value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
          <option value="">-- Select Subject --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.course_title} ({c.subject_catalog_nbr})</option>)}
        </select>
      </div>
      {msg && <div style={{ background: msg.includes("✓") ? "#e6ffe6" : "#ffe6e6", border: "1px solid #aaa", padding: "8px 14px", marginBottom: 14, fontSize: 13 }}>{msg}</div>}
      {selectedCourseId && students.length > 0 && (
        <>
          <table style={tbl}>
            <thead><tr><th style={th}>Roll Number</th><th style={th}>Name</th><th style={{ ...th, width: 160 }}>Letter Grade</th></tr></thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.college_id} style={{ background: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                  <td style={td}>{s.college_id}</td>
                  <td style={td}>{s.name}</td>
                  <td style={td}>
                    <select style={{ ...inp, width: 120 }} value={grades[s.college_id] || ""} onChange={e => setGrades(prev => ({ ...prev, [s.college_id]: e.target.value }))}>
                      {LETTER_GRADES.map(g => <option key={g} value={g}>{g || "-- Select --"}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <button onClick={save} disabled={saving} style={{ ...btn("#1a7a1a"), padding: "8px 24px", fontSize: 14 }}>{saving ? "Saving..." : "Save Grades"}</button>
          </div>
        </>
      )}
      {selectedCourseId && students.length === 0 && <div style={{ color: "#888", fontSize: 13, padding: "16px 0" }}>No students enrolled in this subject.</div>}
    </div>
  );
}
