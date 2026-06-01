import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../../../thapar.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
    seedData(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student'
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_title TEXT NOT NULL,
      course_id TEXT NOT NULL,
      class_nbr TEXT,
      subject_catalog_nbr TEXT,
      class_section TEXT DEFAULT '1R1'
    );

    CREATE TABLE IF NOT EXISTS student_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_college_id TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      assignment_name TEXT NOT NULL,
      category TEXT NOT NULL,
      begin_date TEXT,
      due_date TEXT,
      max_marks REAL NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_college_id TEXT NOT NULL,
      assignment_id INTEGER NOT NULL,
      marks_obtained REAL,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id)
    );
  `);
}

function seedData(db: Database.Database) {
  const userCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
  if (userCount > 0) return;

  db.prepare(`INSERT INTO users (college_id, password, name, role) VALUES (?, ?, ?, ?)`).run("ADMIN001", "admin123", "Admin User", "admin");
  db.prepare(`INSERT INTO users (college_id, password, name, role) VALUES (?, ?, ?, ?)`).run("102203001", "student123", "VIKESH KUMAR", "student");

  const courses = [
    ["LINEAR ALGEBRA", "001340", "454", "UCT 201", "1R1"],
    ["STATISTICAL MODELING", "001430", "2257", "UCT 202", "1R1"],
    ["UNIVERSAL HUMAN VALUES", "002195", "1510", "UCT 204", "1R1"],
    ["ENGLISH LANGUAGE COURSE", "002196", "1882", "UCT 205", "1R1"],
    ["OBJECT ORIENTED PROGRAMMING", "001385", "82", "UCT 303", "1R1"],
    ["PRINCIPLES OF ELECTRONICS", "000421", "2178", "UEC00 2", "1R1"],
    ["FUNDAMENTALS OF ECONOMICS", "000521", "1353", "UHU00 7", "1R1"],
  ];

  const insertCourse = db.prepare(`INSERT INTO courses (course_title, course_id, class_nbr, subject_catalog_nbr, class_section) VALUES (?, ?, ?, ?, ?)`);
  const insertEnroll = db.prepare(`INSERT INTO student_courses (student_college_id, course_id) VALUES (?, ?)`);

  for (const [title, courseId, classNbr, subjectNbr, section] of courses) {
    const result = insertCourse.run(title, courseId, classNbr, subjectNbr, section);
    insertEnroll.run("102203001", result.lastInsertRowid);
  }

  const linearAlgebraId = (db.prepare("SELECT id FROM courses WHERE course_id = '001340'").get() as { id: number }).id;

  const insertAssignment = db.prepare(`INSERT INTO assignments (course_id, assignment_name, category, begin_date, due_date, max_marks) VALUES (?, ?, ?, ?, ?, ?)`);
  const insertMark = db.prepare(`INSERT INTO marks (student_college_id, assignment_id, marks_obtained) VALUES (?, ?, ?)`);

  // Dates stored as MM/DD/YYYY matching display format
  const assignments: [string, string, string, string, number][] = [
    ["mst",   "MST",   "03/12/2026", "04/20/2026", 30],
    ["Quiz1", "Quiz 1","04/01/2026", "05/29/2026", 11],
    ["Quiz2", "Quiz 2","05/13/2026", "05/31/2026", 14],
    ["Tute",  "TUT1",  "05/25/2026", "05/31/2026",  5],
    ["est",   "EST",   "05/27/2026", "06/05/2026", 40],
  ];

  // NULL marks = blank; 0 = shows as 0.00; Tute is NULL (blank)
  const marksData: Record<string, number | null> = {
    "mst":   9.50,
    "Quiz1": 7.00,
    "Quiz2": 7.00,
    "Tute":  null,
    "est":   8.00,
  };

  for (const [name, category, beginDate, dueDate, maxMarks] of assignments) {
    const result = insertAssignment.run(linearAlgebraId, name, category, beginDate, dueDate, maxMarks);
    insertMark.run("102203001", result.lastInsertRowid, marksData[name] ?? null);
  }
}
