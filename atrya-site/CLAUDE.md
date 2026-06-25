# Atrya Site — Design System & Engineering Guide

## Project overview

Atrya is Europe's first regulated on-chain FX facility. The site communicates a premium, cutting-edge fintech brand: liquid glass morphism, deep navy/space backgrounds, crisp blue accents, and a "programmable money infrastructure" tone of voice. Every design decision should feel like high-end developer tooling — confident, technical, zero decoration for its own sake.

**Company:** Caplend Technologies GmbH · HRB 185277 Amtsgericht Hamburg  
**Domain:** atrya.io  
**Contact:** hello@atrya.io  
**Stack:** Vanilla HTML/CSS/JS. No framework, no build step. Express static server (`server.js`). Deployed on Railway from `Caplend/atrya-site` GitHub repo (auto-deploy on push to `main`).

---

## File structure

```
atrya-site/
├── index.html           # Landing page
├── agentic.html         # /agentic sub-page — "The Execution Engine for AI Agents"
├── waitlist.html        # Join beta CTA
├── imprint.html         # Legal imprint
├── cookie-policy.html   # Cookie policy
├── assets/
│   ├── atrya-nav.js     # Shared nav component (injected synchronously)
│   └── atrya-footer.js  # Shared footer + cookie banner component
├── server.js            # Express static server (no-cache HTML, 1yr asset cache)
└── package.json
```

---

## Typography

### Fonts
- **Syne** — headlines, logo, nav logo, stat numbers, card titles, section labels
  - Weights loaded: 400, 500, 600
  - Letter-spacing: always negative (`-.02em` to `-.04em`), never default or positive
  - Line-height: tight, `1.06`–`1.15` for display sizes
- **Inter** — body, nav links, meta, descriptions, buttons
  - Weights loaded: 300 (body/descriptions), 400 (data/labels), 500 (UI/buttons)
  - Base body weight: 300 — deliberately lightweight for premium feel
  - Line-height: `1.65`–`1.78` for prose

### Type scale
| Role | Font | Size | Weight | Tracking |
|------|------|------|--------|----------|
| Hero H1 | Syne | `clamp(46px, 5.2vw, 74px)` | 500 | `-.036em` |
| Section H2 | Syne | `clamp(28px, 3.2vw, 48px)` | 500 | `-.03em` |
| Sub-page H1 | Syne | `clamp(34px, 4vw, 54px)` | 500 | `-.035em` |
| Card title (large) | Syne | `19px` | 500 | `-.025em` |
| Card title (small) | Syne | `15–18px` | 500 | `-.02em` |
| Nav logo | Syne | `18px` (sub-pages), `30px` (index) | 500–600 | `-.02em–-.025em` |
| Eyebrow tag | Inter | `11px` | 500 | `.12–.14em` + uppercase |
| Body copy | Inter | `15–16px` | 300 | default |
| Small body | Inter | `13.5px` | 300–400 | default |
| Nav links | Inter | `13.5px` | 400 | default |
| Monospace (log) | `SF Mono`, `Fira Code`, `Fira Mono`, monospace | `11px` | 400 | default |

### Voice and copy rules
- Headlines: statement-first, minimal punctuation, short (≤6 words ideal). Use `<em>` (styled without italic) to accent the key term in `var(--ac)`.
- Sub-copy: 2–4 sentences max. Lead with the problem or the claim. No marketing fluff.
- Eyebrow tags: short all-caps label above section headings (e.g. "The Architecture", "Private Beta"). Always `var(--ac)`.
- Em-dash `—` not hyphen for inline asides.

---

## Colour system

Theme is toggled by `data-theme="light"` on `<html>`. Default is dark. User preference stored in `localStorage` under key `atrya-theme`.

### CSS custom properties

