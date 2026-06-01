import { Router } from "express";
import { getDb } from "../db/sqlite.js";
import {
  CreateAdminStudentBody,
  CreateAdminCourseBody,
  EnrollStudentBody,
  CreateAdminAssignmentBody,
  UpdateAdminMarksBody,
} from "@workspace/api-zod";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  const role = req.session?.user?.role;
  if (!req.session?.user || (role !== "admin" && role !== "teacher")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.get("/admin/students", requireAdmin, (_req, res) => {
  const db = getDb();
  const students = db.prepare("SELECT id, college_id, name, role FROM users WHERE role = 'student' ORDER BY name").all();
  res.json(students);
});

router.post("/admin/student", requireAdmin, (req, res) => {
  const parsed = CreateAdminStudentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { college_id, password, name } = parsed.data;
  const db = getDb();
  const result = db.prepare("INSERT INTO users (college_id, password, name, role) VALUES (?, ?, ?, 'student')").run(college_id, password, name);
  res.status(201).json({ id: result.lastInsertRowid, college_id, name, role: "student" });
});

router.delete("/admin/students/:collegeId", requireAdmin, (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM student_courses WHERE student_college_id = ?").run(req.params.collegeId);
  db.prepare("DELETE FROM marks WHERE student_college_id = ?").run(req.params.collegeId);
  db.prepare("DELETE FROM users WHERE college_id = ?").run(req.params.collegeId);
  res.json({ message: "Student deleted" });
});

router.get("/admin/student/:collegeId/courses", requireAdmin, (req, res) => {
  const db = getDb();
  const courses = db.prepare(`
    SELECT c.* FROM courses c
    JOIN student_courses sc ON sc.course_id = c.id
    WHERE sc.student_college_id = ?
  `).all(req.params.collegeId);
  res.json(courses);
});

router.get("/admin/courses", requireAdmin, (_req, res) => {
  const db = getDb();
  const courses = db.prepare("SELECT * FROM courses ORDER BY course_title").all();
  res.json(courses);
});

router.post("/admin/course", requireAdmin, (req, res) => {
  const parsed = CreateAdminCourseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { course_title, course_id, class_nbr, subject_catalog_nbr, class_section } = parsed.data;
  const db = getDb();
  const result = db.prepare("INSERT INTO courses (course_title, course_id, class_nbr, subject_catalog_nbr, class_section) VALUES (?, ?, ?, ?, ?)").run(
    course_title, course_id, class_nbr ?? null, subject_catalog_nbr ?? null, class_section ?? "1R1"
  );
  res.status(201).json({ id: result.lastInsertRowid, course_title, course_id, class_nbr, subject_catalog_nbr, class_section: class_section ?? "1R1" });
});

router.delete("/admin/courses/:courseId", requireAdmin, (req, res) => {
  const db = getDb();
  const courseId = parseInt(req.params.courseId, 10);
  const assignmentIds = (db.prepare("SELECT id FROM assignments WHERE course_id = ?").all(courseId) as { id: number }[]).map(r => r.id);
  if (assignmentIds.length > 0) {
    db.prepare(`DELETE FROM marks WHERE assignment_id IN (${assignmentIds.map(() => "?").join(",")})`).run(...assignmentIds);
  }
  db.prepare("DELETE FROM assignments WHERE course_id = ?").run(courseId);
  db.prepare("DELETE FROM student_courses WHERE course_id = ?").run(courseId);
  db.prepare("DELETE FROM courses WHERE id = ?").run(courseId);
  res.json({ message: "Course deleted" });
});

router.get("/admin/courses/:courseId/assignments", requireAdmin, (req, res) => {
  const db = getDb();
  const assignments = db.prepare("SELECT * FROM assignments WHERE course_id = ? ORDER BY begin_date").all(parseInt(req.params.courseId, 10));
  res.json(assignments);
});

router.delete("/admin/assignments/:assignmentId", requireAdmin, (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.assignmentId, 10);
  db.prepare("DELETE FROM marks WHERE assignment_id = ?").run(id);
  db.prepare("DELETE FROM assignments WHERE id = ?").run(id);
  res.json({ message: "Assignment deleted" });
});

