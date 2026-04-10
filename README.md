# Grain Muse — Frontend Web Application

> Artisan instant fried rice & herbal teas · Craft food brand website

A production-grade React + Vite frontend for **Grain Muse**, a Sri Lankan craft food company. Built with a scalable component architecture, CSS Modules, React Router v6, and Framer Motion page transitions.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:5173
```

---

## 🏗️ Build for Production

```bash
npm run build       # Outputs to /dist
npm run preview     # Preview production build locally
```

---

## 📁 Project Structure

```
grainmuse/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/                # Shared domain components
│   │   │   ├── Marquee.jsx        # Animated ticker strip
│   │   │   ├── ProductCard.jsx    # Product card (compact)
│   │   │   └── ProductCard.module.css
│   │   ├── layout/                # App shell
│   │   │   ├── Navbar.jsx         # Fixed nav with mobile drawer
│   │   │   ├── Navbar.module.css
│   │   │   ├── Footer.jsx
│   │   │   ├── Footer.module.css
│   │   │   ├── PageLayout.jsx     # Wraps all pages
│   │   │   └── PageLayout.module.css
│   │   └── ui/                    # Generic reusable UI
│   │       ├── SectionHeader.jsx
│   │       ├── SectionHeader.module.css
│   │       ├── PageHero.jsx       # Inner page hero banner
│   │       ├── PageHero.module.css
│   │       ├── AnimatedCounter.jsx
│   │       └── AnimatedCounter.module.css
│   ├── data/
│   │   └── index.js               # All content: products, nav, company info
│   ├── hooks/
│   │   ├── useScrollReveal.js     # IntersectionObserver reveal
│   │   └── useNavScroll.js        # Navbar scroll state
│   ├── pages/
│   │   ├── Home.jsx               # Landing page
│   │   ├── Home.module.css
│   │   ├── Products.jsx           # Full product catalogue
│   │   ├── Products.module.css
│   │   ├── About.jsx              # Brand story + process
│   │   ├── About.module.css
│   │   ├── Contact.jsx            # Contact form + FAQ
│   │   ├── Contact.module.css
│   │   ├── NotFound.jsx           # 404 page
│   │   └── NotFound.module.css
│   ├── styles/
│   │   ├── globals.css            # Design tokens + base reset
│   │   └── components.css        # Global component utility classes
│   ├── App.jsx                    # Router + page transitions
│   └── main.jsx                   # React DOM entry point
├── index.html
├── vite.config.js
├── package.json
└── .eslintrc.cjs
```

---

## 🎨 Design System

### Color Tokens (CSS Variables)
| Token | Value | Usage |
|-------|-------|-------|
| `--gm-cream` | `#FAF4EA` | Page background |
| `--gm-gold` | `#BF9A56` | Primary accent |
| `--gm-amber` | `#D4A843` | Highlights & CTA |
| `--gm-deep` | `#2C1A10` | Dark sections, text |
| `--gm-earth` | `#7A5235` | Body text muted |
| `--gm-moss` | `#4E6040` | Herb / nature accent |

### Typography
- **Display**: `Cormorant Garamond` — elegant, editorial serif
- **Body**: `Outfit` — clean, modern geometric sans
- **Scale**: `display-xl`, `display-lg`, `display-md`, `display-sm`, `body-lg`, `body-sm`

### Component Utilities (globals)
- `.btn`, `.btn-primary`, `.btn-gold`, `.btn-outline`, `.btn-ghost` — button variants
- `.tag`, `.tag-dark`, `.tag-filled` — chip/badge styles
- `.section-eyebrow` — small uppercase label with gold line
- `.sr`, `.sr-delay-1` … `.sr-delay-5` — scroll reveal classes
- `.container`, `.section-pad` — layout helpers

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI library |
| `react-router-dom` v6 | Client-side routing |
| `framer-motion` | Page transition animations |
| `lucide-react` | Icon library |
| `vite` | Build tool + dev server |

---

## 🔧 Adding New Products

Edit `src/data/index.js` — add a new object to the `PRODUCTS` array:

```js
{
  id:       'rice-04',
  category: PRODUCT_CATEGORIES.RICE,   // or PRODUCT_CATEGORIES.TEA
  slug:     'my-new-product',
  icon:     '🍜',
  color:    '#8B4513',                  // accent color for card
  name:     'My New Product',
  subtitle: 'Variant Description',
  tagline:  'Short punchy tagline',
  desc:     'Short description shown on cards...',
  longDesc: 'Full detail shown when expanded...',
  tags:       ['Tag1', 'Tag2', 'Tag3'],
  highlights: ['Key point 1', 'Key point 2'],
  nutrition:  { servingSize: '90g', calories: 320, protein: '7g', carbs: '65g', fat: '4g', fibre: '2g' },
  badge:    'New',   // or null
}
```

The product will automatically appear on the Products page, the Home page preview, and the Footer links.

---

## 🚢 Deployment

This is a pure static SPA. Deploy to any static host:

**Netlify:**
```bash
npm run build
# Drag /dist to Netlify, or connect your Git repo
# Add _redirects: /* /index.html 200
```

**Vercel:**
```bash
# Connect GitHub repo, set Framework = Vite
# Vercel auto-configures SPA routing
```

**Manual (nginx):**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## ♿ Accessibility

- Semantic HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`)
- Skip-to-main-content via `id="main-content"` on `<main>`
- `aria-label` on all icon-only buttons
- `aria-expanded` on accordion FAQ and mobile menu
- `role="tablist"` + `aria-selected` on product filter tabs
- `aria-pressed` on filter buttons
- Focus-visible ring on all interactive elements
- Colour contrast ≥ 4.5:1 for all text

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| `> 1024px` | Full two-column layouts |
| `768–1024px` | Single column, stacked |
| `< 768px` | Mobile-optimised, hamburger nav |

---

*Grain Muse · Crafted with intention · Made in Sri Lanka 🇱🇰*
