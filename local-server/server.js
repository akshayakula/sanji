const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const CDP_ENDPOINT = process.env.CDP_ENDPOINT; // e.g. http://localhost:9222

let browser = null;
let page = null;

async function ensureBrowser() {
  if (browser && browser.isConnected()) return;
  if (!CDP_ENDPOINT) {
    throw new Error(
      'CDP_ENDPOINT required. Start Chrome with --remote-debugging-port=9222 then run with CDP_ENDPOINT=http://127.0.0.1:9222'
    );
  }
  try {
    browser = await chromium.connectOverCDP(CDP_ENDPOINT);
    const contexts = browser.contexts();
    const context = contexts[0] || await browser.newContext();
    const pages = context.pages();
    page = pages[0] || await context.newPage();
  } catch (err) {
    throw new Error(
      `Could not connect to Chrome at ${CDP_ENDPOINT}. Start Chrome with: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 — ${err.message}`
    );
  }
}

function getPages() {
  if (!browser || !browser.isConnected()) return [];
  const context = browser.contexts()[0];
  return context ? context.pages() : [];
}

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'sanji local server running' });
});

// Browser connection check — curl http://localhost:8080/browser
app.get('/browser', async (req, res) => {
  try {
    const connected = browser != null && browser.isConnected();
    if (!connected) {
      return res.json({ connected: false, message: 'No browser attached' });
    }
    let url = '';
    let title = '';
    if (page && !page.isClosed()) {
      url = page.url();
      title = await page.title();
    }
    res.json({ connected: true, url, title });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// Navigate to URL
app.post('/navigate', async (req, res) => {
  try {
    await ensureBrowser();
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing url in body' });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    res.json({ ok: true, url: page.url() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Click selector
app.post('/click', async (req, res) => {
  try {
    await ensureBrowser();
    const { selector } = req.body;
    if (!selector) return res.status(400).json({ error: 'Missing selector in body' });
    await page.click(selector);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Type into selector
app.post('/type', async (req, res) => {
  try {
    await ensureBrowser();
    const { selector, text } = req.body;
    if (!selector) return res.status(400).json({ error: 'Missing selector in body' });
    await page.fill(selector, text ?? '');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Uber: pickup/dropoff field selectors and test addresses
const PICKUP_SELECTOR = '[data-testid="enhancer-container-pickup"] input[role="combobox"], [data-testid="enhancer-container-pickup"] input';
const DROPOFF_SELECTOR = '[data-testid="enhancer-container-drop0"] input[role="combobox"], [data-testid="enhancer-container-drop0"] input';
const PICKUP_TEST_ADDRESS = '241 18th St S, Arlington, VA';
const DROPOFF_TEST_ADDRESS = '203 S Fillmore St, Arlington, VA';

async function fillAddressAndEnter(selector, address) {
  await page.click(selector, { timeout: 5000 });
  await page.fill(selector, address);
  await page.keyboard.press('Enter');
}

app.post('/pickup', async (req, res) => {
  try {
    await ensureBrowser();
    const address = (req.body && req.body.address) || PICKUP_TEST_ADDRESS;
    await fillAddressAndEnter(PICKUP_SELECTOR, address);
    res.json({ ok: true, address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/dropoff', async (req, res) => {
  try {
    await ensureBrowser();
    const address = (req.body && req.body.address) || DROPOFF_TEST_ADDRESS;
    await fillAddressAndEnter(DROPOFF_SELECTOR, address);
    res.json({ ok: true, address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const SEARCH_BUTTON_SELECTOR = 'button[aria-label="Search"]';

app.post('/pickup-dropoff', async (req, res) => {
  try {
    await ensureBrowser();
    const pickup = (req.body && req.body.pickup) || PICKUP_TEST_ADDRESS;
    const dropoff = (req.body && req.body.dropoff) || DROPOFF_TEST_ADDRESS;
    await fillAddressAndEnter(PICKUP_SELECTOR, pickup);
    await new Promise((r) => setTimeout(r, 800));
    await fillAddressAndEnter(DROPOFF_SELECTOR, dropoff);
    await new Promise((r) => setTimeout(r, 1200));
    await page.click(SEARCH_BUTTON_SELECTOR, { timeout: 10000 });
    res.json({ ok: true, pickup, dropoff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Uber: confirm delivery — click the Courier option in the product selector
const COURIER_OPTION_SELECTOR = 'li[data-testid="product_selector.list_item"]';
app.post('/confirm-delivery', async (req, res) => {
  try {
    await ensureBrowser();
    await page
      .locator(COURIER_OPTION_SELECTOR)
      .filter({ hasText: 'Courier' })
      .first()
      .click({ timeout: 10000 });
    res.json({ ok: true, selected: 'Courier' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Uber: enter user phone, recipient phone, Meet at door, Request delivery, wait 30s, return page info
const PHONE_INPUT_SELECTOR = '[data-baseweb="phone-input"] input, input[aria-label*="phone number"]';
const MEET_AT_DOOR_SELECTOR = 'button[aria-label="Meet at door"]';
const REQUEST_DELIVERY_SELECTOR = 'button:has-text("Request delivery"), [aria-label="Request delivery"]';
const DEFAULT_PHONE = '5713869946'; // +1 571 386 9946
const DEFAULT_RECIPIENT_PHONE = '7039793380'; // +1 703 979 3380
const REQUEST_DELIVERY_WAIT_MS = 30000;

app.post('/phone-and-meet', async (req, res) => {
  try {
    await ensureBrowser();
    const phone = (req.body && req.body.phone) || DEFAULT_PHONE;
    const recipient = (req.body && req.body.recipient) || DEFAULT_RECIPIENT_PHONE;
    const digits = String(phone).replace(/\D/g, '');
    const recipientDigits = String(recipient).replace(/\D/g, '');
    const phoneInputs = page.locator(PHONE_INPUT_SELECTOR);
    await phoneInputs.first().click({ timeout: 5000 });
    await phoneInputs.first().fill(digits);
    await new Promise((r) => setTimeout(r, 300));
    await phoneInputs.nth(1).click({ timeout: 5000 });
    await phoneInputs.nth(1).fill(recipientDigits);
    await new Promise((r) => setTimeout(r, 300));
    await page.click(MEET_AT_DOOR_SELECTOR, { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 500));
    await page.locator(REQUEST_DELIVERY_SELECTOR).first().click({ timeout: 10000 });
    await new Promise((r) => setTimeout(r, REQUEST_DELIVERY_WAIT_MS));
    const url = page.url();
    const title = await page.title();
    const html = await page.content();
    res.json({
      ok: true,
      phone: digits,
      recipient: recipientDigits,
      page: { url, title, html },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Take screenshot
app.get('/screenshot', async (req, res) => {
  try {
    await ensureBrowser();
    const buffer = await page.screenshot({ type: 'png' });
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get page content (HTML)
app.get('/content', async (req, res) => {
  try {
    await ensureBrowser();
    const html = await page.content();
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Evaluate JS in page
app.post('/evaluate', async (req, res) => {
  try {
    await ensureBrowser();
    const { expression } = req.body;
    if (!expression) return res.status(400).json({ error: 'Missing expression in body' });
    const result = await page.evaluate(expression);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List tabs (when connected over CDP)
app.get('/pages', async (req, res) => {
  try {
    await ensureBrowser();
    const pages = getPages();
    const list = await Promise.all(
      pages.map(async (p, i) => ({
        index: i,
        url: p.url(),
        title: await p.title(),
      }))
    );
    res.json({ ok: true, pages: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Switch which tab we control (when connected over CDP)
app.post('/pages/select', async (req, res) => {
  try {
    await ensureBrowser();
    const { index } = req.body;
    const pages = getPages();
    if (index == null || index < 0 || index >= pages.length) {
      return res.status(400).json({ error: 'Invalid index', max: pages.length - 1 });
    }
    page = pages[index];
    res.json({ ok: true, url: page.url() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function main() {
  app.listen(PORT, () => {
    console.log(`Sanji local server running at http://localhost:${PORT}`);
    console.log('Ngrok this port to expose: willing-accurately-albacore.ngrok-free.app');
  });
}

main().catch(console.error);
