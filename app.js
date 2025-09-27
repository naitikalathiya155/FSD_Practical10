// app.js
const express = require('express');
const logsRouter = require('./routes/logs');
const path = require('path');

const app = express();

// simple logger for dev (uncomment if you install morgan)
// const morgan = require('morgan');
// app.use(morgan('tiny'));

// serve a small homepage linking to /logs (optional)
app.get('/', (req, res) => {
  res.type('html').send(`
  <h2>Logs Viewer</h2>
  <p>Visit <code>/logs/your-log-file.txt</code> to view a log file.</p>
  <p>Example: <a href="/logs/example.txt">/logs/example.txt</a></p>
  `);
});

// mount logs route
app.use('/logs', logsRouter);

// 404 handler (JSON)
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;