#### Dark mode (`:root`)
```css
--bg:    #04060e          /* page background — near-black navy */
--bg2:   #090d1c          /* slightly lighter surface */
--text:  #e2eaf8          /* primary text — cool white */
--mid:   rgba(226,234,248,.52)   /* secondary text */
--dim:   rgba(226,234,248,.32)   /* tertiary / nav links */
--faint: rgba(226,234,248,.14)   /* ghost text / footer copy */
--line:  rgba(226,234,248,.07)   /* dividers / subtle borders */
--lineb: rgba(226,234,248,.12)   /* slightly bolder borders */
--ac:    #4FA8FF                 /* accent — electric blue */
--acg:   rgba(79,168,255,.07)    /* accent tint background */
--acgl:  rgba(79,168,255,.13)    /* slightly denser accent tint */
/* Logo gradient */
--logo-g1: #c8d8f0
--logo-g2: #8aafdc
--logo-g3: #4a7fbf
/* Glass tokens */
--glass-bg:     linear-gradient(155deg, rgba(10,24,64,.52), rgba(4,8,26,.45))
--glass-border: rgba(226,234,248,.06)
--glass-top:    rgba(79,168,255,.18)
--glass-shadow: 0 1px 0 rgba(255,255,255,.06) inset, 0 0 0 .5px rgba(79,168,255,.06) inset, 0 20px 48px rgba(0,0,0,.38)
```

#### Light mode (`[data-theme="light"]`)
```css
--bg:    #f0f4fc
--bg2:   #e6ecf8
--text:  #0c1628
--mid:   rgba(12,22,40,.54)
--dim:   rgba(12,22,40,.32)
--faint: rgba(12,22,40,.18)
--line:  rgba(12,22,40,.08)
--lineb: rgba(12,22,40,.15)
--ac:    #1a8ee0              /* slightly deeper blue in light */
--acg:   rgba(26,142,224,.08)
--acgl:  rgba(26,142,224,.14)
/* Logo goes monochrome in light */
--logo-g1/g2/g3: #0c1628
/* Glass tokens */
--glass-bg:     rgba(255,255,255,.68)
--glass-border: rgba(12,22,40,.09)
--glass-top:    rgba(26,142,224,.28)
--glass-shadow: 0 1px 0 rgba(255,255,255,.95) inset, 0 12px 36px rgba(12,22,80,.1)
```

### Semantic colour usage rules
- Never hardcode `#4FA8FF` directly — always use `var(--ac)`. This ensures light mode gets `#1a8ee0` automatically.
- Success / live indicator: `rgba(79,230,130,.9)` with `box-shadow: 0 0 8px rgba(79,230,130,.6)` — the green status dot.
- Destructive / warning: no current pattern; if needed, use `rgba(255,100,100,.8)`.
- Avoid pure `#ffffff` text — use `var(--text)` or `rgba(255,255,255,.xx)`.

---

## Glass morphism system

Glassmorphism is the central visual language. Every card, modal, and panel uses it. The system has three tiers:

### Tier 1 — Hero card (strongest)
Hero-level cards that anchor a section. `backdrop-filter: blur(60px) saturate(2.2) brightness(1.04)`. Multi-layer background with offset radial hazes to simulate depth and refraction.

```css
background:
  radial-gradient(ellipse 90% 55% at 20% 0%, rgba(79,168,255,.09) 0%, transparent 55%),
  radial-gradient(ellipse 60% 45% at 85% 100%, rgba(90,55,220,.06) 0%, transparent 50%),
  linear-gradient(145deg, rgba(10,24,64,.74) 0%, rgba(6,14,42,.86) 55%, rgba(4,8,26,.80) 100%);
backdrop-filter: blur(60px) saturate(2.2) brightness(1.04);
box-shadow:
  0 0 0 .5px rgba(255,255,255,.06) inset,
  0 1px 0 rgba(255,255,255,.11) inset,
  0 40px 80px rgba(0,0,0,.55),
  0 0 120px rgba(79,168,255,.08);
```

Always add a **prismatic surface streak** pseudo-element:
```css
::before {
  content: '';
  position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), rgba(120,200,255,.30), rgba(255,255,255,.16), transparent);
}
```

### Tier 2 — Section cards (`.ag-glass`, `.gc`, `.an-box`)
Standard content cards. `backdrop-filter: blur(36–40px) saturate(1.9–2.0)`. Uses `var(--glass-*)` tokens.

```css
background: var(--glass-bg);
backdrop-filter: blur(40px) saturate(1.9);
border: 1px solid var(--glass-border);
border-top: 1px solid var(--glass-top);  /* accent top edge — the signature detail */
box-shadow: var(--glass-shadow);
```

All section cards MUST have a **surface sheen** `::after`:
```css
::after {
  content: '';
  position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(79,168,255,.36), rgba(120,200,255,.20), rgba(79,168,255,.36), transparent);
  opacity: .75;
  transition: opacity .3s;
}
```

Hover: lift 3px (`translateY(-3px)`), increase `border-top-color` opacity, brighten shadow.

