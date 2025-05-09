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
  if (err) console.error(" Помилка з'єднання з БД:", err);
  else console.log("Підключено до MySQL");
});

app.use(express.static(path.join(__dirname, "..", "full")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "full", "main.html"));
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Логін та пароль обов’язкові." });
  }

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";

  db.query(query, [username, password], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Помилка під час реєстрації", error: err });
    }

    res.json({ userId: result.insertId });
  });
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

    res.json({
      message: "Успішний вхід",
      username: results[0].username,
      userId: results[0].id,
    });
  });
});

app.post("/userdetails", async (req, res) => {
  const { userId, fullName, phoneNumber, email, dateOfBirth } = req.body;

  if (!userId || !fullName || !dateOfBirth) {
    return res.status(400).json({ message: "Обов’язкові поля відсутні." });
  }

  await db.query(
    "INSERT INTO userdetails (user_id, full_name, phone, email, birth_date) VALUES (?, ?, ?, ?, ?)",
    [userId, fullName, phoneNumber, email, dateOfBirth]
  );

  res.json({ message: "Дані успішно збережено" });
});

app.post("/booking", (req, res) => {
  const { userId, date, time, activity } = req.body;

  if (!userId || !date || !time || !activity) {
    return res.status(400).json({ message: "Всі поля обов'язкові." });
  }

  const query =
    "INSERT INTO records (user_id, records_date, records_time, activity_type) VALUES (?, ?, ?, ?)";

  db.query(query, [userId, date, time, activity], (err, result) => {
    if (err) {
      console.error("Помилка запису:", err);
      return res
        .status(500)
        .json({ message: "Помилка при записі", error: err });
    }
    res.json({ message: "Запис збережено успішно!" });
  });
});
app.listen(8080, () => {
  console.log("Сервер запущено на http://localhost:8080");
});
