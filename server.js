const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

/* ================= REGISTER ================= */
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: "Missing fields" });
    }

    db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password],
        (err) => {
            if (err) {
                console.error("Register error:", err);
                return res.json({ success: false, message: "User exists" });
            }
            res.json({ success: true });
        }
    );
});

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query(
        "SELECT id, username FROM users WHERE username=? AND password=?",
        [username, password],
        (err, result) => {
            if (err) {
                console.error("Login error:", err);
                return res.json({ success: false });
            }

            if (!result.length) {
                return res.json({ success: false });
            }

            res.json({
                success: true,
                user: {
                    id: result[0].id,
                    username: result[0].username
                }
            });
        }
    );
});

/* ================= GET PROFILE ================= */
app.get("/profile/:userId", (req, res) => {
    const userId = req.params.userId;

    if (!userId) return res.json({ exists: false });

    db.query(
        "SELECT full_name, bio, profile_photo FROM user_profiles WHERE user_id=?",
        [userId],
        (err, rows) => {
            if (err) {
                console.error("Profile fetch error:", err);
                return res.json({ exists: false });
            }

            if (!rows.length) {
                return res.json({ exists: false });
            }

            res.json({ exists: true, profile: rows[0] });
        }
    );
});

/* ================= SAVE / UPDATE PROFILE ================= */
app.post("/profile", (req, res) => {
    const { userId, name, bio, photo } = req.body;

    if (!userId) return res.json({ success: false });

    db.query(
        "SELECT id FROM user_profiles WHERE user_id=?",
        [userId],
        (err, rows) => {
            if (err) {
                console.error("Profile check error:", err);
                return res.json({ success: false });
            }

            const isUpdate = rows.length > 0;

            const sql = isUpdate
                ? "UPDATE user_profiles SET full_name=?, bio=?, profile_photo=? WHERE user_id=?"
                : "INSERT INTO user_profiles (full_name, bio, profile_photo, user_id) VALUES (?,?,?,?)";

            const params = [name, bio, photo, userId];

            db.query(sql, params, (err2) => {
                if (err2) {
                    console.error("Profile save error:", err2);
                    return res.json({ success: false });
                }
                res.json({ success: true });
            });
        }
    );
});

/* ================= SAVE PRINTED RESUME ================= */
app.post("/resume/save", (req, res) => {
    const { userId, resumeName, resumeData, pdfBase64 } = req.body;

    if (!userId || !pdfBase64) {
        return res.json({ success: false });
    }

    db.query(
        `INSERT INTO resume_history 
         (user_id, resume_name, resume_data, pdf_base64) 
         VALUES (?, ?, ?, ?)`,
        [userId, resumeName, JSON.stringify(resumeData), pdfBase64],
        (err) => {
            if (err) {
                console.error("Resume save error:", err);
                return res.json({ success: false });
            }
            res.json({ success: true });
        }
    );
});

/* ================= FETCH HISTORY ================= */
app.get("/resume/history/:userId", (req, res) => {
    const userId = req.params.userId;

    db.query(
        `SELECT id, resume_name, created_at 
         FROM resume_history 
         WHERE user_id=? 
         ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error("History error:", err);
                return res.json([]);
            }
            res.json(rows);
        }
    );
});

/* ================= FETCH SINGLE RESUME ================= */
app.get("/resume/:id", (req, res) => {
    db.query(
        "SELECT * FROM resume_history WHERE id=?",
        [req.params.id],
        (err, rows) => {
            if (err || !rows.length) {
                return res.json(null);
            }
            res.json(rows[0]);
        }
    );
});

app.listen(5000, () =>
    console.log("✅ Server running on port 5000")
);
