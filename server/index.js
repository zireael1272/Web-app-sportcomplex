const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "KseniIaHonch3317studNUzP22%",
  database: "sportcenter_db",
});

db.connect((err) => {
  if (err) console.error("❌ Помилка з'єднання з БД:", err);
  else console.log("✅ Підключено до MySQL");
});

app.use(express.static(path.join(__dirname, "..", "full")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "full", "main.html"));
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Введіть логін і пароль." });
  }

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Помилка БД" });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: "Логін уже зайнято." });
      }

      res.status(200).json({ message: "Можна продовжувати" });
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Заповніть всі поля" });
  }

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ message: "Помилка БД" });

    if (results.length === 0) {
      return res.status(401).json({ message: "Неправильний логін або пароль" });
    }

    res.json({ message: "Успішний вхід", username });
  });
});

app.post("/register-full", async (req, res) => {
  const { username, password, fullName, phoneNumber, email, dateOfBirth } =
    req.body;

  if (!username || !password || !fullName || !dateOfBirth) {
    return res.status(400).json({ message: "Обов’язкові поля відсутні." });
  }

  const existing = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  if (existing.length > 0) {
    return res.status(409).json({ message: "Користувач вже існує." });
  }

  const userResult = await db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password]
  );
  const userId = userResult.insertId;

  await db.query(
    `
    INSERT INTO userdetails (user_id, full_name, phone_number, email, date_of_birth)
    VALUES (?, ?, ?, ?, ?)`,
    [userId, fullName, phoneNumber, email, dateOfBirth]
  );

  res.json({ message: "Користувач створений успішно." });
});

app.listen(8080, () => {
  console.log("🚀 Сервер запущено на http://localhost:8080");
});
