const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Підключення до БД
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'KseniIaHonch3317studNUzP22%',
  database: 'sportcenter_db'
});

db.connect(err => {
  if (err) console.error('❌ Помилка з\'єднання з БД:', err);
  else console.log('✅ Підключено до MySQL');
});

app.use(express.static(path.join(__dirname, '..', 'full')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'full', 'main.html'));
});

//Реєстрація
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Заповніть всі поля' });
  }

  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkQuery, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Помилка БД' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Користувач з таким логіном вже існує' });
    }

    const role = 'user';
    const insertQuery = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.query(insertQuery, [username, password, role], (err) => {
      if (err) return res.status(500).json({ message: 'Помилка при реєстрації' });

      res.json({ message: 'Реєстрація успішна!' });
    });
  });
});

//Авторизація
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Заповніть всі поля' });
  }

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Помилка БД' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Неправильний логін або пароль' });
    }

    res.json({ message: 'Успішний вхід', username });
  });
});

app.post('/userdetails/save', (req, res) => {
  const { fullName, phoneNumber, email, dateOfBirth } = req.body;

  console.log('User details saved:', fullName, phoneNumber, email, dateOfBirth);
  res.status(200).json({ message: 'Дані користувача збережено успішно.' });
});

app.listen(8080, () => {
  console.log('🚀 Сервер запущено на http://localhost:8080');
});
