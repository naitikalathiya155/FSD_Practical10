// routes/logs.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Directory where logs are stored — change if needed
const LOGS_DIR = path.resolve(__dirname, '..', 'logs');

// Utility: safely build the path (prevents directory traversal)
function safeJoinLogs(filename) {
  // only allow filenames (no slashes). You can extend with whitelist regex if needed.
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return null;
  }
  return path.join(LOGS_DIR, filename);
}

// GET /logs/:name
router.get('/:name', async (req, res, next) => {
  try {
    const name = req.params.name;
    const safePath = safeJoinLogs(name);
    if (!safePath) {
      return res.status(400).type('text').send('Invalid filename');
    }

    // check file exists and is a file
    fs.stat(safePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') return res.status(404).type('text').send('Log file not found');
        return next(err);
      }
      if (!stats.isFile()) {
        return res.status(400).type('text').send('Not a file');
      }

      // Stream the file — good for large logs
      const stream = fs.createReadStream(safePath, { encoding: 'utf8' });

      // Stream into an HTML page using <pre> so formatting is preserved
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.write(`<html><head><title>${name}</title>
        <style>body{font-family:Inter,Arial,Helvetica,sans-serif;padding:18px;background:#f7f7fb} pre{white-space:pre-wrap;word-wrap:break-word;background:#fff;padding:16px;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,0.06)}</style>
        </head><body><h2>Viewing log: ${name}</h2><pre>`);

      stream.on('data', chunk => {
        // escape HTML special chars to avoid accidental injection
        const escaped = String(chunk)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        res.write(escaped);
      });

      stream.on('end', () => {
        res.write('</pre></body></html>');
        res.end();
      });

      stream.on('error', (streamErr) => {
        next(streamErr);
      });
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
