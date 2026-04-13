const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");

const __path = process.cwd();
const PORT = process.env.PORT || 8000;

// Max Listeners limit fix
require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware setup (Inhein routes se pehle hona chahiye)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes load karein
// Note: Agar qr.js aur pair.js mein error aaye, toh unhein check karein
let server = require('./qr');
let code = require('./pair');

// API Routes
app.use('/server', server);
app.use('/code', code);

// Frontend Routes
app.get('/pair', async (req, res) => {
    res.sendFile(path.join(__path, 'pair.html'));
});

app.get('/qr', async (req, res) => {
    res.sendFile(path.join(__path, 'qr.html'));
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__path, 'main.html'));
});

// Server Start
app.listen(PORT, () => {
    console.log(`
====================================
  SERVER STARTED SUCCESSFULLY
  Running on: http://localhost:${PORT}
  Don't Forget To Give Star BILAL-MD
====================================
    `);
});

module.exports = app;
