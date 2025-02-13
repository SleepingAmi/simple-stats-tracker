const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const db = new sqlite3.Database('./database.db');

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in');
    }
    next();
};

// Add new stat
router.post('/add', requireLogin, async (req, res) => {
    const { title, number } = req.body;
    const sanitizedNumber = Number(number);

    db.run(
        `INSERT INTO stats (title, number) VALUES (?, ?)`, [title, sanitizedNumber], function (err) {
            if (err) return res.status(500).send({"Database error": err});
            res.redirect('/');
        }
    );
});

// Update existing stat
router.post('/update', requireLogin, async (req, res) => {
    const { title, number, statId } = req.body;
    const sanitizedNumber = Number(number);

    db.run('UPDATE stats SET title = ?, number = ? WHERE id = ?', [title, sanitizedNumber, statId],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating stat');
            }
            res.redirect('/');
        }); 
})

module.exports = router;