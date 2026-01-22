const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   REGISTER API
   ========================= */
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, password], (err) => {
        if (err) {
            return res.status(400).json({ message: "User already exists" });
        }
        res.json({ message: "Account created successfully" });
    });
});

/* =========================
   LOGIN API
   ========================= */
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username=? AND password=?";
    db.query(sql, [username, password], (err, result) => {
        if (result.length > 0) {
            res.json({ success: true, message: "Login successful" });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
