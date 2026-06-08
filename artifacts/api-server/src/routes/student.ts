import { Router } from "express";
import { getDb } from "../db/sqlite.js";

const router = Router();

function requireStudent(req: any, res: any, next: any) {
  if (!req.session?.user) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
}

router.get("/student/courses", requireStudent, async (req: any, res) => {
  const db = getDb();
  const result = await db.execute({ sql: `SELECT c.* FROM courses c JOIN student_courses sc ON sc.course_id = c.id WHERE sc.student_college_id = ?`, args: [req.session.user.college_id] });
  res.json(result.rows);
});

router.get("/student/course/:courseId/grades", requireStudent, async (req: any, res) => {
  const db = getDb();
  const collegeId = req.session.user.college_id;
  const courseId = parseInt(req.params.courseId);
  const courseResult = await db.execute({ sql: "SELECT * FROM courses WHERE id = ?", args: [courseId] });
  const course = courseResult.rows[0];
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  const assignResult = await db.execute({ sql: `SELECT a.*, m.marks_obtained FROM assignments a LEFT JOIN marks m ON m.assignment_id = a.id AND m.student_college_id = ? WHERE a.course_id = ? ORDER BY a.id`, args: [collegeId, courseId] });
  const assignments = assignResult.rows as any[];
  let midtermGrade = 0;
  const mst = assignments.find(a => a.category === "MST");
  if (mst && mst.marks_obtained !== null) {
    midtermGrade = (mst.marks_obtained / mst.max_marks) * 100;
  }
  const totalMax = assignments.reduce((s: number, a: any) => s + a.max_marks, 0);
  const overallGrade = totalMax > 0 ? assignments.reduce((s: number, a: any) => {
    if (a.marks_obtained !== null && a.marks_obtained !== undefined) {
      return s + (a.marks_obtained / totalMax) * 100;
    }
    return s;
  }, 0) : 0;
  res.json({ course, assignments, midterm_grade: Math.round(midtermGrade * 100) / 100, overall_grade: Math.round(overallGrade * 100) / 100 });
});

export default router;
