const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'my-super-secret',
    resave: false,
    saveUninitialized: false
}));

// Connect to MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chatapp'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Redirect
app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Register endpoint
app.post('/register', async (req, res) => {
    let { first_name, last_name, email, username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    db.query (
        'INSERT INTO users (first_name, last_name, email, username, password_hash) VALUES (?,?,?,?,?)',
        [first_name, last_name, email, username, hash],
        (err, result) => {
            if (err) {
                console.error('Registration error:', err);
                return res.status(500).json({ message: 'Registration failed. Please refresh and try again.' });
            }
            req.session.userId = result.insertId;
            res.json({ success: true });
        }
    );
});

// Check email
app.get('/check-email', (req, res) => {
    const { email } = req.query;
    db.query('SELECT email FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'SERVER_ERROR' });
        res.json({ available: results.length === 0 });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    let { email, password } = req.body;
    db.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        async (err, results) => {
            if (err) {
                console.log('Login DB error:', err);
                return res.status(500).json({ message: 'Server error. Please refresh and try again.' });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid email' });
            }
            const user = results[0];
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            req.session.userId = user.id;
            res.json({ success: true });
        }
    );
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed.');
        }
        res.redirect('/');
    });
});

// Protected route
app.get('/chat', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(__dirname + '/public/index.html');
});

// Socket .IO events
io.on('connection', socket => {
    console.log('A user connected');

    // Display message
    socket.on('chat message', data => {
        io.emit('chat message', {
            username: data.username,
            message: data.message
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.get('/user', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in'});

    db.query(
        'SELECT username FROM users WHERE id = ?',
        [req.session.userId],
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ error: 'User not found' });
            }
            res.json({ username: results[0].username })
        }
    );
});

app.use(express.static('public'));

http.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});