### Tier 3 — Compact cards (`.ag-ccard`)
Smaller capability/feature tiles. `backdrop-filter: blur(32px) saturate(1.8)`. Lighter border, smaller shadow.

### Neon glow border (`.ag-shimmer-ring`)
Used on the hero flow card in `/agentic`. A slow breathing box-shadow neon effect — **not** a spinning conic gradient. Animation is `5s ease-in-out infinite`.

```css
@keyframes glowBreathe {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(79,168,255,.22),
      0 0 18px rgba(79,168,255,.28),
      0 0 48px rgba(79,168,255,.16),
      0 0 100px rgba(79,168,255,.08),
      0 36px 80px rgba(0,0,0,.52);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(79,168,255,.38),
      0 0 26px rgba(79,168,255,.44),
      0 0 70px rgba(79,168,255,.26),
      0 0 130px rgba(79,168,255,.13),
      0 36px 80px rgba(0,0,0,.52);
  }
}
```

Light mode gets a separate `glowBreathLight` keyframe with `rgba(26,142,224,...)` values and reduced intensity.

### Pillar left-edge glow
On hover, a 2px gradient stripe appears on the left edge of pillar cards:
```css
::before {
  content: '';
  position: absolute; left: 0; top: 10%; bottom: 10%; width: 2px;
  background: linear-gradient(180deg, transparent, rgba(79,168,255,.55), rgba(140,215,255,.80), rgba(79,168,255,.55), transparent);
  opacity: 0; transition: opacity .35s;
}
:hover::before { opacity: 1; }
```

---

## Animation system

Keep animations slow and intentional. Nothing should feel busy or game-like.

| Animation | Duration | Easing | Purpose |
|-----------|----------|--------|---------|
| `haze1` atmospheric orb | `14s` | `ease-in-out infinite` | Background depth in hero |
| `haze2` atmospheric orb | `18s` | `ease-in-out infinite` | Background depth |
| `glowBreathe` neon border | `5s` | `ease-in-out infinite` | Hero card border glow |
| `pulse` badge dot | `2.6s` | `ease-in-out infinite` | Live status indicator |
| `flowDot` moving dot | `2.4s` | `ease-in-out infinite` | Data flow lines |
| `tick` partner logos | `30s` | `linear infinite` | Scrolling ticker |
| `blink` pill dot | `2.8s` | `ease-in-out infinite` | Status pill |
| `pulse-ring` expand ring | `2.6s` | `ease-out infinite` | Architecture diagram |
| Hover transitions | `0.2–0.35s` | default | All interactive elements |

**Rules:**
- Atmospheric hazes: `translate + scale` only, no opacity flicker.
- Never animate `width`, `height`, or `color` directly on large elements — use `transform` and `opacity`.
- Do not add `will-change` unless element is already animated (only `.hero-panel`, `.feat-panel` have it set).
- Transitions on card hover: `transform .3s, box-shadow .3s, border-color .3s`.

---

## Buttons

Two primary variants, used consistently across all pages:

### `.btn-a` — Primary (solid accent)
```css
background: var(--ac);
color: #fff;           /* dark mode */
color: #020a14;        /* index.html hero context — darker for contrast */
border-radius: 7px;
padding: 13px 26px;
font-size: 14px; font-weight: 500;
box-shadow: 0 0 28px rgba(79,168,255,.22);
/* hover: opacity .87, translateY(-1px), stronger shadow */
```

### `.btn-b` — Secondary (ghost)
```css
border: 1px solid var(--lineb);
color: var(--mid);
border-radius: 7px;
padding: 12px 24px;
font-size: 14px;
/* hover: border-color → var(--ac), color → var(--text), background → var(--acg) */
```

Always pair `.btn-a` and `.btn-b` side by side — primary action left, secondary right.

---

## UI components

### Eyebrow / section tag (`.sh-tag`)
```css
font-size: 11px; font-weight: 500;
letter-spacing: .12–.14em; text-transform: uppercase;
color: var(--ac);
display: inline-block; margin-bottom: 14px;
```
Always placed above the section H2. Never styled as a bordered pill at section level (reserved for hero badges only).

### Hero badge pill
Pill-shaped, used at the top of hero sections:
```css
padding: 5–6px 12–14px; border-radius: 100px;
background: rgba(79,168,255,.09);
border: 1px solid rgba(79,168,255,.2);
font-size: 11px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
color: var(--ac);
```
Includes an animated `pulse` dot.

