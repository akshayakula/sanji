# Sanji local server

Node server that runs on your Mac and uses Playwright to control a browser. Expose it with ngrok so remote clients can drive the browser (e.g. `willing-accurately-albacore.ngrok-free.app`).

## Control your browser

**Recommended:** Run `npm start` — it launches Chrome with remote debugging and starts the server, so the server controls that Chrome. If Chrome is already open, quit it first (Cmd+Q), then run `npm start`.

**Manual:** To use Chrome you started yourself with the debug port, run the server with:
```bash
CDP_ENDPOINT=http://127.0.0.1:9222 npm run start:server
```

Use **GET `/pages`** to list tabs and **POST `/pages/select`** with `{ "index": 0 }` to switch which tab is controlled.

---

To control **your existing Chrome** manually (legacy steps):

1. **Quit Chrome completely** (so it’s not running).

2. **Start Chrome with remote debugging:**
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
   ```
   Or: `open -a "Google Chrome" --args --remote-debugging-port=9222`

3. **Set the CDP endpoint and start the server:**
   ```bash
   CDP_ENDPOINT=http://localhost:9222 npm start
   ```
   Or add `CDP_ENDPOINT=http://localhost:9222` to your `.env` and load it when you run (e.g. with `dotenv`).

The server will attach to that Chrome. Use **GET `/pages`** to list tabs and **POST `/pages/select`** with `{ "index": 0 }` to switch which tab is controlled.

## Setup

```bash
cd local-server
npm install
npx playwright install chromium
```

## Run

```bash
npm start
```

This **launches Chrome** with remote debugging (port 9222) and then starts the server on port 8080, so the server attaches to that Chrome. If Chrome is already open, quit it first (Cmd+Q), then run `npm start` so the launched instance has the debug port.

To start only the server (e.g. you already have Chrome open with the debug port):

```bash
CDP_ENDPOINT=http://127.0.0.1:9222 npm run start:server
```

**Development (nodemon):** Auto-restarts on file changes and connects to existing Chrome on port 9222 if one is running:

```bash
npm run dev
```

Start Chrome with `--remote-debugging-port=9222` first, then run `npm run dev`; the server will attach to that Chrome and restart when you edit `server.js` or `start.js`.

Server listens on **port 8080** (`http://localhost:8080`). Configured via `PORT` in `.env` (default 8080). Point ngrok at that port:

```bash
ngrok http 8080
```

If you use the same ngrok subdomain every time (e.g. willing-accurately-albacore), configure it in the ngrok dashboard or config.

## API

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/browser` | — | Check if browser is connected (`connected`, `url`, `title`) |
| POST | `/navigate` | `{ "url": "https://..." }` | Open URL in the controlled browser |
| POST | `/click` | `{ "selector": "button#submit" }` | Click element (CSS selector) |
| POST | `/type` | `{ "selector": "#input", "text": "hello" }` | Fill input |
| POST | `/pickup` | `{ "address": "..." }` (optional, default test address) | Uber: fill pickup, then Enter |
| POST | `/dropoff` | `{ "address": "..." }` (optional, default test address) | Uber: fill dropoff, then Enter |
| POST | `/pickup-dropoff` | `{ "pickup": "...", "dropoff": "..." }` (optional) | Uber: fill both, then Enter each |
| POST | `/confirm-delivery` | — | Uber: click Courier option in product selector |
| POST | `/phone-and-meet` | `{ "phone": "5713869946" }` (optional) | Uber: fill phone (no country code), then click Meet at door |
| GET | `/screenshot` | — | PNG screenshot of current page |
| GET | `/content` | — | Current page HTML |
| POST | `/evaluate` | `{ "expression": "document.title" }` | Run JS in page, returns result |
| GET | `/pages` | — | List tabs (index, url, title). Use when connected over CDP. |
| POST | `/pages/select` | `{ "index": 0 }` | Switch which tab is controlled (CDP only). |

All POST bodies are JSON. The browser launches (headed) on the first request that needs it, unless `CDP_ENDPOINT` is set (then it connects to your existing Chrome).
