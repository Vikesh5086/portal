import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

await initSchema();
await seedData();

export function getDb() {
  return client;
}

async function initSchema() {
  await client.executeMultiple(`
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
      class_section TEXT DEFAULT '1R1',
      instructor TEXT DEFAULT ''
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
    CREATE TABLE IF NOT EXISTS student_grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_college_id TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      letter_grade TEXT,
      credits REAL,
      grade_points REAL,
      UNIQUE(student_college_id, course_id)
    );
  `);

  try { await client.execute(`ALTER TABLE courses ADD COLUMN instructor TEXT DEFAULT ''`); } catch {}
}

async function seedData() {
  const result = await client.execute("SELECT COUNT(*) as c FROM users");
  const count = result.rows[0].c as number;
  if (count > 0) return;

  await client.execute({ sql: `INSERT INTO users (college_id, password, name, role) VALUES (?, ?, ?, ?)`, args: ["ADMIN001", "admin123", "Admin User", "admin"] });
  await client.execute({ sql: `INSERT INTO users (college_id, password, name, role) VALUES (?, ?, ?, ?)`, args: ["102203001", "student123", "VIKESH KUMAR", "student"] });

  const courses: [string, string, string, string, string, string][] = [
    ["LINEAR ALGEBRA","001340","454","UCT 201","1R1","SAPANPREET KAUR ."],
    ["STATISTICAL MODELING","001430","2257","UCT 202","1R1","DEEPAK GARG ."],
    ["UNIVERSAL HUMAN VALUES","002195","1510","UCT 204","1R1","SUNITA GARHWAL ."],
    ["ENGLISH LANGUAGE COURSE","002196","1882","UCT 205","1R1","SAPANPREET KAUR ."],
    ["PYTHON SCRIPTING/BASIC PROGRAM","002298","4948","UCT 206","1R1C","ANU BAJAJ . SUMIT MIGLANI ."],
    ["OBJECT ORIENTED PROGRAMMING","001385","82","UCT 303","1R1","RAJESH BHATIA ."],
    ["PRINCIPLES OF ELECTRONICS","000421","2178","UEC00 2","1R1","MOHIT GARG ."],
    ["FUNDAMENTALS OF ECONOMICS","000521","1353","UHU00 7","1R1","KAMLESH ARYA ."],
  ];

  for (const [title, courseId, classNbr, subjectNbr, section, instructor] of courses) {
    const r = await client.execute({ sql: `INSERT INTO courses (course_title, course_id, class_nbr, subject_catalog_nbr, class_section, instructor) VALUES (?, ?, ?, ?, ?, ?)`, args: [title, courseId, classNbr, subjectNbr, section, instructor] });
    await client.execute({ sql: `INSERT INTO student_courses (student_college_id, course_id) VALUES (?, ?)`, args: ["102203001", r.lastInsertRowid] });
  }

  const laResult = await client.execute(`SELECT id FROM courses WHERE course_id = '001340'`);
  const linearAlgebraId = laResult.rows[0].id as number;

  const assignments: [string, string, string, string, number][] = [
    ["mst","MST","03/12/2026","04/20/2026",30],
    ["Quiz1","Quiz 1","04/01/2026","05/29/2026",11],
    ["Quiz2","Quiz 2","05/13/2026","05/31/2026",14],
    ["Tute","TUT1","05/25/2026","05/31/2026",5],
    ["est","EST","05/27/2026","06/05/2026",40],
  ];

  const marksData: Record<string, number | null> = { "mst": 9.50, "Quiz1": 7.00, "Quiz2": 7.00, "Tute": null, "est": 8.00 };

  for (const [name, category, beginDate, dueDate, maxMarks] of assignments) {
    const r = await client.execute({ sql: `INSERT INTO assignments (course_id, assignment_name, category, begin_date, due_date, max_marks) VALUES (?, ?, ?, ?, ?, ?)`, args: [linearAlgebraId, name, category, beginDate, dueDate, maxMarks] });
    await client.execute({ sql: `INSERT INTO marks (student_college_id, assignment_id, marks_obtained) VALUES (?, ?, ?)`, args: ["102203001", r.lastInsertRowid, marksData[name] ?? null] });
  }
}
