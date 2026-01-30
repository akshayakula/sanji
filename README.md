# PantryRun

**Donate by photo. Delivered fast.**

PantryRun is a "donate-by-photo" logistics platform that turns surplus food and supplies into deliveries to nearby shelters, community kitchens, and food banks — in under a minute.

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

Both are currently mocked with realistic responses via Next.js Route Handlers.

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
| APIs | Mocked via Next.js Route Handlers |

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
│   └── api/
│       ├── vision/route.ts         # POST - AI photo parsing
│       ├── orgs/route.ts           # POST - Nearby orgs
│       ├── agent/route.ts          # POST - AI calling agent
│       └── delivery/
│           ├── route.ts            # POST - Create delivery
│           └── [id]/route.ts       # GET  - Delivery status
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

## Mock API Routes

| Route | Method | Returns |
|-------|--------|---------|
| `/api/vision` | POST | Detected items array (5 items with name, quantity, unit, category) |
| `/api/orgs` | POST | 5 nearby organizations with distance, type, hours |
| `/api/agent` | POST | Call result per org: `accepted`, `declined`, or `no_answer` |
| `/api/delivery` | POST | New delivery ID + status |
| `/api/delivery/[id]` | GET | Full delivery object with driver, route, items |

All mock routes include realistic delays (800ms-2000ms) to simulate real API behavior.

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in the Vercel dashboard. The app works out of the box with mocked APIs — no backend required.

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
