const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("database.db");

// Generate a random password
function generatePassword(length = 12) {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
}

// Create the users table if it doesn't exist
db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`,
    (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
            process.exit(1);
        }
    }
);

// Insert Admin user
async function createAdminUser() {
    const username = "Admin";
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, hashedPassword],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    console.log("Admin user already exists.");
                } else {
                    console.error("Database error:", err.message);
                }
            } else {
                console.log(`User created:\nUsername: ${username}\nPassword: ${password}`);
            }
            db.close();
        }
    );
}

createAdminUser();
