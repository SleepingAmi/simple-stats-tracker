const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const db = new sqlite3.Database('./database.db');

const initializeDatabase = () => {
    db.serialize(() => {
        // Create Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        // Create stats table
        db.run(`
            CREATE TABLE IF NOT EXISTS stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                title TEXT NOT NULL,
                number INTEGER NOT NULL
            )
        `);

        console.log('Database initialized with required tables.');
    });
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Session configuration
app.use(session({
    secret: 'sha256_checksum',          // Don't use a SHA-256 checksum for a session key...
    resave: true,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
        secure: false,                  // Set to true if you use a valid SSL certificate for HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,    // 24 hours
        path: '/',
        sameSite: 'lax'                 // Added for security
    },
    rolling: true                       // Refresh session with each request
}));
// Static files and views
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Stats Index
app.get('/', async (req, res) => {
    try {
        db.all('SELECT * FROM stats ORDER BY id DESC', (err, statistics) => {
            if(err) {
                console.error(err);
                res.render('pages/index', {
                    stats: null
                })
            }

            if (statistics) {
                res.render('pages/index', {
                    stats: statistics
                })
            }
        })
    } catch (error) {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.render('pages/login')
});

app.get('/dashboard', (req, res) => {
    if(!req.session.user?.id) {
        res.status(400).redirect('/login');
    }

    try {
        db.all('SELECT * FROM stats ORDER BY id DESC', (err, statistics) => {
            if(err) {
                console.error(err);
                res.render('pages/dashboard', {
                    stats: null
                });
            }

            if (statistics) {
                res.render('pages/dashboard', {
                    stats: statistics
                })
            }
        })
    } catch (error) {
        res.redirect('/login');
    }
})

// Start server
const PORT = 5555;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    initializeDatabase(); // Initialize the database when the server starts
});