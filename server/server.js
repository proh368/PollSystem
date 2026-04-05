const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

// Настройки сервера
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Логи
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Страницы
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use(express.static(path.join(__dirname, '..', 'html')));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'user.html'));
});

// Получение пользователей
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.query('SELECT Id, Username, [Role] FROM Users');
        res.json(users); 
    } catch (err) {
        console.error("Ошибка Access:", err);
        res.status(500).json({ error: "Не удалось получить данные из БД" });
    }
});

// --- ЗАПУСК ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`Сервер: http://localhost:${PORT}`);
    console.log(`База данных: PollSystem.accdb подключена`);
    console.log('-------------------------------------------');
});





// API РЕГИСТРАЦИИ (Пункт 3 ТЗ)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO Users (Username, [Password], [Role]) 
                     VALUES ('${username}', '${hashedPassword}', 'User')`;
        
        await db.execute(sql);
        res.json({ message: "Регистрация успешна" });
    } catch (err) {
        console.error("ОШИБКА РЕГИСТРАЦИИ:", err);
        res.status(500).json({ error: "Ошибка базы данных" });
    }
});

// API ВХОДА (Пункт 3 ТЗ)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = await db.query(`SELECT * FROM Users WHERE Username = '${username}'`);
        
        if (users && users.length > 0) {
            const user = users[0];
            
            const match = await bcrypt.compare(password, user.Password);
            
            if (match) {
                res.json({ name: user.Username, role: user.Role });
            } else {
                res.status(401).json({ error: "Неверный пароль" });
            }
        } else {
            res.status(401).json({ error: "Пользователь не найден" });
        }
    } catch (err) {
        console.error("ОШИБКА ВХОДА:", err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});


app.post('/api/update_profile', async (req, res) => {
    const { oldUsername, newUsername, newPassword } = req.body;
    
    try {
        let sql;
        if (newPassword && newPassword.trim() !== "") {
            const hashedPass = await bcrypt.hash(newPassword, 10);
            sql = `UPDATE Users SET Username = '${newUsername}', [Password] = '${hashedPass}' WHERE Username = '${oldUsername}'`;
        } else {
            sql = `UPDATE Users SET Username = '${newUsername}' WHERE Username = '${oldUsername}'`;
        }

        await db.execute(sql);
        res.json({ message: "Данные в Access обновлены" });
    } catch (err) {
        console.error("ОШИБКА ОБНОВЛЕНИЯ:", err);
        res.status(500).json({ error: "Ошибка при обновлении профиля в БД" });
    }
});