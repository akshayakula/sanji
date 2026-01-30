# Dashwill

**Snap. Match. Deliver.**

Dashwill is a "donate-by-photo" logistics platform that turns surplus food and supplies into deliveries to nearby shelters, community kitchens, and food banks — in under a minute.

## What It Does

1. A donor snaps a photo of surplus items (extra food, packaged goods, supplies).
2. An AI vision model parses the photo and identifies what's present (e.g., "12 sandwiches, 6 water bottles").
3. The donor confirms their pickup location.
4. The system finds the 5 closest recipient organizations.
5. An AI calling agent contacts each org by phone to confirm they can accept.
6. Once accepted, an Uber-style courier is dispatched to pick up and deliver.

## User Flow (Donor)

```
/ (landing) → /donate (upload photo + address)
            → /donate/review (edit detected items, confirm)
            → /match (watch AI call orgs in real time)
            → /match/result (org accepted, dispatch courier)
            → /track/[id] (live delivery tracking)
```

## How AI Fits In

- **Photo parsing**: A vision model (e.g., GPT-4V, Google Vision) analyzes the uploaded image and returns structured item data — name, quantity, unit, category. The donor can edit results before confirming.
- **Calling agent**: An AI voice agent (e.g., Bland.ai, Retell) calls nearby organizations sequentially to ask if they can accept the specific items. It handles no-answers, declines, and acceptances.

Both are implemented via **Netlify Functions** (serverless); the frontend calls the same `/api/*` URLs, which Netlify rewrites to the functions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Primitives | shadcn/ui |
| Animations | MagicUI (shimmer-button, word-rotate, blur-fade, border-beam, number-ticker, dot-pattern, particles) |
| Motion | Framer Motion |
| Forms | React Hook Form + Zod (ready to wire) |
| Icons | Lucide React |
| APIs | Netlify Functions (serverless) |

## Local Dev Setup

```bash
# Clone and enter
git clone <repo-url>
cd sanji
git checkout frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**API routes** (`/api/*`) are implemented as Netlify Functions. For local API support, run `netlify dev` instead of `npm run dev` so redirects and functions run locally.

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps/Places for address autocomplete | Optional (text input fallback) |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | Optional (defaults to local) |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page (MagicUI hero)
│   ├── layout.tsx                  # Root layout + navbar
│   ├── about/page.tsx              # How it works
│   ├── donate/
│   │   ├── page.tsx                # Photo upload + location
│   │   └── review/page.tsx         # Edit detected items + confirm
│   ├── match/
│   │   ├── page.tsx                # AI calling agent status
│   │   └── result/page.tsx         # Accepted org + dispatch
│   ├── track/[deliveryId]/page.tsx # Live delivery tracking
│   └── api/                        # (empty; APIs are Netlify Functions)
├── components/
│   ├── navbar.tsx
│   └── ui/                         # shadcn/ui + MagicUI components
├── data/
│   ├── sampleOrgs.ts               # 5 sample SF organizations
│   └── sampleItems.ts              # Sample detected items
├── lib/
│   ├── utils.ts                    # shadcn utility (cn)
│   └── donation-store.ts           # Client-side flow state
└── types/
    └── index.ts                    # TypeScript interfaces
```

## API (Netlify Functions)

APIs live in `netlify/functions/` and are exposed at `/api/*` via redirects in `netlify.toml`.

| Route | Method | Returns |
|-------|--------|---------|
| `/api/vision` | POST | Detected items array (name, quantity, unit, category) |
| `/api/orgs` | POST | Nearby food relief orgs (body: `{ lat, lng }`) |
| `/api/agent` | POST | Start VAPI call (body: `phoneNumber`, `orgName`, `itemsSummary`) |
| `/api/agent/[callId]` | GET | Call status / outcome |
| `/api/delivery` | POST | New delivery ID + status |
| `/api/delivery/[id]` | GET | Full delivery object |
| `/api/delivery/parse-confirmation` | POST | Parse Uber confirmation HTML (body: `html`) |
| `/api/local/*` | GET/POST | Proxy to NGROK_URL (local server). All ngrok endpoints: `pickup-dropoff`, `confirm-delivery`, `content`, `health`, `browser`, `navigate`, `click`, `type`, `pickup`, `dropoff`, `screenshot`, `evaluate`, `pages`, `pages/select`, `phone-and-meet`. Frontend calls `/api/local/...` only; NGROK_URL is set server-side. |

## Deployment (Netlify)

The app is configured for Netlify: `netlify.toml` sets the build command, publish directory, and redirects so `/api/*` hits the Netlify Functions. Set environment variables (e.g. `OPENAI_API_KEY`, `VAPI_*`, `NGROK_URL`) in the Netlify dashboard.

## Roadmap

- [ ] Wire real AI vision API (GPT-4V / Google Vision)
- [ ] Integrate Google Maps Places autocomplete for address input
- [ ] Connect AI calling agent (Bland.ai / Retell)
- [ ] Uber Direct API for real courier dispatch
- [ ] Donor authentication and history
- [ ] Recipient organization dashboard
- [ ] Real-time delivery tracking via WebSocket
- [ ] SMS/email notifications
- [ ] Food safety validation layer

## Ethics & Safety

- **Food safety**: The platform is designed for packaged, non-expired items only. Future versions will include expiration validation.
- **Privacy**: No personal data is shared with recipient organizations without donor consent.
- **Verified recipients**: All organizations in the system are intended to be verified community partners (shelters, food banks, community kitchens).
- **Accessibility**: The UI is designed mobile-first and aims to be accessible to all donors regardless of technical ability.
- **No waste**: The calling agent ensures items go only where they're needed and wanted — reducing secondary waste.

## What to Replace with Real Backend

| Current (Mock) | Replace With |
|----------------|-------------|
| `/api/vision` | Real vision AI endpoint |
| `/api/orgs` | Backend geo-query for nearby orgs |
| `/api/agent` | AI calling agent service |
| `/api/delivery` | Uber Direct API |
| `donation-store.ts` | State management + backend persistence |
| Text address input | Google Places Autocomplete |