### Meta label chips (`.gc-meta-label`)
Inline taxonomy labels inside cards:
```css
font-size: 9.5px; font-weight: 600;
letter-spacing: .09em; text-transform: uppercase;
color: rgba(79,168,255,.65);
background: rgba(79,168,255,.08);
border: 1px solid rgba(79,168,255,.14);
padding: 3px 9px; border-radius: 5px;
```

### Tech/API chip (`.an-chip`)
Tiny code-style labels (e.g. "REST", "SDK", "SEPA"):
```css
font-size: 9.5px; font-weight: 500;
letter-spacing: .06em; text-transform: uppercase;
color: rgba(79,168,255,.6);
background: rgba(79,168,255,.05);
border: 1px solid rgba(79,168,255,.11);
padding: 3px 7px; border-radius: 3px;
```

### Icon containers
Icons are always inline SVG (Feather Icons style: `stroke-width: 1.6`, `stroke-linecap: round`, `stroke-linejoin: round`). Never use icon fonts or external icon libraries.

Icon wrapper sizing:
- Large (44–48px): section cards, feature pillars
- Medium (40–42px): problem cards, architecture nodes
- Small (32–36px): capability cards, destination rows

```css
/* standard icon wrapper */
width: 44px; height: 44px; border-radius: 11px;
background: rgba(79,168,255,.08);
border: 1px solid rgba(79,168,255,.16);
display: flex; align-items: center; justify-content: center;
```

---

## Layout & spacing

### Max widths
- Page content max-width: `1120px` (sub-pages) — centered with `margin: 0 auto`
- Index page uses `900px` for the arch diagram, `580px` for CTA copy

### Section padding
- Major sections: `padding: 90–110px 56–64px`
- On mobile (`≤768px`): `padding-left/right: 20px`

### Grid patterns
- 3-column cards: `grid-template-columns: repeat(3, 1fr); gap: 20–24px`
- 2-column hero: `grid-template-columns: 1fr 1fr; gap: 64px`
- Footer: `grid-template-columns: 2fr 1fr 1fr 1.4fr; gap: 40px`
- Stats bar: `grid-template-columns: repeat(4, 1fr)`

### Border dividers
All sections separated by `border-top: 1px solid var(--line)` or `border-bottom: 1px solid var(--line)`. Never use margin-based spacing to separate sections.

---

## Shared components

### Nav (`assets/atrya-nav.js`)
Injected synchronously with `document.currentScript.insertAdjacentHTML('afterend', html)`. Contains:
- SVG gradient `<defs>` for the Atrya logo gradient `#atrya-lg`
- Full nav HTML
- Theme toggle logic (reads `localStorage`, sets `data-theme`, dispatches `themechange` CustomEvent for Three.js)
- Scroll handler (adds `.up` class after 10px scroll)
- Hamburger mobile menu with portal fix (appends `<ul>` to `document.body` on open to escape `backdrop-filter` stacking context)

**Page detection:** `window.location.pathname.includes('agentic')` — used to set correct `href` values (hash-only on home, `index.html#...` on sub-pages) and the `.active` class on the Agentic nav link.

**Do not duplicate nav HTML in page files.** Always use `<script src="assets/atrya-nav.js"></script>` as the first child of `<body>`.

**Current nav links:** Features · Use Cases · Agentic · Vision · About · [Join Beta button]

### Footer (`assets/atrya-footer.js`)
Injected with `document.currentScript.insertAdjacentHTML('beforebegin', html)` — inserts before the script tag. Contains:
- Footer with logo, Product / Company / Get In Touch columns
- Cookie banner with `localStorage` persistence (`atrya-cookies` key)

**Place as the last element in `<body>` before `</body>`.**

### Theme toggle
Managed entirely by `atrya-nav.js`. The `themechange` CustomEvent is dispatched on every toggle and listened to by Three.js in `index.html` to recolour the chain animation. Any new page that has Three.js or canvas animations should listen to this event.

---

## Background atmospherics

Deep sections use layered radial-gradient hazes to create depth without imagery:

```css
background:
  radial-gradient(ellipse 60% 70% at 76% 50%, rgba(18,50,160,.15) 0%, transparent 65%),
  radial-gradient(ellipse 35% 45% at 82% 16%, rgba(79,168,255,.08) 0%, transparent 55%),
  var(--bg);
```

