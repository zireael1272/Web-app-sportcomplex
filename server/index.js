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

app.post("/get_user_id", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username обов’язковий" });
  }

  db.query(
    "SELECT id FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Помилка сервера" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Користувача не знайдено" });
      }

      res.json({ userId: results[0].id });
    }
  );
});

app.post("/purchase", (req, res) => {
  const { user_id, type, duration, price } = req.body;

  if (!user_id || !type || !duration || !price) {
    return res.status(400).json({ message: "Недостатньо даних для покупки." });
  }

  const purchaseDate = new Date();

  const query =
    "INSERT INTO subscriptions (user_id, type, duration, price, purchase_date) VALUES (?, ?, ?, ?, ?)";
  const values = [user_id, type, duration, price, purchaseDate];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Помилка при додаванні підписки: " + err.stack);
      return res
        .status(500)
        .json({ message: "Помилка при додаванні підписки." });
    }

    // Отправляем ответ об успешной добавлении
    res.status(200).json({ message: "Абонемент успішно активовано." });
  });
});

app.post("/subscriptions", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId обов'язковий" });
  }

  console.log(`Запит на отримання абонементів для користувача: ${userId}`);

  const query = "SELECT * FROM subscriptions WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res
        .status(500)
        .json({ error: "Помилка при отриманні абонементів" });
    }

    console.log("Отримано абонементи:", results);
    res.json(results);
  });
});

app.post("/booking", (req, res) => {
  const { userId, date, time, activity } = req.body;

  if (!userId || !date || !time || !activity) {
    return res.status(400).json({ message: "Всі поля обов'язкові." });
  }

  // Перевіряємо наявність абонемента
  const getSubscriptionQuery = "SELECT id, duration FROM subscriptions WHERE user_id = ? AND duration > 0 LIMIT 1";
  db.query(getSubscriptionQuery, [userId], (err, result) => {
    if (err) {
      console.error("Помилка при отриманні абонемента:", err);
      return res.status(500).json({ message: "Помилка при перевірці абонемента" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "У вас немає доступних абонементів." });
    }

    const subscription = result[0];
    const newDuration = subscription.duration - 1;

    if (newDuration >= 0) {
      const updateSubQuery = "UPDATE subscriptions SET duration = ? WHERE id = ?";
      db.query(updateSubQuery, [newDuration, subscription.id], (errUpdate, updateResult) => {
        if (errUpdate) {
          console.error("Помилка оновлення абонемента:", errUpdate);
          return res.status(500).json({ message: "Помилка при оновленні абонемента." });
        }

        const insertRecordQuery =
          "INSERT INTO records (user_id, records_date, records_time, activity_type) VALUES (?, ?, ?, ?)";

        db.query(insertRecordQuery, [userId, date, time, activity], (errInsert, insertResult) => {
          if (errInsert) {
            console.error("Помилка при записі:", errInsert);
            return res.status(500).json({ message: "Помилка при записі." });
          }

          res.json({ message: "Запис успішно додано та абонемент оновлено." });
        });
      });
    } else {
      res.status(400).json({ message: "Кількість занять у вашому абонементі закінчилася." });
    }
  });
});

app.post("/records", (req, res) => {
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: "userId обов'язковий" });
  }

  const query =
    "SELECT records_date, records_time, activity_type FROM records WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Помилка бази даних" });
    }

    res.json(results);
  });
});

app.post("/profile_data", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Обов’язкові поля відсутні." });
  }

  const query = `
    SELECT full_name, phone, email, birth_date 
    FROM userdetails 
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Помилка сервера" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    res.json(results[0]);
  });
});

app.post("/user-subscriptions", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.error("userId не передано");
    return res.status(400).json({ error: "userId обов'язковий" });
  }

  const query = `SELECT type, duration, price, purchase_date FROM subscriptions WHERE user_id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Помилка при запиті до БД:", err.message);
      return res.status(500).json({ error: "Помилка сервера" });
    }
    res.json(results);
  });
});

app.post("/progress-add", async (req, res) => {
  const { userId, weight } = req.body;

  if (!userId || isNaN(weight)) {
    return res.status(400).json({ error: "Некоректні дані" });
  }

  try {
    await db.query(
      "INSERT INTO progress (user_id, weight) VALUES (?, ?)",
      [userId, weight]
    );
    res.status(200).json({ message: "Прогрес додано" });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Помилка збереження прогресу" });
  }
});

app.post("/progress", (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: "userId обов’язковий" });

  const query = "SELECT weight, visits, record_date FROM progress WHERE user_id = ? ORDER BY record_date DESC";
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results);
  });
});



app.listen(8080, () => {
  console.log("Сервер запущено на http://localhost:8080");
});
