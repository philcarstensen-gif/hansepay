# Atrya Typography

## Brand Fonts

Atrya uses two Google Fonts: **Syne** for headings and the logo wordmark, and **Inter** for all body text, labels, and UI copy.

---

## Import (HTML / CSS)

```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
```

---

## Usage Rules

| Role | Family | Weight | Letter-spacing |
|------|--------|--------|----------------|
| Logo wordmark | Syne | **600** | -0.025em |
| Display / H1 / H2 | Syne | **500** | -0.03em |
| H3 / H4 | Syne | **500** | -0.02em |
| Section labels (uppercase) | Inter | **500** | 0.08em |
| Body text | Inter | **300** | — |
| Small UI / captions | Inter | **300** | 0.02em |
| Inline links / accent labels | Inter | **500** | — |

---

## Key Rules

- **Never use font-weight 700 or "bold"** — the brand aesthetic is deliberately light and refined.
- Syne 600 is reserved **exclusively for the "Atrya" wordmark**.
- All body copy uses Inter 300 (Light) — not the default 400.
- Display headlines use Syne 500 (Medium) with tight negative letter-spacing (-0.03em).
- Uppercase tracking labels use Inter 500 at `letter-spacing: 0.08em` — never all-caps Syne.

---

## Download for Offline / Print Use

Syne: https://fonts.google.com/specimen/Syne  
Inter: https://fonts.google.com/specimen/Inter

Download weights: Syne 400, 500, 600 — Inter 300, 400, 500.

---

## CSS Variables (Reference)

```css
:root {
  --font-heading: 'Syne', sans-serif;
  --font-body:    'Inter', sans-serif;

  /* weights */
  --fw-logo:    600;
  --fw-heading: 500;
  --fw-label:   500;
  --fw-body:    300;
}
```

---

© 2026 Caplend Technologies GmbH