Dot-grid overlay (used in hero, arch section, CTA):
```css
background-image: radial-gradient(circle, rgba(255,255,255,.08) 1px, transparent 1px);
background-size: 38px 38px;
mask-image: radial-gradient(ellipse 85% 85% at 68% 50%, black 15%, transparent 100%);
```
In light mode, dot opacity drops to `.045–.055`.

---

## Responsive breakpoints

| Breakpoint | Changes |
|------------|---------|
| `≤900px` | 3-col grids → 1-col; hero 2-col → 1-col; hide flow card; connector goes vertical |
| `≤800px` | Stats grid → 2-col |
| `≤768px` | Section padding → 20px sides; hamburger shows; `.nav-btn` hidden; nav links go fullscreen overlay |
| `≤480px` | Cap grid → 1-col |

Mobile nav overlay:
```css
position: fixed; top: 62px; left: 0; right: 0; bottom: 0;
background: rgba(4,6,14,.97); backdrop-filter: blur(18px);
```

---

## Page anatomy (sub-pages like `/agentic`)

Every sub-page follows this skeleton:
```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <!-- meta, OG, Twitter card, theme-color, favicons, fonts -->
  <style>
    /* TOKENS */
    /* RESET */
    /* NAV (styles only — HTML injected by atrya-nav.js) */
    /* FOOTER / COOKIE (styles only — HTML injected by atrya-footer.js) */
    /* Page-specific components */
    /* MOBILE */
  </style>
</head>
<body>
<script src="assets/atrya-nav.js"></script>

<!-- sections -->

<script src="assets/atrya-footer.js"></script>
</body>
</html>
```

CSS is inline `<style>` in `<head>` — no external stylesheet. This keeps it zero-dependency and Railway-deployable without a build step.

---

## SEO & meta

Every page must have:
- `<title>` — `{Page Name} — Atrya`
- `<meta name="description">` — 1–2 sentence value prop
- `<link rel="canonical">` — full `https://atrya.io/...` URL
- Open Graph: `og:type`, `og:url`, `og:title`, `og:description`, `og:image` (1200×630 at `https://atrya.io/og-image.png`)
- Twitter Card: `summary_large_image`
- `theme-color` meta for dark and light (dark: `#04060e`, light: `#f0f4fc`)
- `robots: index, follow`

---

## The Atrya logo

SVG path — two chevron/shield forms that together read as a hexagonal double-chevron:
```svg
<path d="M11.9,47 L11.9,33 Q11.9,28 16.2,25.5 L45.7,8.5 Q50,6 54.3,8.5 L83.8,25.5 Q88.1,28 88.1,33 L88.1,47 C74,47 63,22 50,22 C37,22 26,47 11.9,47Z"/>
<path d="M11.9,53 L11.9,67 Q11.9,72 16.2,74.5 L45.7,91.5 Q50,94 54.3,91.5 L83.8,74.5 Q88.1,72 88.1,67 L88.1,53 C74,53 63,78 50,78 C37,78 26,53 11.9,53Z"/>
```

Always `fill="url(#atrya-lg)"` referencing the SVG gradient defined in `atrya-nav.js`. In dark mode it's a cool grey-to-navy gradient; in light mode all three stops are `#0c1628` (flat dark). The wordmark "Atrya" is set in Syne 500.

---

## Code conventions

- **No build system.** No bundler, no transpiler, no PostCSS. Plain `.html`, `.css` inline, vanilla `.js`.
- **CSS is always inline `<style>` in `<head>`.** Do not create external `.css` files.
- **Minified-style CSS** — rules on single lines, compact spacing (matches existing code). No verbose multi-line blocks unless the rule is complex (e.g. multi-layer backgrounds).
- **JavaScript** — ES5-compatible IIFEs in shared components (`atrya-nav.js`, `atrya-footer.js`). Modern JS (let/const/template literals) is fine in page-level scripts.
- **No JS frameworks** — no React, Vue, Alpine. DOM manipulation only when CSS can't do it.
- **SVG icons** — inline only. Feather Icons style: `stroke-width="1.6"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"`.
- **Comments** — CSS section headers use the `/* ─── SECTION NAME ──── */` format with box-drawing characters to match existing style.
- **All links use absolute `https://atrya.io/...` in canonical/OG tags.** Internal navigation uses relative paths (`agentic.html`, `#section-id`).
