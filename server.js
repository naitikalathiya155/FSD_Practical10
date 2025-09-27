const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000; // you can change port if needed

// Path of the log file
const logFile = path.join(__dirname, 'error.log');

// Route for home page
app.get('/', (req, res) => {
    fs.readFile(logFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err.message);
            return res
                .status(500)
                .send('<h1>Unable to read log file.</h1><p>' + err.message + '</p>');
        }

        res.send(`
            <html>
            <head>
                <title>Error Logs</title>
                <style>
                    body { font-family: monospace; background: #f0f0f0; padding: 20px; }
                    pre  { background: #fff; padding: 15px; border: 1px solid #ccc; }
                </style>
            </head>
            <body>
                <h1>Server Error Logs</h1>
                <pre>${data}</pre>
            </body>
            </html>
        `);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Log Viewer running at http://localhost:${PORT}`);
});
