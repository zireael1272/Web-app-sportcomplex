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

app.post("/update_profile", async (req, res) => {
  const { userId, fullName, phoneNumber, email } = req.body;

  if (!userId || !fullName) {
    return res.status(400).json({ message: "Обов’язкові поля відсутні." });
  }

  try {
    await db.query(
      "UPDATE userdetails SET full_name = ?, phone = ?, email = ? WHERE user_id = ?",
      [fullName, phoneNumber, email, userId]
    );

    res.json({ message: "Дані успішно збережено" });
  } catch (error) {
    console.error("Помилка при оновленні профілю:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

app.post("/purchase", (req, res) => {
  const { userId, type, duration } = req.body;

  if (!userId || !type || !duration) {
    return res.status(400).json({ error: "Невірні дані запиту" });
  }

  db.query(
    "SELECT * FROM subscriptions WHERE user_id = ? AND type = ?",
    [userId, type],
    (err, results) => {
      if (err) {
        console.error("Помилка при запиті до БД:", err);
        return res.status(500).json({ error: "Помилка бази даних" });
      }

      const now = new Date();
      const nowStr = now.toISOString().slice(0, 19).replace("T", " ");
      const existing = results[0];

      if (existing) {
        const purchaseDate = new Date(existing.purchase_date);
        const endDate = new Date(purchaseDate);
        endDate.setDate(endDate.getDate() + existing.duration);

        if (endDate < now) {
          db.query(
            "UPDATE subscriptions SET purchase_date = ?, duration = ? WHERE id = ?",
            [nowStr, duration, existing.id],
            (err) => {
              if (err) {
                console.error("Помилка оновлення абонемента:", err);
                return res
                  .status(500)
                  .json({ error: "Не вдалося оновити абонемент" });
              }

              return res.json({ message: "Абонемент успішно активовано." });
            }
          );
        } else {
          return res.status(400).json({
            error: "У вас ще активний абонемент на цей тип",
          });
        }
      } else {
        db.query(
          "INSERT INTO subscriptions (user_id, type, purchase_date, duration) VALUES (?, ?, ?, ?)",
          [userId, type, nowStr, duration],
          (err) => {
            if (err) {
              console.error("Помилка вставки абонемента:", err);
              return res
                .status(500)
                .json({ error: "Не вдалося додати абонемент" });
            }

            return res.json({ message: "Абонемент успішно активовано." });
          }
        );
      }
    }
  );
});

app.post("/subscriptions", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId обов'язковий" });
  }

  const query = "SELECT * FROM subscriptions WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res
        .status(500)
        .json({ error: "Помилка при отриманні абонементів" });
    }

    res.json(results);
  });
});

