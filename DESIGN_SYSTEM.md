# Dashwill Design System

## Brand
- **Name**: Dashwill
- **Taglines**:
  - "Snap. Match. Deliver."
  - "Donate by photo. Delivered fast."
  - "Surplus to service in minutes."

## Colors

### Primary Palette (Teal Gradient)
| Token | Value | Usage |
|-------|-------|-------|
| `--teal-50` | `#F0FDFA` | Light backgrounds, hover states |
| `--teal-100` | `#CCFBF1` | Card highlights, badge backgrounds |
| `--teal-200` | `#99F6E4` | Borders, subtle accents |
| `--teal-300` | `#5EEAD4` | Secondary elements |
| `--teal-400` | `#2DD4BF` | Icons, interactive elements |
| `--teal-500` | `#14B8A6` | Primary brand color |
| `--teal-600` | `#0D9488` | Primary buttons, CTAs |
| `--teal-700` | `#0F766E` | Hover states for buttons |
| `--teal-800` | `#115E59` | Dark accents |

### Gradient Definitions
| Name | CSS | Usage |
|------|-----|-------|
| Hero gradient | `linear-gradient(135deg, #0D9488 0%, #14B8A6 40%, #5EEAD4 100%)` | Hero background blobs |
| Button gradient | `linear-gradient(135deg, #0D9488 0%, #0FA68C 100%)` | Primary CTA buttons |
| Card glow | `radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)` | Card hover effects |
| Soft bg | `linear-gradient(180deg, #F0FDFA 0%, #FFFFFF 100%)` | Page section backgrounds |

### Neutrals
| Token | Value | Usage |
|-------|-------|-------|
| `--gray-50` | `#FAFAFA` | Page background |
| `--gray-100` | `#F5F5F5` | Card backgrounds |
| `--gray-200` | `#E5E5E5` | Borders |
| `--gray-400` | `#A3A3A3` | Muted text |
| `--gray-600` | `#525252` | Secondary text |
| `--gray-900` | `#171717` | Primary text, headings |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| Success | `#10B981` | Accepted, delivered states |
| Warning | `#F59E0B` | No answer, pending states |
| Error | `#EF4444` | Declined, error states |

## Typography

### Font
- **Primary**: `Geist` (via next/font/google) — clean, modern sans-serif
- **Mono**: `Geist Mono` — for IDs, codes
- **Fallback**: system-ui, -apple-system, sans-serif

### Scale
| Name | Size | Weight | Usage |
|------|------|--------|-------|
| Display | 48-64px | 700 (Bold) | Hero headline |
| H1 | 36-40px | 700 (Bold) | Page titles |
| H2 | 28-32px | 600 (Semibold) | Section titles |
| H3 | 20-24px | 600 (Semibold) | Card titles |
| Body | 16px | 400 (Regular) | Body text |
| Body Small | 14px | 400 (Regular) | Secondary text |
| Caption | 12px | 500 (Medium) | Labels, badges |

### Letter Spacing
- Display/H1: `-0.025em` (tight)
- H2/H3: `-0.015em`
- Body: `0`

## Spacing & Layout

### Container
- Max width: `1200px` (landing), `720px` (flow pages)
- Padding: `16px` mobile, `24px` tablet, `32px` desktop

### Card System
- Border radius: `16px` (large cards), `12px` (standard), `8px` (small/badges)
- Shadow (default): `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Shadow (hover): `0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)`
- Shadow (elevated): `0 20px 40px rgba(0,0,0,0.1)`
- Border: `1px solid rgba(0,0,0,0.06)`

### Spacing Scale
- `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`

## Components

### Buttons
- **Primary**: Teal gradient, white text, 48px height, `border-radius: 24px` (pill), soft shadow
- **Secondary**: White background, teal border, teal text, 40px height
- **Ghost**: No background, teal text
- **Hover**: Slight scale (1.02) + deeper shadow
- **Active**: Scale down (0.98)

### Cards
- White background, `border-radius: 16px`, soft shadow
- On hover: shadow deepens, subtle translateY(-2px)
- Active/selected: teal border-left or teal accent ring

### Badges
- Pill shape (`border-radius: 999px`)
- Teal bg for active, gray for inactive
- Small: `height: 24px`, Caption text

### Icons
- Lucide React
- Size: 20px standard, 16px small, 24px large
- Color: teal-500 for brand, gray-400 for muted

## Motion & Animation

### Libraries
- **Framer Motion**: Page transitions, layout animations
- **MagicUI**: Hero effects (shimmer-button, word-rotate, blur-fade, border-beam, number-ticker, dot-pattern, particles, marquee, animated-gradient-text, ripple)

### Principles
- Entrance: `blur-fade` with staggered delays (0.05s increment)
- Hover: `scale(1.02)` + shadow transition, 200ms ease
- State changes: 300ms ease-out
- Page transitions: fade + slide-up, 250ms
- Progress/status: smooth color transitions, 500ms

### Specific Animations
- Hero gradient blob: slow float/pulse (8s cycle)
- Stats numbers: `NumberTicker` on scroll into view
- CTA buttons: `ShimmerButton` subtle shimmer
- Org cards during calling: pulse ring animation
- Delivery progress: step-by-step reveal with spring physics

## Design Patterns (from Mockups)

### Hero Section
- Large bold headline, accent word in teal gradient
- Subtitle in gray-600
- Floating phone mockup (rotated slightly) with app screenshot
- Background: soft teal gradient blob (top-right), flowing curve
- CTA: pill-shaped gradient button with arrow

### Donate Page
- Split layout on desktop: left = item detection list, right = photo preview
- Photo area has subtle border-beam animation
- Items list: icon + name + quantity, editable
- Location bar at bottom with pin icon + distance badge

### Match Page
- Map visualization at top (teal-tinted)
- Org list below with status indicators
- Active calling org has pulsing teal ring
- Status labels: "Calling...", "No Answer", "Declined", checkmark for accepted

### Match Result
- Top: gradient teal-to-white overlay with map/delivery image
- "Match Found!" with org details
- Delivery info card
- "Track Order" CTA

### Tracking
- Vertical stepper with teal dots
- Active step has ring + pulse
- Driver card with avatar placeholder
- Route visualization (pickup dot → dashed line → dropoff pin)

## File Structure
```
src/
├── app/globals.css          # CSS variables, base styles, gradient definitions
├── components/ui/           # shadcn/ui + MagicUI primitives
├── components/              # App-specific components (navbar, etc.)
├── lib/utils.ts             # cn() utility
```

## Dependencies
| Package | Purpose |
|---------|---------|
| `tailwindcss` v4 | Utility-first CSS |
| `shadcn/ui` | Accessible UI primitives |
| `magicui` | Delightful animations (via shadcn registry) |
| `framer-motion` | Physics-based animations |
| `lucide-react` | Icon library |
| `react-hook-form` | Form management |
| `zod` | Schema validation |
