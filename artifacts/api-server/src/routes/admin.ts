import { Router } from "express";
import { getDb } from "../db/sqlite.js";
import { CreateAdminStudentBody, CreateAdminCourseBody, EnrollStudentBody, CreateAdminAssignmentBody, UpdateAdminMarksBody } from "@workspace/api-zod";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  const role = req.session?.user?.role;
  if (!req.session?.user || (role !== "admin" && role !== "teacher")) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
}

router.get("/admin/students", requireAdmin, async (_req, res) => {
  const db = getDb();
  const result = await db.execute("SELECT id, college_id, name, role FROM users WHERE role = 'student' ORDER BY name");
  res.json(result.rows);
});

router.post("/admin/student", requireAdmin, async (req, res) => {
  const parsed = CreateAdminStudentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { college_id, password, name } = parsed.data;
  const db = getDb();
  const result = await db.execute({ sql: "INSERT INTO users (college_id, password, name, role) VALUES (?, ?, ?, 'student')", args: [college_id, password, name] });
  res.status(201).json({ id: Number(result.lastInsertRowid), college_id, name, role: "student" });
});

router.delete("/admin/students/:collegeId", requireAdmin, async (req, res) => {
  const db = getDb();
  await db.execute({ sql: "DELETE FROM student_courses WHERE student_college_id = ?", args: [req.params.collegeId] });
  await db.execute({ sql: "DELETE FROM marks WHERE student_college_id = ?", args: [req.params.collegeId] });
  await db.execute({ sql: "DELETE FROM users WHERE college_id = ?", args: [req.params.collegeId] });
  res.json({ message: "Student deleted" });
});

router.get("/admin/student/:collegeId/courses", requireAdmin, async (req, res) => {
  const db = getDb();
  const result = await db.execute({ sql: `SELECT c.* FROM courses c JOIN student_courses sc ON sc.course_id = c.id WHERE sc.student_college_id = ?`, args: [req.params.collegeId] });
  res.json(result.rows);
});

router.get("/admin/courses", requireAdmin, async (_req, res) => {
  const db = getDb();
  const result = await db.execute("SELECT * FROM courses ORDER BY course_title");
  res.json(result.rows);
});

router.post("/admin/course", requireAdmin, async (req, res) => {
  const parsed = CreateAdminCourseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { course_title, course_id, class_nbr, subject_catalog_nbr, class_section, instructor } = parsed.data;
  const db = getDb();
  const result = await db.execute({ sql: "INSERT INTO courses (course_title, course_id, class_nbr, subject_catalog_nbr, class_section, instructor) VALUES (?, ?, ?, ?, ?, ?)", args: [course_title, course_id, class_nbr ?? null, subject_catalog_nbr ?? null, class_section ?? "1R1", instructor ?? ""] });
  res.status(201).json({ id: Number(result.lastInsertRowid), course_title, course_id, class_nbr, subject_catalog_nbr, class_section: class_section ?? "1R1", instructor: instructor ?? "" });
});

router.patch("/admin/courses/:courseId/instructor", requireAdmin, async (req, res) => {
  const { instructor } = req.body;
  const db = getDb();
  await db.execute({ sql: "UPDATE courses SET instructor = ? WHERE id = ?", args: [instructor, parseInt(req.params.courseId, 10)] });
  res.json({ message: "Instructor updated" });
});

router.delete("/admin/courses/:courseId", requireAdmin, async (req, res) => {
  const db = getDb();
  const courseId = parseInt(req.params.courseId, 10);
  const assignResult = await db.execute({ sql: "SELECT id FROM assignments WHERE course_id = ?", args: [courseId] });
  const assignmentIds = assignResult.rows.map((r: any) => r.id);
  if (assignmentIds.length > 0) {
    await db.execute({ sql: `DELETE FROM marks WHERE assignment_id IN (${assignmentIds.map(() => "?").join(",")})`, args: assignmentIds });
  }
  await db.execute({ sql: "DELETE FROM assignments WHERE course_id = ?", args: [courseId] });
  await db.execute({ sql: "DELETE FROM student_courses WHERE course_id = ?", args: [courseId] });
  await db.execute({ sql: "DELETE FROM courses WHERE id = ?", args: [courseId] });
  res.json({ message: "Course deleted" });
});

router.get("/admin/courses/:courseId/assignments", requireAdmin, async (req, res) => {
  const db = getDb();
  const result = await db.execute({ sql: "SELECT * FROM assignments WHERE course_id = ? ORDER BY begin_date", args: [parseInt(req.params.courseId, 10)] });
  res.json(result.rows);
});

router.delete("/admin/assignments/:assignmentId", requireAdmin, async (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.assignmentId, 10);
  await db.execute({ sql: "DELETE FROM marks WHERE assignment_id = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM assignments WHERE id = ?", args: [id] });
  res.json({ message: "Assignment deleted" });
});

router.post("/admin/enroll", requireAdmin, async (req, res) => {
  const parsed = EnrollStudentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { student_college_id, course_id } = parsed.data;
  const db = getDb();
  const existing = await db.execute({ sql: "SELECT id FROM student_courses WHERE student_college_id = ? AND course_id = ?", args: [student_college_id, course_id] });
  if (existing.rows.length > 0) { res.status(200).json({ message: "Already enrolled" }); return; }
  const result = await db.execute({ sql: "INSERT INTO student_courses (student_college_id, course_id) VALUES (?, ?)", args: [student_college_id, course_id] });
  res.status(201).json({ id: Number(result.lastInsertRowid) });
});

