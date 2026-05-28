import { Router } from "express";
import { getDb } from "../db/sqlite.js";

const router = Router();

function requireStudent(req: any, res: any, next: any) {
  if (!req.session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.get("/student/courses", requireStudent, (req: any, res) => {
  const db = getDb();
  const collegeId = req.session.user.college_id;

  const courses = db.prepare(`
    SELECT c.* FROM courses c
    JOIN student_courses sc ON sc.course_id = c.id
    WHERE sc.student_college_id = ?
  `).all(collegeId) as Array<{
    id: number;
    course_title: string;
    course_id: string;
    class_nbr: string | null;
    subject_catalog_nbr: string | null;
    class_section: string;
  }>;

  res.json(courses);
});

router.get("/student/course/:courseId/grades", requireStudent, (req: any, res) => {
  const db = getDb();
  const collegeId = req.session.user.college_id;
  const courseId = parseInt(req.params.courseId);

  const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(courseId) as {
    id: number;
    course_title: string;
    course_id: string;
    class_nbr: string | null;
    subject_catalog_nbr: string | null;
    class_section: string;
  } | undefined;

  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const assignments = db.prepare(`
    SELECT a.*, m.marks_obtained
    FROM assignments a
    LEFT JOIN marks m ON m.assignment_id = a.id AND m.student_college_id = ?
    WHERE a.course_id = ?
    ORDER BY a.id
  `).all(collegeId, courseId) as Array<{
    id: number;
    course_id: number;
    assignment_name: string;
    category: string;
    begin_date: string | null;
    due_date: string | null;
    max_marks: number;
    marks_obtained: number | null;
  }>;

  let midtermGrade = 0;
  let overallGrade = 0;

  const mst = assignments.find(a => a.category === "MST");
  if (mst && mst.marks_obtained !== null && mst.marks_obtained !== undefined) {
    midtermGrade = (mst.marks_obtained / mst.max_marks) * 100;
  }

  let totalWeighted = 0;
  let totalMaxWeighted = 0;
  for (const a of assignments) {
    if (a.marks_obtained !== null && a.marks_obtained !== undefined) {
      totalWeighted += a.marks_obtained;
      totalMaxWeighted += a.max_marks;
    }
  }

  const totalMax = assignments.reduce((s, a) => s + a.max_marks, 0);
  if (totalMax > 0 && totalMaxWeighted > 0) {
    const weightedSum = assignments.reduce((s, a) => {
      if (a.marks_obtained !== null && a.marks_obtained !== undefined) {
        return s + (a.marks_obtained / totalMax) * 100;
      }
      return s;
    }, 0);
    overallGrade = weightedSum;
  }

  res.json({
    course,
    assignments,
    midterm_grade: Math.round(midtermGrade * 100) / 100,
    overall_grade: Math.round(overallGrade * 100) / 100,
  });
});

export default router;
