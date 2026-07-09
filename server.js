const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
app.use(cors());

// 1. SQLITE DATABASE SETUP
const db = new sqlite3.Database('./kirti_kala_kendra.db', (err) => {
    if (err) console.error("Database connection fault: ", err.message);
    else console.log("SQL Database connected! Bappa Morya! 🙏");
});

// Database schema setup
db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    murtiName TEXT,
    murtiSize TEXT,
    totalPrice REAL,
    amountPaid REAL,
    balanceAmount REAL,
    receiptId TEXT,
    date TEXT
)`);

// 2. API ENDPOINTS

// New API: Saari booked murtiyon ki list lene ke liye
app.get('/api/booked-murtis', (req, res) => {
    db.all(`SELECT DISTINCT murtiName FROM bookings`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database read error" });
        }
        // Sirf booked murtiyon ke naam ka array bhejenge
        const bookedNames = rows.map(row => row.murtiName);
        res.json({ success: true, bookedMurtis: bookedNames });
    });
});

// Data Registration Endpoint
app.post('/api/save-booking', (req, res) => {
    try {
        const { customerName, murtiName, murtiSize, totalPrice, amountPaid } = req.body;

        if (!customerName || !amountPaid) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const balanceAmount = totalPrice - amountPaid;
        const receiptId = 'VKK-' + Math.floor(100000 + Math.random() * 900000);
        const currentDate = new Date().toLocaleDateString('en-IN');

        const query = `INSERT INTO bookings (customerName, murtiName, murtiSize, totalPrice, amountPaid, balanceAmount, receiptId, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(query, [customerName, murtiName, murtiSize, totalPrice, amountPaid, balanceAmount, receiptId, currentDate], function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Local DB logging exception" });
            }
            
            res.status(200).json({
                success: true,
                data: { customerName, murtiName, murtiSize, totalPrice, amountPaid, balanceAmount, receiptId, date: currentDate }
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal fatal pipeline execution fail" });
    }
});

const PORT = 5000;
// Database ko poora saaf (clear) karne ke liye endpoint
app.get('/api/clear-all-bookings', (req, res) => {
    db.run(`DELETE FROM bookings`, [], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Clear karne me error aaya!" });
        }
        res.json({ success: true, message: "Bappa! Saari bookings successfully clear ho gayi hain! 🙏" });
    });
});
app.listen(PORT, () => console.log(`Server executing securely on port ${PORT}`));
