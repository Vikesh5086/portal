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
  if (!req.session?.user || req.session.user.role !== "admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.get("/admin/students", requireAdmin, (_req, res) => {
  const db = getDb();
  const students = db.prepare("SELECT id, college_id, name, role FROM users WHERE role = 'student'").all();
  res.json(students);
});

router.post("/admin/student", requireAdmin, (req, res) => {
  const parsed = CreateAdminStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { college_id, password, name } = parsed.data;
  const db = getDb();
  const result = db.prepare("INSERT INTO users (college_id, password, name, role) VALUES (?, ?, ?, 'student')").run(college_id, password, name);
  res.status(201).json({ id: result.lastInsertRowid, college_id, name, role: "student" });
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

router.post("/admin/course", requireAdmin, (req, res) => {
  const parsed = CreateAdminCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { course_title, course_id, class_nbr, subject_catalog_nbr, class_section } = parsed.data;
  const db = getDb();
  const result = db.prepare("INSERT INTO courses (course_title, course_id, class_nbr, subject_catalog_nbr, class_section) VALUES (?, ?, ?, ?, ?)").run(
    course_title, course_id, class_nbr ?? null, subject_catalog_nbr ?? null, class_section ?? "1R1"
  );
  res.status(201).json({ id: result.lastInsertRowid, course_title, course_id, class_nbr, subject_catalog_nbr, class_section: class_section ?? "1R1" });
});

router.post("/admin/enroll", requireAdmin, (req, res) => {
  const parsed = EnrollStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { student_college_id, course_id } = parsed.data;
  const db = getDb();
  const result = db.prepare("INSERT INTO student_courses (student_college_id, course_id) VALUES (?, ?)").run(student_college_id, course_id);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.post("/admin/assignment", requireAdmin, (req, res) => {
  const parsed = CreateAdminAssignmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { course_id, assignment_name, category, begin_date, due_date, max_marks } = parsed.data;
  const db = getDb();
  const result = db.prepare("INSERT INTO assignments (course_id, assignment_name, category, begin_date, due_date, max_marks) VALUES (?, ?, ?, ?, ?, ?)").run(
    course_id, assignment_name, category, begin_date ?? null, due_date ?? null, max_marks
  );
  res.status(201).json({ id: result.lastInsertRowid, course_id, assignment_name, category, begin_date, due_date, max_marks });
});

router.post("/admin/marks", requireAdmin, (req, res) => {
  const parsed = UpdateAdminMarksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
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

export default router;
