// server.mjs — zero-dependency static + API server for the hello-htmx lessons.
// Goal: serve the numbered lesson pages as static files, and implement the
//       small HTML-fragment API each lesson's hx-get/hx-post calls hit.
// Run:  node server.mjs   (or: make dev / npm start)
// Open: http://localhost:3000/

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, normalize } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ?? 3000;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

// in-memory state for the polling and notification demos
let statusTick = 0;
let notifCount = 0;

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// --- API route handlers, each returns an HTML fragment (never JSON) ---

const routes = {
  'GET /api/greet': () => {
    const now = new Date().toLocaleTimeString();
    return `<p>Hello, htmx! (fetched at ${now})</p>`;
  },

  'GET /api/card': () => {
    const now = new Date().toLocaleTimeString();
    return `
      <div class="card" id="refresh-card">
        <p>This card was replaced entirely at ${now}.</p>
        <button hx-get="/api/card" hx-target="#refresh-card" hx-swap="outerHTML">
          Replace this whole card
        </button>
      </div>`;
  },

  'GET /api/log-entry': () => {
    const now = new Date().toLocaleTimeString();
    return `<li>Log entry at ${now}</li>`;
  },

  'GET /api/search': (_req, url) => {
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const catalog = ['Arduino Uno', 'Raspberry Pi 5', 'ESP32 DevKit', 'HC-SR04 sensor', 'DC gear motor', 'L298N motor driver', 'Mecanum wheel'];
    if (!q) return `<p>Type to search&hellip;</p>`;
    const matches = catalog.filter((item) => item.toLowerCase().includes(q));
    if (matches.length === 0) return `<p>No matches for "${escapeHtml(q)}".</p>`;
    return `<ul>${matches.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  },

  'GET /api/slow': async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `<p>Slow data arrived at ${new Date().toLocaleTimeString()}.</p>`;
  },

  'GET /api/status': () => {
    statusTick += 1;
    return `<p>Poll #${statusTick} &mdash; server time ${new Date().toLocaleTimeString()}</p>`;
  },

  'POST /api/subscribe': async (req) => {
    const body = await readBody(req);
    const params = new URLSearchParams(body);
    const name = (params.get('name') ?? '').trim();
    const email = (params.get('email') ?? '').trim();

    const errors = {};
    if (!name) errors.name = 'Name is required.';
    if (!email.includes('@')) errors.email = 'Enter a valid email.';

    if (Object.keys(errors).length > 0) {
      return `
        <form id="subscribe-form" hx-post="/api/subscribe" hx-target="#subscribe-form" hx-swap="outerHTML">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" value="${escapeHtml(name)}" />
          ${errors.name ? `<p class="error">${errors.name}</p>` : ''}

          <label for="email">Email</label>
          <input type="text" id="email" name="email" value="${escapeHtml(email)}" />
          ${errors.email ? `<p class="error">${errors.email}</p>` : ''}

          <button type="submit">Subscribe</button>
        </form>`;
    }

    return `
      <div id="subscribe-form">
        <p class="success">Thanks, ${escapeHtml(name)} &mdash; ${escapeHtml(email)} is subscribed.</p>
      </div>`;
  },

  'POST /api/notify': () => {
    notifCount += 1;
    const now = new Date().toLocaleTimeString();
    return `
      <li>Notification received at ${now}</li>
      <span id="notif-count" hx-swap-oob="true">${notifCount} unread</span>`;
  },
};

async function serveStatic(res, pathname) {
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(__dirname, safePath === '/' ? 'index.html' : safePath);
  try {
    const data = await readFile(filePath);
    const type = CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch {
    sendHtml(res, 404, '<h1>404 Not Found</h1>');
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const routeKey = `${req.method} ${url.pathname}`;

  if (routes[routeKey]) {
    try {
      const html = await routes[routeKey](req, url);
      sendHtml(res, 200, html);
    } catch (err) {
      sendHtml(res, 500, `<p class="error">Server error: ${escapeHtml(err.message)}</p>`);
    }
    return;
  }

  if (req.method === 'GET') {
    await serveStatic(res, url.pathname);
    return;
  }

  sendHtml(res, 404, '<h1>404 Not Found</h1>');
});

server.listen(PORT, () => {
  console.log(`hello-htmx server running at http://localhost:${PORT}/`);
});