router.delete("/admin/enroll", requireAdmin, async (req, res) => {
  const { student_college_id, course_id } = req.body;
  const db = getDb();
  await db.execute({ sql: "DELETE FROM student_courses WHERE student_college_id = ? AND course_id = ?", args: [student_college_id, parseInt(course_id, 10)] });
  res.json({ message: "Unenrolled" });
});

router.get("/admin/courses/:courseId/enrollments", requireAdmin, async (req, res) => {
  const db = getDb();
  const result = await db.execute({ sql: `SELECT u.college_id, u.name FROM users u JOIN student_courses sc ON sc.student_college_id = u.college_id WHERE sc.course_id = ? AND u.role = 'student' ORDER BY u.name`, args: [parseInt(req.params.courseId, 10)] });
  res.json(result.rows);
});

router.post("/admin/assignment", requireAdmin, async (req, res) => {
  const parsed = CreateAdminAssignmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { course_id, assignment_name, category, begin_date, due_date, max_marks } = parsed.data;
  const db = getDb();
  const result = await db.execute({ sql: "INSERT INTO assignments (course_id, assignment_name, category, begin_date, due_date, max_marks) VALUES (?, ?, ?, ?, ?, ?)", args: [course_id, assignment_name, category, begin_date ?? null, due_date ?? null, max_marks] });
  res.status(201).json({ id: Number(result.lastInsertRowid), course_id, assignment_name, category, begin_date, due_date, max_marks });
});

router.post("/admin/marks", requireAdmin, async (req, res) => {
  const parsed = UpdateAdminMarksBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { student_college_id, assignment_id, marks } = parsed.data;
  const db = getDb();
  const existing = await db.execute({ sql: "SELECT id FROM marks WHERE student_college_id = ? AND assignment_id = ?", args: [student_college_id, assignment_id] });
  if (existing.rows.length > 0) {
    await db.execute({ sql: "UPDATE marks SET marks_obtained = ? WHERE student_college_id = ? AND assignment_id = ?", args: [marks ?? null, student_college_id, assignment_id] });
  } else {
    await db.execute({ sql: "INSERT INTO marks (student_college_id, assignment_id, marks_obtained) VALUES (?, ?, ?)", args: [student_college_id, assignment_id, marks ?? null] });
  }
  res.json({ message: "Marks updated" });
});

router.get("/admin/courses/:courseId/marks", requireAdmin, async (req, res) => {
  const db = getDb();
  const courseId = parseInt(req.params.courseId, 10);
  const assignResult = await db.execute({ sql: "SELECT * FROM assignments WHERE course_id = ? ORDER BY begin_date", args: [courseId] });
  const assignments = assignResult.rows as any[];
  const studResult = await db.execute({ sql: `SELECT u.college_id, u.name FROM users u JOIN student_courses sc ON sc.student_college_id = u.college_id WHERE sc.course_id = ? AND u.role = 'student' ORDER BY u.name`, args: [courseId] });
  const students = studResult.rows as any[];
  let marks: any[] = [];
  if (assignments.length > 0) {
    const ids = assignments.map((a: any) => a.id);
    const marksResult = await db.execute({ sql: `SELECT m.student_college_id, m.assignment_id, m.marks_obtained FROM marks m WHERE m.assignment_id IN (${ids.map(() => "?").join(",")})`, args: ids });
    marks = marksResult.rows as any[];
  }
  res.json({ assignments, students, marks });
});

router.post("/admin/marks/batch", requireAdmin, async (req, res) => {
  const { marks } = req.body as { marks: { student_college_id: string; assignment_id: number; marks_obtained: number | null }[] };
  if (!Array.isArray(marks)) { res.status(400).json({ error: "Invalid input" }); return; }
  const db = getDb();
  for (const m of marks) {
    const val = m.marks_obtained === null || m.marks_obtained === undefined || isNaN(m.marks_obtained as number) ? null : m.marks_obtained;
    const existing = await db.execute({ sql: "SELECT id FROM marks WHERE student_college_id = ? AND assignment_id = ?", args: [m.student_college_id, m.assignment_id] });
    if (existing.rows.length > 0) {
      await db.execute({ sql: "UPDATE marks SET marks_obtained = ? WHERE student_college_id = ? AND assignment_id = ?", args: [val, m.student_college_id, m.assignment_id] });
    } else {
      await db.execute({ sql: "INSERT INTO marks (student_college_id, assignment_id, marks_obtained) VALUES (?, ?, ?)", args: [m.student_college_id, m.assignment_id, val] });
    }
  }
  res.json({ message: "Marks saved" });
});

router.get("/admin/grades/:courseId", requireAdmin, async (req, res) => {
  const db = getDb();
  const result = await db.execute({ sql: "SELECT * FROM student_grades WHERE course_id = ?", args: [parseInt(req.params.courseId, 10)] });
  res.json(result.rows);
});

router.post("/admin/grades", requireAdmin, async (req, res) => {
  const { student_college_id, course_id, letter_grade } = req.body;
  const gradePoints: Record<string, number> = { "A+": 10, "A": 10, "A-": 9, "B": 8, "B-": 7, "C": 6, "E": 2, "F": 0 };
  const grade_points = gradePoints[letter_grade] ?? null;
  const db = getDb();
  await db.execute({ sql: `INSERT INTO student_grades (student_college_id, course_id, letter_grade, credits, grade_points) VALUES (?, ?, ?, ?, ?) ON CONFLICT(student_college_id, course_id) DO UPDATE SET letter_grade=excluded.letter_grade, grade_points=excluded.grade_points`, args: [student_college_id, course_id, letter_grade, null, grade_points] });
  res.json({ message: "Grade saved" });
});

export default router;