app.post("/booking", (req, res) => {
  const { userId, date, time, activity } = req.body;

  if (!userId || !date || !time || !activity) {
    return res.status(400).json({ message: "Всі поля обов'язкові." });
  }

  let dbActivity;
  if (activity === "Фітнес") dbActivity = "fitness";
  else if (activity === "Бокс") dbActivity = "boxing";
  else return res.status(400).json({ message: "Недійсний тип активності." });

  const getSubscriptionQuery = `
    SELECT id, duration 
    FROM subscriptions 
    WHERE user_id = ? 
      AND type = ? 
      AND duration > 0 
    LIMIT 1
  `;

  db.query(getSubscriptionQuery, [userId, dbActivity], (err, result) => {
    if (err) {
      console.error("Помилка при отриманні абонемента:", err);
      return res
        .status(500)
        .json({ message: "Помилка при перевірці абонемента" });
    }

    if (result.length === 0) {
      return res
        .status(400)
        .json({ message: "Немає активного абонемента на цей тип занять." });
    }

    const subscription = result[0];
    const newDuration = subscription.duration - 1;

    const updateSubQuery = `
      UPDATE subscriptions 
      SET duration = ? 
      WHERE id = ?
    `;

    db.query(updateSubQuery, [newDuration, subscription.id], (errUpdate) => {
      if (errUpdate) {
        console.error("Помилка оновлення абонемента:", errUpdate);
        return res
          .status(500)
          .json({ message: "Помилка при оновленні абонемента." });
      }

      const localDate = new Date(date);
      const formattedDate = localDate.toISOString().slice(0, 10);

      const insertRecordQuery = `
        INSERT INTO records (user_id, records_date, records_time, activity_type) 
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertRecordQuery,
        [userId, formattedDate, time, dbActivity],
        (errInsert) => {
          if (errInsert) {
            console.error("Помилка при записі:", errInsert);
            return res.status(500).json({ message: "Помилка при записі." });
          }

          res.json({ message: "Запис успішний. Абонемент оновлено." });
        }
      );
    });
  });
});

app.post("/records", (req, res) => {
  const { userId } = req.body;

  const sql = `
    SELECT DATE(records_date) AS records_date, records_time, activity_type
    FROM records
    WHERE user_id = ?
    ORDER BY records_date DESC, records_time
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Помилка запиту:", err);
      return res.status(500).send("Database error");
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

app.post("/progress-add", (req, res) => {
  const { userId, weight } = req.body;

  if (!userId || !weight) {
    return res.status(400).json({ message: "userId і weight обов'язкові" });
  }

  const query = `
    INSERT INTO progress (user_id, weight, record_date)
    VALUES (?, ?, NOW())
  `;
  db.query(query, [userId, weight], (err, result) => {
    if (err) {
      console.error("Помилка при додаванні ваги:", err);
      return res.status(500).json({ message: "Помилка сервера" });
    }

    res.status(200).json({ message: "Вага додана успішно" });
  });
});

app.post("/progress-current", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "userId обов'язковий." });
  }

  const query = `
    SELECT weight, record_date
    FROM progress
    WHERE user_id = ?
    ORDER BY record_date DESC
    LIMIT 1
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Помилка при отриманні поточної ваги:", err);
      return res.status(500).json({ message: "Помилка сервера" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Вага не знайдена" });
    }

    res.json(result[0]);
  });
});

app.post("/progress", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId обов'язковий" });
  }

  const query = `
    SELECT weight, record_date
    FROM progress
    WHERE user_id = ?
    ORDER BY record_date
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Помилка при отриманні історії ваги:", err);
      return res.status(500).json({ message: "Помилка сервера" });
    }

    res.json(result);
  });
});

app.post("/visits-add", (req, res) => {
  const { userId, date, type } = req.body;

  const query = `INSERT INTO visits (user_id, date, type) VALUES (?, ?, ?)`;

  db.query(query, [userId, date, type], (err) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json({ message: "Visit added" });
  });
});

app.post("/visits-delete", (req, res) => {
  const { userId, date, type } = req.body;

  if (!userId || !date || !type) {
    return res.status(400).json({ error: "userId, date або type відсутні" });
  }
  const query =
    "DELETE FROM visits WHERE user_id = ? AND DATE(date) = ? AND type = ?";

  db.query(query, [userId, date, type], (err, result) => {
    if (err) {
      console.error("DB delete error:", err);
      return res.status(500).json({ error: "Помилка при видаленні" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Запис не знайдено" });
    }

    res.status(200).json({ success: true });
  });
});

app.post("/visits-get", async (req, res) => {
  const { userId, month } = req.body;

  if (!userId || !month) {
    return res.status(400).json({ message: "userId і month обов’язкові" });
  }

  const sql = `
    SELECT date, type
    FROM visits
    WHERE user_id = ?
      AND DATE_FORMAT(date, '%Y-%m') = ?
  `;
  db.query(sql, [userId, month], (err, results) => {
    if (err) {
      console.error("Помилка при отриманні відвідувань:", err);
      return res.status(500).json({ message: "Server error" });
    }

    const visits = results.map((row) => ({
      date: row.date.toLocaleDateString("sv-SE"),
      type: row.type,
    }));

    res.json(visits);
  });
});

app.post("/sync-visits", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const syncQuery = `
    INSERT INTO visits (user_id, date, type)
    SELECT r.user_id, r.records_date, r.activity_type
    FROM records r
    LEFT JOIN visits v 
      ON v.user_id = r.user_id AND v.date = r.records_date AND v.type = r.activity_type
    WHERE DATE(r.records_date) < ?
      AND v.user_id IS NULL
  `;

  db.query(syncQuery, [today], (err, result) => {
    if (err) {
      console.error("Помилка при синхронізації відвідувань:", err);
      return res.status(500).json({ message: "Помилка при синхронізації" });
    }
    res.json({ message: "Відвідування синхронізовані" });
  });
});

app.listen(8080, () => {
  console.log("Сервер запущено на http://localhost:8080");
});
