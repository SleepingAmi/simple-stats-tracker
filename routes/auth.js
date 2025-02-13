const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./database.db');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        console.log('Login attempt with missing credentials', null);
        return res.redirect('/login');
    }try {
        db.get('SELECT id, username, password FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                console.log('Database error during login', err);
                return res.redirect('/login');
            }

            // User not found
            if (!row) {
                console.log('Login attempt for non-existent user', username);
                return res.redirect('/login');
            }

            // Check password
            try {
                const isPasswordCorrect = await bcrypt.compare(password, row.password);
                if (!isPasswordCorrect) {
                    console.log('Failed login attempt - incorrect password', username);
                    return res.redirect('/login');
                }

                // Login successful
                req.session.user = {
                    id: row.id,
                    username: row.username
                };

                // Save session before redirect
                req.session.save((err) => {
                    if (err) {
                        console.log('Session save error during login', err);
                        return res.redirect('/login');
                    }

                    console.log('Successful login', username);
                    res.redirect(`/dashboard`);
                });
            } catch (bcryptError) {
                console.log('Password comparison error', bcryptError);
                return res.redirect('/login');
            }
        });
    } catch (error) {
        console.log('Unexpected error during login', error);
        return res.redirect('/login');
    }
});

module.exports = router;