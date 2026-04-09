const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { validateUser } = require('../js/validator'); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/html', express.static(path.join(__dirname, '..', 'html')));

// Маршруты для выдачи файлов
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'user.html'));
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await db.query('SELECT IdUser, Username, [Role] FROM [Users] ORDER BY IdUser DESC');
        res.json(users);
    } catch (err) {
        console.error("Ошибка загрузки пользователей:", err);
        res.status(500).json({ error: "Ошибка БД" });
    }
});

const PORT = 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Сервер запущен: http://localhost:${PORT}`);
    });
}

module.exports = app; 




app.post('/api/register', validateUser, async (req, res) => {
    const { username, password, role } = req.body; 
    
    try {
        const existing = await db.query(`SELECT * FROM Users WHERE Username = '${username}'`);
        if (existing.length > 0) return res.status(400).json({ error: "Логин занят" });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userRole = role ? role : 'User';

        const sql = `INSERT INTO Users (Username, [Password], [Role]) 
                     VALUES ('${username}', '${hashedPassword}', '${userRole}')`;
        
        await db.execute(sql);
        res.json({ message: "Пользователь создан!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка БД" });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = await db.query(`SELECT * FROM Users WHERE Username = '${username}'`);
        
        if (users && users.length > 0) {
            const user = users[0];
            
            const match = await bcrypt.compare(password, user.Password);
            
            if (match) {
                res.json({ id: user.IdUser, name: user.Username, role: user.Role });
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


app.get('/api/polls', async (req, res) => {
    try {
        const polls = await db.query('SELECT * FROM [Polls]');
        
        await Promise.all(polls.map(async (poll) => {
            const questions = await db.query(`SELECT * FROM [Questions] WHERE [IdPoll] = ${poll.IdPoll}`);
            
            await Promise.all(questions.map(async (q) => {
                q.options = await db.query(`SELECT * FROM [Options] WHERE [IdQuestion] = ${q.IdQuestion}`);
                
                const [totalVotesRes, optVotesRes] = await Promise.all([
                    db.query(`SELECT COUNT(*) as [total] FROM [Votes] WHERE IdOption IN (SELECT IdOption FROM [Options] WHERE IdQuestion = ${q.IdQuestion})`),
                    db.query(`SELECT IdOption, COUNT(*) as [count] FROM [Votes] WHERE IdOption IN (SELECT IdOption FROM [Options] WHERE IdQuestion = ${q.IdQuestion}) GROUP BY IdOption`)
                ]);

                const totalVotes = totalVotesRes[0]?.total || 0;
                q.totalVotes = totalVotes;

                q.options.forEach(opt => {
                    const found = optVotesRes.find(v => v.IdOption === opt.IdOption);
                    opt.votesCount = found ? found.count : 0;
                    opt.percent = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
                });
            }));
            poll.questions = questions;
        }));
        
        res.json(polls);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка БД" });
    }
});





app.post('/api/vote', async (req, res) => {
    const { userId, optionId } = req.body;
    
    try {
        const now = new Date().toISOString().slice(0, 10);
        
        const optionData = await db.query(`SELECT IdQuestion FROM [Options] WHERE [IdOption] = ${optionId}`);
        const questionId = optionData[0].IdQuestion;

        const existingVote = await db.query(`
            SELECT Votes.IdVote 
            FROM Votes INNER JOIN Options ON Votes.IdOption = Options.IdOption 
            WHERE Votes.IdUser = ${userId} AND Options.IdQuestion = ${questionId}
        `);

        if (existingVote && existingVote.length > 0) {
            const idToUpdate = existingVote[0].IdVote;
            await db.execute(`
                UPDATE Votes 
                SET IdOption = ${optionId}, CreatedAt = '${now}' 
                WHERE IdVote = ${idToUpdate}
            `);
            console.log(`[VOTE UPDATE]: Юзер ${userId} сменил выбор на ${optionId}`);
        } else {
            await db.execute(`
                INSERT INTO Votes (IdUser, IdOption, CreatedAt) 
                VALUES (${userId}, ${optionId}, '${now}')
            `);
            console.log(`[VOTE INSERT]: Юзер ${userId} проголосовал за ${optionId}`);
        }

        res.json({ message: "Выбор сохранен!" });
    } catch (err) {
        console.error("ОШИБКА UPDATE VOTE:", err);
        res.status(500).json({ error: "Ошибка БД" });
    }
});



app.get('/api/my-votes/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const votes = await db.query(`SELECT IdOption FROM Votes WHERE IdUser = ${userId}`);
        
        const voteIds = votes.map(v => v.IdOption);
        res.json(voteIds);
    } catch (err) {
        console.error("Ошибка получения голосов:", err);
        res.json([]);
    }
});




app.get('/api/polls-titles', async (req, res) => {
    try {
        const titles = await db.query('SELECT Title FROM [Polls] GROUP BY Title');
        res.json(titles);
    } catch (err) {
        res.status(500).json([]);
    }
});



app.post('/api/full-poll', async (req, res) => {
    const { title, description, question, options, authorId } = req.body;
    try {
        await db.execute(`INSERT INTO [Polls] (Title, [Description], IdAuthor) VALUES ('${title}', '${description}', ${authorId})`);
        
        const lastPoll = await db.query("SELECT TOP 1 IdPoll FROM [Polls] ORDER BY IdPoll DESC");
        const pollId = lastPoll[0].IdPoll;

        await db.execute(`INSERT INTO [Questions] (IdPoll, TextQuestion) VALUES (${pollId}, '${question}')`);
        
        const lastQuest = await db.query("SELECT TOP 1 IdQuestion FROM [Questions] ORDER BY IdQuestion DESC");
        const questionId = lastQuest[0].IdQuestion;

        for (let optText of options) {
            await db.execute(`INSERT INTO [Options] (IdQuestion, TextOption) VALUES (${questionId}, '${optText}')`);
        }
        
        res.json({ message: "Опрос успешно создан и сохранен в Access!" });
    } catch (err) {
        console.error("ОШИБКА КОНСТРУКТОРА:", err.process ? err.process.message : err);
        res.status(500).json({ error: "Ошибка при записи в Access. Проверьте имена полей." });
    }
});




app.get('/api/admin/polls', async (req, res) => {
    try {
        const polls = await db.query('SELECT * FROM [Polls] ORDER BY IdPoll DESC');
        res.json(polls);
    } catch (err) {
        res.status(500).json({ error: "Ошибка загрузки списка опросов" });
    }
});

app.delete('/api/polls/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.execute(`DELETE FROM [Votes] WHERE IdOption IN (SELECT IdOption FROM [Options] WHERE IdQuestion IN (SELECT IdQuestion FROM [Questions] WHERE IdPoll = ${id}))`);
        await db.execute(`DELETE FROM [Options] WHERE IdQuestion IN (SELECT IdQuestion FROM [Questions] WHERE IdPoll = ${id})`);
        await db.execute(`DELETE FROM [Questions] WHERE IdPoll = ${id}`);
        await db.execute(`DELETE FROM [Polls] WHERE IdPoll = ${id}`);
        
        res.json({ message: "Опрос полностью удален" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении опроса" });
    }
});


app.delete('/api/users/:id', async (req, res) => {
    try {
        await db.execute(`DELETE FROM [Users] WHERE IdUser = ${req.params.id}`);
        res.json({ message: "Удалено" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при удалении" });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { username, role } = req.body;
    try {
        await db.execute(`UPDATE [Users] SET Username = '${username}', [Role] = '${role}' WHERE IdUser = ${req.params.id}`);
        res.json({ message: "Обновлено" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при обновлении" });
    }
});