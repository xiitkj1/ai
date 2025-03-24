const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Koneksi ke Database MySQL
const db = mysql.createConnection({
  host: "sql206.infinityfree.com",
  user: "if0_38501368",  // Ganti dengan username MySQL kamu
  password: "sCrjDerDuqURnv",  // Ganti dengan password MySQL kamu
  database: "if0_38501368_chatbot_ai",
});

db.connect((err) => {
  if (err) {
    console.error("Gagal koneksi ke database:", err);
  } else {
    console.log("Terhubung ke database MySQL.");
  }
});

// API untuk mendapatkan jawaban dari database
app.post("/ask", (req, res) => {
  const userQuestion = req.body.question.toLowerCase().trim();

  const query = "SELECT answer FROM responses WHERE question LIKE ?";
  db.query(query, [`%${userQuestion}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      res.json({ answer: results[0].answer });
    } else {
      res.json({ answer: "Maaf, saya tidak mengerti pertanyaan itu." });
    }
  });
});

// Jalankan server di port 3000
app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