router.post("/admin/enroll", requireAdmin, (req, res) => {
  const parsed = EnrollStudentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { student_college_id, course_id } = parsed.data;
  const db = getDb();
  const existing = db.prepare("SELECT id FROM student_courses WHERE student_college_id = ? AND course_id = ?").get(student_college_id, course_id);
  if (existing) { res.status(200).json({ message: "Already enrolled" }); return; }
  const result = db.prepare("INSERT INTO student_courses (student_college_id, course_id) VALUES (?, ?)").run(student_college_id, course_id);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete("/admin/enroll", requireAdmin, (req, res) => {
  const { student_college_id, course_id } = req.body;
  const db = getDb();
  db.prepare("DELETE FROM student_courses WHERE student_college_id = ? AND course_id = ?").run(student_college_id, parseInt(course_id, 10));
  res.json({ message: "Unenrolled" });
});

router.get("/admin/courses/:courseId/enrollments", requireAdmin, (req, res) => {
  const db = getDb();
  const courseId = parseInt(req.params.courseId, 10);
  const enrolled = db.prepare(`
    SELECT u.college_id, u.name FROM users u
    JOIN student_courses sc ON sc.student_college_id = u.college_id
    WHERE sc.course_id = ? AND u.role = 'student'
    ORDER BY u.name
  `).all(courseId);
  res.json(enrolled);
});

router.post("/admin/assignment", requireAdmin, (req, res) => {
  const parsed = CreateAdminAssignmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { course_id, assignment_name, category, begin_date, due_date, max_marks } = parsed.data;
  const db = getDb();
  const result = db.prepare("INSERT INTO assignments (course_id, assignment_name, category, begin_date, due_date, max_marks) VALUES (?, ?, ?, ?, ?, ?)").run(
    course_id, assignment_name, category, begin_date ?? null, due_date ?? null, max_marks
  );
  res.status(201).json({ id: result.lastInsertRowid, course_id, assignment_name, category, begin_date, due_date, max_marks });
});

router.post("/admin/marks", requireAdmin, (req, res) => {
  const parsed = UpdateAdminMarksBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { student_college_id, assignment_id, marks } = parsed.data;
  const db = getDb();
  const existing = db.prepare("SELECT id FROM marks WHERE student_college_id = ? AND assignment_id = ?").get(student_college_id, assignment_id);
  if (existing) {
    db.prepare("UPDATE marks SET marks_obtained = ? WHERE student_college_id = ? AND assignment_id = ?").run(marks ?? null, student_college_id, assignment_id);
  } else {
    db.prepare("INSERT INTO marks (student_college_id, assignment_id, marks_obtained) VALUES (?, ?, ?)").run(student_college_id, assignment_id, marks ?? null);
  }
  res.json({ message: "Marks updated" });
});

router.get("/admin/courses/:courseId/marks", requireAdmin, (req, res) => {
  const db = getDb();
  const courseId = parseInt(req.params.courseId, 10);
  const assignments = db.prepare("SELECT * FROM assignments WHERE course_id = ? ORDER BY begin_date").all(courseId) as any[];
  const students = db.prepare(`
    SELECT u.college_id, u.name FROM users u
    JOIN student_courses sc ON sc.student_college_id = u.college_id
    WHERE sc.course_id = ? AND u.role = 'student'
    ORDER BY u.name
  `).all(courseId) as any[];
  const marks = assignments.length > 0
    ? db.prepare(`
        SELECT m.student_college_id, m.assignment_id, m.marks_obtained
        FROM marks m
        WHERE m.assignment_id IN (${assignments.map(() => "?").join(",")})
      `).all(...assignments.map((a) => a.id)) as any[]
    : [];
  res.json({ assignments, students, marks });
});

router.post("/admin/marks/batch", requireAdmin, (req, res) => {
  const { marks } = req.body as { marks: { student_college_id: string; assignment_id: number; marks_obtained: number | null }[] };
  if (!Array.isArray(marks)) { res.status(400).json({ error: "Invalid input" }); return; }
  const db = getDb();
  const upsert = db.transaction(() => {
    for (const m of marks) {
      const existing = db.prepare("SELECT id FROM marks WHERE student_college_id = ? AND assignment_id = ?").get(m.student_college_id, m.assignment_id);
      const val = m.marks_obtained === null || m.marks_obtained === undefined || isNaN(m.marks_obtained as number) ? null : m.marks_obtained;
      if (existing) {
        db.prepare("UPDATE marks SET marks_obtained = ? WHERE student_college_id = ? AND assignment_id = ?").run(val, m.student_college_id, m.assignment_id);
      } else {
        db.prepare("INSERT INTO marks (student_college_id, assignment_id, marks_obtained) VALUES (?, ?, ?)").run(m.student_college_id, m.assignment_id, val);
      }
    }
  });
  upsert();
  res.json({ message: "Marks saved" });
});

export default router;
