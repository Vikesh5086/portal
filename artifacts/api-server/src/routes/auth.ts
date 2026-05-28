import { Router } from "express";
import { getDb } from "../db/sqlite.js";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/login", (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { college_id, password } = parsed.data;
  const db = getDb();

  const user = db.prepare("SELECT * FROM users WHERE college_id = ? AND password = ?").get(college_id, password) as {
    id: number;
    college_id: string;
    name: string;
    role: string;
  } | undefined;

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  (req as any).session.user = {
    college_id: user.college_id,
    name: user.name,
    role: user.role,
  };

  res.json({ college_id: user.college_id, name: user.name, role: user.role });
});

router.get("/logout", (req, res) => {
  (req as any).session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;
