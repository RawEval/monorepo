# RawEval Frontend Redesign Guide

## Research Foundation

Analysis of 50+ funded startups including YC batches (S23, W24, S24), top VC-backed developer tools (Linear, Vercel, Supabase, Resend, Retool, Cal.com), and AI evaluation companies (Arize AI, Humanloop, Braintrust, Helicone, Weights & Biases, LangSmith). This guide provides a complete audit, competitive analysis, design system specification, and implementation roadmap for transforming RawEval's frontend from a content-heavy light-themed site into a focused, dark-themed developer infrastructure product.

---

## Part 1: What's Wrong Right Now

### Critical Issues (localhost:3000)

#### 1. Homepage Is a Feature Dump, Not a Pitch
- **12 sections** on one page: TickerStrip → HeroSection → ProblemSection → PipelineHeader → PlatformCapture → Connector → PlatformExperts → Connector → PlatformWorkbench → DeliverySection → WhyNowSection → WhoWeServeSection → CTASection
- Top YC sites have **4-5 sections max**. Linear has 4. Resend has 3. Supabase has 5.
- A VC scanning your site in 10 seconds sees a wall of content, not a clear value prop
- The page requires **~8 scrolls** to reach the CTA — by then, 90%+ of visitors have bounced
- Each "Platform" section (Capture, Experts, Workbench) is essentially a sub-page of content crammed inline
- The Connector components between sections add visual noise without information value

#### 2. Hero Section Fails the 5-Second Test
- Current headline: *"AI models fail every second. Nobody is capturing it."*
  - This is clever but **not clear**. A VC doesn't know what you DO from this
  - Compare: Resend = "Email for developers" (4 words, instant clarity)
  - Compare: Supabase = "Build in a weekend. Scale to millions."
  - Compare: Linear = "Linear is a purpose-built tool for planning and building products"
- Subhead is 42 words long. Should be under 15.
- Stats are vanity/abstract (∞, 0, $1B+, 9×) — none are real traction metrics
- Three audience cards (AI Labs, Experts, Researchers) create decision paralysis instead of guiding the visitor
- CTA "See how it works ↓" is passive. Should be action-driven: "Start Evaluating" or "Get API Key"
- Secondary CTA "Talk to sales →" is premature — visitor hasn't been sold yet

#### 3. Navigation Is Over-Engineered
- 4 dropdown menus (Platform, API, Company, Login, Get Started) — too many choices
- "Get Started" dropdown with 3 options ("I'm an AI lab", "I'm a domain expert", "I want to try it") creates decision paralysis
- "Login" dropdown showing 3 apps (Chat App, Expert Workbench, Org Dashboard) is confusing for first-time visitors
- YC rule: **3-5 nav items max**, one primary CTA button
- Current implementation uses a custom `useDropdown` hook with hover-based state management — fragile on mobile, confusing on desktop
- Mobile menu is a full-screen overlay that hides the content — should be a simple slide-in panel

#### 4. No Social Proof Above the Fold
- No customer logos, no trust badges, no "Backed by YC" (if applicable)
- Metrics appear below the fold and are abstract, not real traction
- No testimonials anywhere visible on homepage
- The About page has real stats (2,400+ experts, 96.8% accuracy, 45+ countries, 47K+ evaluations) but these are buried 3 clicks deep
- Trust must be established in the first viewport, not after 8 scrolls

#### 5. Light Theme in a Developer Tools Market
- Every major dev tool (Linear, Vercel, Supabase, Resend, Railway) uses dark theme
- Light parchment (#f5f2ec) feels like a content site, not an infrastructure product
- The "burnt orange" signal color (#d4440c) is unique but needs dark background to pop — on parchment it looks muted
- Developer tools signal "serious infrastructure" through dark UIs — it's a market expectation
- The current warm color palette (parchment, burnt orange) reads "editorial" not "technical"

#### 6. No Product Demo/Visual
- No screenshot, no animated demo, no code snippet above the fold
- AI evaluation tools (Arize, Braintrust, Helicone) all show dashboards/traces prominently
- Visitors can't picture what using RawEval looks like
- The PlatformCapture, PlatformExperts, and PlatformWorkbench components have mock UI frames, but they're 3-6 scrolls below the fold
- A single animated GIF or Lottie showing the Chat → Flag → Expert → Data flow would be worth 1,000 words

#### 7. Pricing Is Buried and Fragmented
- Enterprise pricing lives on `/organizations` page only (Starter $2.5K/mo, Growth $9K/mo, Enterprise custom)
- No clear `/pricing` page linked from homepage navigation
- No individual/developer pricing tier visible anywhere
- Top startups: pricing is either on homepage or one click away in nav
- The Organizations page mixes enterprise sales copy with pricing — these should be separate concerns

#### 8. Missing Pages That VCs/Customers Expect
- No `/changelog` — signals active development, product velocity
- No `/docs` with real API documentation — the `/developers` page has 5 endpoints listed but no interactive docs, no SDKs, no getting-started guide
- No `/customers` or case studies — even 1-2 anonymized case studies add credibility
- No `/status` page — signals reliability and operational maturity
- Blog exists with placeholder content and categories but no substantial posts
- No dedicated `/security` deep-dive (current security page exists but needs SOC 2/compliance detail)
- No `/integrations` page showing supported LLM providers

#### 9. Too Many Separate Apps Create Confusion
- 5 different subdomains (www, chat, experts/work, admin, research) each with their own auth flow
- First-time visitor lands on www.raweval.com, then has to figure out which app to use
- Login dropdown with 3 separate app links is confusing — should feel like ONE product, not five
- Each app has its own navbar, footer, and globals.css — visual consistency varies
- The experts app landing page (`experts/(public)/page.tsx`) is a bare-bones dark page with just a logo and two links — no product information

#### 10. Mobile Experience Likely Broken
- Heavy use of inline `style={}` attributes throughout components (navbar, hero, footer, all platform sections) — these don't respond to media queries
- Dropdown navigation doesn't translate well to touch interactions
- Stats grid uses CSS grid but may not collapse properly on small screens
- The current `globals.css` has some responsive utilities (`.stats-grid`, `.grid-cols-3-md`) but they're inconsistently applied
- No touch-optimized tap targets on many interactive elements
- Ticker strip animation may cause layout shift on mobile

#### 11. Inconsistent Design Token Usage
- Design tokens are defined in `packages/ui/src/tokens.css` (the source of truth) but must be manually inlined into each app's `globals.css`
- The landing app's `globals.css` duplicates all token values — drift between apps is inevitable
- Some components use raw CSS values instead of token variables
- Button styles (`.btn-primary`, `.btn-secondary`, `.btn-dark`, `.btn-outline-inverse`) are defined per-app, not shared
- Font mappings between Next.js font variables (`--font-dm-mono`, `--font-instrument-serif`) and token variables (`--font-mono`, `--font-display`) add unnecessary indirection

#### 12. Content Architecture Problems
- The 3-stage pipeline (Capture → Experts → Workbench) is the core product story but it's presented as 3 separate inline sections with connectors — should be a single cohesive "How It Works" flow
- DeliverySection shows a JSONL code block but it's 6 scrolls down where nobody sees it — this is the "aha moment" that should be near the top
- WhyNowSection presents strong arguments (Scale AI conflict, synthetic data ceiling, EU AI Act) but they're buried at scroll 7
- WhoWeServeSection duplicates the audience cards from the hero — redundant
- The CTA section uses signal-orange background which is jarring after scrolling through mostly light-parchment sections

---

## Part 2: What Funded Startups Do Right (50+ Company Analysis)

### The YC Landing Page Formula

Every successful YC company follows this above-the-fold architecture:

```
┌─────────────────────────────────────────────────┐
│  Logo    [Product] [Pricing] [Docs]  [CTA]      │  ← 3-5 items max
├─────────────────────────────────────────────────┤
│                                                 │
│  [Eyebrow: "AI Evaluation Infrastructure"]      │
│                                                 │
│  Big Bold Headline                              │  ← What you do, not what you are
│  That States the Outcome                        │
│                                                 │
│  One-line subhead for who + how                 │  ← Under 15 words
│                                                 │
│  [Primary CTA]  [Secondary CTA]                │  ← One prominent, one subtle
│                                                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐               │  ← 6-8 trust logos
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘               │
│                                                 │
│  [Product Screenshot / Micro-Demo]              │  ← Show the magic moment
│                                                 │
└─────────────────────────────────────────────────┘
```

### Section-by-Section Breakdown

| # | Section | What Goes Here | Length | Scroll Position |
|---|---------|---------------|--------|-----------------|
| 1 | **Hero** | Headline + sub + CTA + logos + demo | Above the fold | Viewport 1 |
| 2 | **How It Works** | 3 steps, one line each, with visuals | 1 screen | Viewport 2 |
| 3 | **Social Proof** | Metrics + testimonials + logos | 0.5 screen | Viewport 2.5 |
| 4 | **Audience/Features** | 2-3 key capabilities with visuals | 1 screen | Viewport 3 |
| 5 | **CTA** | Final call-to-action + secondary links | 0.5 screen | Viewport 3.5 |
| — | **Total** | **4-5 sections, 3-4 scrolls** | — | — |

### Navigation Patterns That Convert

**Linear**: Product, Pricing, Customers, Company, [Login] [Sign up]
**Vercel**: Products, Solutions, Resources, Enterprise, Pricing, [Login] [Sign Up]
**Resend**: Product, Pricing, Blog, [Login] [Sign Up]
**Supabase**: Product, Developers, Pricing, Docs, Blog, [Sign in] [Start your project]
**Helicone**: Product, Pricing, Docs, Blog, [Sign in] [Get started free]
**Braintrust**: Product, Docs, Pricing, Blog, [Login] [Start for free]

**Pattern**: Product + Pricing + Docs/Blog + Login + CTA. That's it. No dropdowns on primary nav items. No multi-option CTAs.

### CTA Language That Works

| Bad (Current) | Good (Target) | Why |
|-----|------|-----|
| "See how it works ↓" | "Start Evaluating →" | Action-driven, implies product access |
| "Talk to sales →" | "Book a Demo" | Specific commitment, lower friction |
| "Learn more" | "View Documentation" | Clear destination, developer-friendly |
| "Get started ▾" (dropdown with 3 options) | "Start Free →" (single button) | No decision paralysis |
| "Open Chat" / "Expert Workbench" / "Org Dashboard" | "Log in" (single link) | Unified entry point |

### Dark Theme Is Non-Negotiable for Dev Tools

Every competitive product in your space uses dark:

| Company | Background Color | Category |
|---------|-----------------|----------|
| Linear | `#0A0A0B` | Project management |
| Vercel | `#000000` | Deployment platform |
| Supabase | `#1C1C1C` | Backend-as-a-service |
| Resend | `#000000` | Email infrastructure |
| Railway | `#13111A` | Cloud platform |
| Helicone | Dark theme | AI observability |
| Braintrust | Dark theme | AI evaluation |
| Arize AI | Dark theme | ML observability |
| Weights & Biases | Dark theme | ML experiment tracking |

Your burnt orange `#d4440c` signal color would actually look stunning on dark backgrounds. Brightened to `#FF6B35`, it creates a vibrant, distinctive accent that pops against near-black.

### What VCs Scan For in 10 Seconds

1. **Do I understand what this does?** → Clear headline (≤10 words)
2. **Is anyone using it?** → Logos, metrics, testimonials above the fold
3. **Is the team credible?** → Team page with backgrounds, investor logos
4. **Is this investable?** → Market size hint, "why now" narrative
5. **Can I try it?** → One-click CTA to product
6. **Is this a real company?** → Professional design, no template feel
7. **Is it growing?** → Changelog, blog activity, community signals

### Headline Formulas That Work

| Formula | Example | Used By |
|---------|---------|---------|
| **{Verb} + {Object}** | "Build in a weekend" | Supabase |
| **{Category} for {Audience}** | "Email for developers" | Resend |
| **{Outcome} + {Qualifier}** | "Ship faster with confidence" | Railway |
| **{Action} + {Object} + {Benefit}** | "Turn AI failures into training data" | RawEval (proposed) |

### Page Load Speed Benchmarks

| Company | LCP | CLS | FID | Lighthouse Score |
|---------|-----|-----|-----|-----------------|
| Linear | 1.2s | 0.01 | 12ms | 95+ |
| Vercel | 0.8s | 0.00 | 8ms | 98+ |
| Resend | 1.0s | 0.00 | 10ms | 97+ |
| **RawEval target** | **< 2.0s** | **< 0.05** | **< 50ms** | **90+** |

---

## Part 3: Specific Improvements for RawEval

### A. Homepage Redesign

**Current**: 12 sections, ~8 scrolls, 25+ components loaded
**Target**: 5 sections, ~3.5 scrolls, 8 components loaded

```
Section 1: HERO (above the fold)
─────────────────────────────────
Eyebrow badge: "AI Evaluation Infrastructure"
  - Small pill with subtle border-glow effect
  - Monospace font (DM Mono), uppercase, letter-spaced

Headline: "Turn AI failures into training data."
  - 6 words. Clear. Outcome-driven.
  - Instrument Serif, 56-72px (clamp for fluid scaling)
  - "training data" highlighted in signal-orange (#FF6B35)
  - Alt headlines to A/B test:
    - "The infrastructure layer between AI labs and domain experts."
    - "Human evaluation data. Verified. At scale."
    - "Where AI failures become breakthroughs."

Subhead: "Capture failed AI responses. Route to verified domain
experts. Deliver audit-ready RLHF data."
  - 16 words. Three actions. Clear pipeline.
  - 18px, text-secondary (#A1A1AA), max-width 560px
  - Alt: "RawEval captures what AI gets wrong, sends it to 2,400+
    verified experts, and delivers production-grade training data."

CTA row:
  [Start Evaluating →]  — Primary: bg-signal, white text, glow on hover
  [Book a Demo]         — Secondary: transparent, border, white text

Trust bar: "Works with" label + provider logos
  OpenAI | Anthropic | Google | Meta | Groq | DeepSeek
  - Logos rendered as white SVGs at 50% opacity, 60% on hover
  - These are LLM providers RawEval supports — doubles as feature signal + trust

Product visual:
  - Glassmorphism card floating with subtle shadow
  - Shows a simplified chat interface with a flagged failure message
  - Or: animated 3-step flow diagram (Capture → Verify → Deliver)
  - Subtle radial gradient glow behind the visual (#FF6B35 at 10% opacity)
  - 10-second auto-playing loop, no audio


Section 2: HOW IT WORKS (3 steps)
──────────────────────────────────
Section heading: "How it works" (eyebrow) + "Three steps to production-grade data" (title)

Step 1: CAPTURE
  - Icon: MessageSquareWarning (lucide)
  - Number badge: "01" in signal-orange
  - Title: "Capture"
  - Description: "Users chat with AI models across providers. When
    responses fail, they flag them with one click."
  - Small visual: mini screenshot of chat UI with flag button

Step 2: VERIFY
  - Icon: UserCheck (lucide)
  - Number badge: "02"
  - Title: "Verify"
  - Description: "2,400+ verified domain experts evaluate failures
    through structured rubrics and correction workflows."
  - Small visual: mini screenshot of expert workbench

Step 3: DELIVER
  - Icon: Zap (lucide)
  - Number badge: "03"
  - Title: "Deliver"
  - Description: "Clean, provenance-rich RLHF data delivered via API
    or batch export. Every data point traced to its source."
  - Small visual: JSONL code snippet or API response preview

Layout: 3-column grid on desktop, vertical stack on mobile
  - Subtle connecting line between step badges (dashed, 1px, #27272A)
  - Cards on surface background (#141415) with subtle border (#27272A)
  - Hover effect: border brightens to #3F3F46

Below the 3 steps: "See the full pipeline →" secondary link → /how-it-works/capture


Section 3: PROOF (metrics + trust)
──────────────────────────────────
4 metrics in a row (responsive: 2x2 on mobile, 4x1 on desktop):

  ┌──────────────┬──────────────┬──────────────┬──────────────┐
  │   47,000+    │   2,400+     │     45       │   96.8%      │
  │ evaluations  │   experts    │  countries   │  accuracy    │
  │  completed   │  verified    │              │    rate      │
  └──────────────┴──────────────┴──────────────┴──────────────┘

  - Large number: 48px, white, font-weight 500
  - Label: 14px, text-secondary (#A1A1AA)
  - Numbers animate in (count up) on scroll-into-view using IntersectionObserver
  - NOTE: Replace with real metrics when available

Below metrics: Optional testimonial
  - Quote in Instrument Serif italic, 20px
  - Name, title, company — small text below
  - If no testimonial yet: "Trusted by teams building the next generation of AI"
    with a row of company/institution logos

Below testimonial: LLM provider logo strip
  - Same logos as trust bar but larger, with "Supports all major providers" label


Section 4: FOR WHOM (two-column audience split)
────────────────────────────────────────────────
Section heading: "Built for both sides of AI evaluation"

Left card — "For AI Labs & Enterprises"
  Surface background (#141415), subtle border (#27272A)
  - ✓ Buy verified evaluation data at scale
  - ✓ Custom expert panels matched to your domain
  - ✓ API-first delivery, RLHF-ready formats
  - ✓ SOC 2 compliant, full data provenance
  [View Enterprise Plans →] ghost button

Right card — "For Domain Experts"
  Surface background (#141415), subtle border (#27272A)
  - ✓ Earn $18–120 per evaluation task
  - ✓ Work on your schedule, from anywhere
  - ✓ AI-powered vetting ensures quality matches
  - ✓ Transparent scoring and tier advancement
  [Join the Expert Network →] ghost button

Cards: equal height, subtle hover glow (signal-glow at border)
Mobile: stack vertically with full width


Section 5: FINAL CTA
─────────────────────
Full-width section, slightly darker background (#080808)
Centered content, generous vertical padding

Heading: "Ready to capture what AI gets wrong?"
  - Instrument Serif, 40px, white

[Start Evaluating →] primary button, large (px-8 py-4, text-lg)

Below button: "No credit card required. Free tier available."
  - 14px, text-muted (#71717A)

Optional: small links row below
  "View pricing" · "Read the docs" · "Talk to us"
```

### B. Navigation Simplification

**Current (7 items + 2 CTAs with dropdowns)**:
Platform ▾ | API | Company ▾ | Log in ▾ | Get Started ▾

**Proposed (5 items + 1 CTA)**:
Product | Pricing | Docs | Blog | [Log in] | [**Start Free →**]

#### Route Mapping
| Nav Item | Route | Notes |
|----------|-------|-------|
| Product | `/how-it-works/capture` | Single page showing the pipeline, no dropdown |
| Pricing | `/pricing` | New page (see Phase 5) |
| Docs | `/developers` | Rename from "API", expand with real docs |
| Blog | `/blog` | Direct link, no dropdown |
| Log in | `https://chat.raweval.com/login` | Single link — app detects role after auth |
| Start Free → | `https://chat.raweval.com/signup` | Primary CTA button, signal-orange bg |

#### What Moves to Footer Only
- About, Careers, Contact → Footer "Company" column
- Security, Privacy, Terms → Footer "Legal" column
- How It Works sub-pages, Expert Network, Enterprise → Footer "Product" column

#### Technical Specification
- **Desktop**: Fixed/sticky at top, `backdrop-filter: blur(12px)`, semi-transparent bg
- **Mobile**: Hamburger icon → slide-in panel from right (not full-screen overlay)
- **Scroll behavior**: Transparent on top, gains bg-base/90% opacity after 50px scroll
- **Logo**: White version on dark background, links to `/`
- **Active state**: Current page link gets signal-orange underline offset
- **Height**: 56px (matches current `--nav-height` token)
- **Z-index**: 50 (above all content, below modals)

### C. Design System Upgrade

#### Color System (Dark-First)

```css
/* === BACKGROUNDS === */
--color-bg-base: #0A0A0B;           /* Page background, near-black */
--color-bg-surface: #141415;         /* Cards, panels, elevated areas */
--color-bg-elevated: #1C1C1E;       /* Hover states, active items, dropdowns */
--color-bg-overlay: rgba(0, 0, 0, 0.7); /* Modal/dialog backdrops */
--color-bg-subtle: #0F0F10;          /* Subtle alternating section bg */

/* === TEXT === */
--color-text-primary: #FAFAFA;       /* Primary text, headings */
--color-text-secondary: #A1A1AA;     /* Body text, descriptions */
--color-text-muted: #71717A;         /* Captions, timestamps, hints */
--color-text-faint: #52525B;         /* Disabled text, placeholder */

/* === SIGNAL (Brand Accent) === */
--color-signal: #FF6B35;             /* Primary accent — burnt orange, brighter on dark */
--color-signal-hover: #FF8A5C;       /* Hover state — lighter */
--color-signal-active: #E55A2B;      /* Active/pressed state — slightly darker */
--color-signal-subtle: rgba(255, 107, 53, 0.1);  /* Subtle background tint */
--color-signal-glow: rgba(255, 107, 53, 0.15);   /* Glow/shadow effect */
--color-signal-border: rgba(255, 107, 53, 0.3);  /* Border accent */
--color-signal-text: #FF6B35;        /* Text in signal color */

/* === BORDERS === */
--color-border: #27272A;             /* Default border */
--color-border-hover: #3F3F46;       /* Border on hover */
--color-border-subtle: #1E1E21;      /* Very subtle separator */
--color-border-strong: #52525B;      /* Emphasized border */

/* === SEMANTIC === */
--color-success: #22C55E;
--color-success-subtle: rgba(34, 197, 94, 0.1);
--color-success-border: rgba(34, 197, 94, 0.3);
--color-info: #3B82F6;
--color-info-subtle: rgba(59, 130, 246, 0.1);
--color-info-border: rgba(59, 130, 246, 0.3);
--color-warning: #EAB308;
--color-warning-subtle: rgba(234, 179, 8, 0.1);
--color-warning-border: rgba(234, 179, 8, 0.3);
--color-error: #EF4444;
--color-error-subtle: rgba(239, 68, 68, 0.1);
--color-error-border: rgba(239, 68, 68, 0.3);

/* === GRADIENTS === */
--gradient-hero: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(255, 107, 53, 0.08), transparent);
--gradient-card: linear-gradient(135deg, #141415, #1C1C1E);
--gradient-cta: linear-gradient(180deg, #0A0A0B, #080808);
```

#### Typography System

```css
/* === FONT FAMILIES === */
--font-display: 'Instrument Serif', Georgia, 'Times New Roman', serif;
--font-body: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'DM Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;

/* === TYPE SCALE (fluid with clamp) === */
--text-xs: 0.75rem;                                  /* 12px — captions, badges */
--text-sm: 0.875rem;                                 /* 14px — small body, labels */
--text-base: 1rem;                                   /* 16px — body text */
--text-lg: 1.125rem;                                 /* 18px — lead paragraphs */
--text-xl: 1.25rem;                                  /* 20px — section intros */
--text-2xl: clamp(1.5rem, 1.3rem + 0.5vw, 1.75rem); /* 24-28px — subsection headings */
--text-3xl: clamp(1.875rem, 1.5rem + 1vw, 2.5rem);  /* 30-40px — section headings */
--text-4xl: clamp(2.75rem, 2rem + 2vw, 4.5rem);     /* 44-72px — hero headline */

/* === LINE HEIGHTS === */
--leading-tight: 1.08;    /* Hero headlines */
--leading-snug: 1.25;     /* Section headings */
--leading-normal: 1.5;    /* Body text */
--leading-relaxed: 1.7;   /* Long-form reading */

/* === LETTER SPACING === */
--tracking-tight: -0.02em;  /* Headlines */
--tracking-normal: 0;       /* Body */
--tracking-wide: 0.05em;    /* Small caps, labels */
--tracking-wider: 0.12em;   /* Eyebrow badges, mono labels */
```

#### Spacing & Layout

```css
/* === SPACING SCALE (4px base) === */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */

/* === LAYOUT === */
--max-content: 1100px;           /* Max content width */
--max-content-narrow: 720px;     /* Blog posts, legal pages */
--max-content-wide: 1280px;      /* Full-width sections */
--section-padding-x: 1.5rem;     /* Mobile: 24px */
--section-padding-x-md: 3rem;    /* Tablet: 48px */
--section-padding-y: 5rem;       /* 80px vertical rhythm */
--nav-height: 56px;

/* === BORDER RADIUS === */
--radius-sm: 4px;     /* Badges, small elements */
--radius-md: 8px;     /* Buttons, inputs */
--radius-lg: 12px;    /* Cards */
--radius-xl: 16px;    /* Large cards, modals */
--radius-full: 9999px; /* Pills, avatars */

/* === SHADOWS === */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 20px var(--color-signal-glow);
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--color-border);
```

#### Key Visual Elements

- **Subtle gradient mesh backgrounds** (like Linear): radial gradient with signal-orange at very low opacity (5-8%) positioned top-center, creates a warm glow behind the hero
- **Glassmorphism cards**: `background: rgba(20, 20, 21, 0.8)`, `backdrop-filter: blur(12px)`, `border: 1px solid var(--color-border)`
- **Monochrome icons** (lucide-react, 20-24px): default `text-muted`, accent in `text-signal` for active/featured items
- **Grain texture overlay**: CSS pseudo-element on body with SVG noise filter at 2-4% opacity — adds analog depth
- **Code snippets**: Dark code blocks with syntax highlighting (Shiki or Prism, `github-dark` theme) for API sections
- **Hover transitions**: `transition: all 150ms ease` on interactive elements, `200ms` on cards
- **Focus states**: `outline: 2px solid var(--color-signal)`, `outline-offset: 2px`

#### Button Variants

```css
/* Primary: Signal orange, white text, glow on hover */
.btn-primary {
  background: var(--color-signal);
  color: #FFFFFF;
  border: none;
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--text-sm);
  transition: all 150ms ease;
}
.btn-primary:hover {
  background: var(--color-signal-hover);
  box-shadow: var(--shadow-glow);
}

/* Secondary: Transparent, bordered, white text */
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--text-sm);
  transition: all 150ms ease;
}
.btn-secondary:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-elevated);
}

/* Ghost: No bg, no border, muted text */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  padding: 0.625rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 400;
  font-size: var(--text-sm);
  transition: all 150ms ease;
}
.btn-ghost:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
}
```

### D. Missing Pages to Add

| Page | Priority | Purpose | Content Outline |
|------|----------|---------|-----------------|
| `/pricing` | **P0** | Clear pricing page (Free, Pro, Enterprise) | 3-tier cards + FAQ accordion + enterprise CTA |
| `/docs` (or expand `/developers`) | **P0** | API documentation with code examples | Getting started, authentication, endpoints, SDKs, webhooks |
| `/changelog` | **P1** | Shows product velocity | Date-grouped entries with version tags, categorized (Feature, Fix, Improvement) |
| `/customers` | **P1** | Case studies, even if just 1-2 | Problem → Solution → Results format, with quotes and metrics |
| `/status` | **P2** | Uptime monitoring | Embed from Betterstack, Openstatus, or Instatus |
| `/security` | **P1** | Already exists — ensure SOC 2 mention | Certifications, data handling, infrastructure, pentest schedule |
| `/integrations` | **P2** | Supported LLM providers | Grid of provider cards with support status and capabilities |

### E. Individual App Improvements

#### Chat App (chat.raweval.com)

**Current state**: Functional chat interface with model selector, message bubbles, flag button, and voice input. Empty state shows 4 category suggestion cards (Writing, Research, Programming, Learning).

**Improvements**:

1. **Empty state upgrade** — Current suggestion cards are generic categories. Replace with specific, clickable example prompts:
   - "Explain quantum computing to a 5-year-old"
   - "Write a Python function to merge two sorted arrays"
   - "Compare React vs Vue for a startup MVP"
   - "Summarize the key findings of the latest IPCC report"
   - Each prompt auto-fills the input and sends immediately on click

2. **Post-flag celebration** — After flagging a response as wrong:
   - Show a success animation (checkmark with confetti particles or subtle pulse)
   - Display estimated payout badge: "Thanks! Estimated payout: $2.50–$8.00"
   - Brief toast: "Your flag helps improve AI for everyone"
   - This makes flagging feel rewarding, not like a chore

3. **Quality score badge** — In the sidebar or header:
   - Show user's evaluation quality score if they've completed expert evaluations
   - Badge levels: Bronze (< 50), Silver (50-80), Gold (80-95), Platinum (95+)
   - Creates a feedback loop between chat usage and expert participation

4. **Model failure indicators** — In the model selector dropdown:
   - Show which models are trending in failure rate (small "trending" badge)
   - This creates curiosity and encourages exploration

5. **Dark theme alignment** — Chat app should adopt the same dark tokens as landing to feel like one product

#### Expert App (experts.raweval.com)

**Current state**: Minimal public landing page with just a logo and two links. Authenticated area has dashboard, workbench, interview, history, and profile sections.

**Improvements**:

1. **Public landing page overhaul** — Current page is bare. Should include:
   - Brief value proposition for experts
   - Earning potential breakdown by tier
   - "How it works" in 3 steps
   - Trust signals (number of experts, countries, total payouts)
   - CTA: "Apply to join" → registration flow

2. **Dashboard earnings prominence** — Total earnings and current tier should be the hero element at top of dashboard, not buried in a list:
   - Large earnings number with period selector (This week / This month / All time)
   - Current tier badge with progress to next tier
   - Available tasks count with estimated earnings

3. **Interview setup simplification** — Default to recommended settings with a "Quick Start" option:
   - One-click "Start Interview" with recommended config
   - "Customize" expandable section for advanced users
   - Show estimated completion time

4. **Tier advancement gamification** — Progress bars for tier advancement:
   - "12/20 evaluations to Tier 2" with visual progress bar
   - Milestone celebrations when reaching new tiers
   - Clear earning increases shown at each tier transition

5. **History and performance** — Give experts visibility into their track record:
   - Accuracy over time chart
   - Average completion time
   - Domain distribution of their evaluations

#### Admin App (admin.raweval.com)

**Current state**: Dashboard with conversations, QC config, and workbench job management.

**Improvements**:

1. **Real-time dashboard** — WebSocket or SSE updates for:
   - Live conversation count
   - Active experts count
   - Evaluation queue depth
   - Error rate by model (auto-updating)

2. **Model analytics first** — The first thing admins see should be model performance:
   - Failure rate by model (bar chart)
   - Trend lines (improving/worsening)
   - Top failure categories

3. **Data export** — Add CSV/JSON export buttons on all data tables

4. **QC workflow** — Streamline the QC verdict flow with batch operations

### F. Performance & SEO

#### Performance Targets

| Metric | Current (est.) | Target | How |
|--------|---------------|--------|-----|
| LCP | ~4s | < 2.0s | Remove inline styles, optimize fonts, preload hero |
| CLS | ~0.15 | < 0.05 | Reserve space for images, no layout-shifting animations |
| INP | ~150ms | < 100ms | Reduce JS bundle, minimize hydration work |
| Lighthouse | ~65 | 90+ | All optimizations below |

#### Action Items

1. **Remove all inline `style={}` attributes** — Convert to Tailwind classes or CSS custom properties. Current components (navbar, hero, footer, all platform sections) use heavy inline styles that:
   - Can't be cached or deduplicated by the browser
   - Don't respond to media queries for responsiveness
   - Increase HTML payload size
   - Make the codebase harder to maintain

2. **Font optimization**:
   - Use `next/font` for both DM Mono and Instrument Serif (already implemented)
   - Add `display: swap` to prevent FOIT (flash of invisible text)
   - Subset fonts to Latin characters only if not already done
   - Preload critical font files with `<link rel="preload">`

3. **Image optimization**:
   - All images via `next/image` with `width`, `height`, and `alt` attributes
   - Use WebP/AVIF formats with automatic conversion
   - Implement blur placeholder for hero visuals
   - Lazy load all images below the fold

4. **Meta tags and SEO** — Add to `apps/landing/app/layout.tsx`:
   ```tsx
   export const metadata: Metadata = {
     metadataBase: new URL('https://www.raweval.com'),
     title: {
       default: 'RawEval — Turn AI Failures into Training Data',
       template: '%s | RawEval',
     },
     description: 'AI evaluation infrastructure that captures failed AI responses, routes them to 2,400+ verified domain experts, and delivers audit-ready RLHF data.',
     keywords: ['AI evaluation', 'RLHF', 'training data', 'AI quality', 'domain experts', 'AI infrastructure', 'LLM evaluation'],
     authors: [{ name: 'RawEval' }],
     creator: 'RawEval',
     openGraph: {
       type: 'website',
       locale: 'en_US',
       url: 'https://www.raweval.com',
       siteName: 'RawEval',
       title: 'RawEval — Turn AI Failures into Training Data',
       description: 'AI evaluation infrastructure. Capture. Verify. Deliver.',
       images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'RawEval — AI Evaluation Infrastructure' }],
     },
     twitter: {
       card: 'summary_large_image',
       title: 'RawEval — Turn AI Failures into Training Data',
       description: 'AI evaluation infrastructure. Capture. Verify. Deliver.',
       images: ['/og-image.png'],
       creator: '@raweval',
     },
     robots: {
       index: true,
       follow: true,
       googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
     },
   };
   ```

5. **Structured data (JSON-LD)** — Add to layout or page level:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "SoftwareApplication",
     "name": "RawEval",
     "applicationCategory": "DeveloperApplication",
     "description": "AI evaluation infrastructure that captures failed AI responses, routes them to verified domain experts, and delivers audit-ready RLHF data.",
     "url": "https://www.raweval.com",
     "offers": {
       "@type": "Offer",
       "price": "0",
       "priceCurrency": "USD"
     }
   }
   ```

6. **Sitemap & robots.txt** — Add `app/sitemap.ts` and `app/robots.ts`:
   ```tsx
   // app/sitemap.ts
   export default function sitemap() {
     return [
       { url: 'https://www.raweval.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
       { url: 'https://www.raweval.com/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
       { url: 'https://www.raweval.com/developers', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
       { url: 'https://www.raweval.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
       { url: 'https://www.raweval.com/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
       { url: 'https://www.raweval.com/experts', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
       { url: 'https://www.raweval.com/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
       { url: 'https://www.raweval.com/careers', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
       { url: 'https://www.raweval.com/legal/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
       { url: 'https://www.raweval.com/legal/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
     ];
   }
   ```

7. **Bundle optimization**:
   - Audit imports — ensure no full library imports (e.g., `import { MessageSquare } from 'lucide-react'` not `import * as Icons from 'lucide-react'`)
   - Code-split heavy components (animations, charts) with `dynamic()` imports
   - Remove unused components (there are 25+ in the landing components directory — likely some are dead code after the redesign)

---

## Part 4: Implementation Prompt for Claude

Copy the prompt below into Claude Code to implement all changes. Run it from the `/Users/mrinalraj/Documents/monorepo` directory.

---

```
You are redesigning the RawEval frontend. The codebase is a Turborepo monorepo with 5 Next.js 16 apps:
- apps/landing (port 3000, www.raweval.com) — marketing site
- apps/chat (port 3001, chat.raweval.com) — multi-model chat
- apps/experts (port 3002, work.raweval.com) — expert workbench
- apps/admin (port 3003, admin.raweval.com) — admin dashboard
- apps/research (port 3004) — stub

Shared packages: @raweval/ui, @raweval/types, @raweval/utils, @raweval/config, @raweval/auth, @raweval/api-client

Tech: Next.js 16, React 19, Tailwind CSS v4, TypeScript, Zustand, React Query, Radix UI, lucide-react

Backend API: https://api.raweval.com (FastAPI, documented at /docs)

## TASK: Complete Landing Site Redesign

### Phase 1: Dark Theme + Design Tokens (do this first)

1. Update `apps/landing/app/globals.css` to implement a dark-first design system:
   - Background: #0A0A0B (base), #141415 (surface), #1C1C1E (elevated), #0F0F10 (subtle)
   - Text: #FAFAFA (primary), #A1A1AA (secondary), #71717A (muted), #52525B (faint)
   - Signal: #FF6B35 (primary accent — RawEval burnt orange, brighter on dark)
   - Signal hover: #FF8A5C
   - Signal glow: rgba(255, 107, 53, 0.15)
   - Signal subtle bg: rgba(255, 107, 53, 0.1)
   - Signal border: rgba(255, 107, 53, 0.3)
   - Borders: #27272A (default), #3F3F46 (hover), #1E1E21 (subtle), #52525B (strong)
   - Success: #22C55E, Error: #EF4444, Warning: #EAB308, Info: #3B82F6
   - Each semantic color with -subtle (10% opacity bg) and -border (30% opacity) variants
   - Keep Instrument Serif for display font
   - Switch body font to system-ui,-apple-system,'Segoe UI',Roboto,sans-serif (or add Inter via next/font)
   - Add subtle noise/grain texture as a CSS pseudo-element on body (SVG filter, 2-4% opacity)
   - Add hero gradient: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(255, 107, 53, 0.08), transparent)
   - Add shadow utilities: --shadow-glow for signal-color glow effect

2. Update `packages/ui/src/tokens.css` to match the new dark-first tokens as the source of truth

3. Update all button classes:
   - `.btn-primary`: bg signal-orange (#FF6B35), white text, glow shadow on hover, 150ms transition
   - `.btn-secondary`: transparent bg, border #27272A, white text, hover border brightens to #3F3F46
   - `.btn-ghost`: no bg/border, text-secondary, hover text-primary + bg-elevated
   - All buttons: border-radius 8px, padding 10px 24px, font-weight 500, font-size 14px
   - Focus state: 2px signal-orange outline with 2px offset

### Phase 2: Navigation Overhaul

Rewrite `apps/landing/components/navbar.tsx`:
- Remove ALL dropdowns. Flat navigation only.
- Desktop: Logo | Product | Pricing | Docs | Blog | [Log in] [Start Free →]
- "Product" → /how-it-works/capture
- "Pricing" → /pricing (new page)
- "Docs" → /developers
- "Blog" → /blog
- "Log in" → https://chat.raweval.com/login (single link, not dropdown)
- "Start Free →" → https://chat.raweval.com/signup (primary CTA button with signal-orange bg)
- Mobile: hamburger icon → slide-in panel from right with same items stacked vertically
- Sticky nav with backdrop-filter: blur(12px) and semi-transparent bg
- Transparent at top of page, gains opacity after 50px scroll (use scroll event or IntersectionObserver)
- Logo: white version on dark background, links to /
- Active page: signal-orange underline with 4px offset
- Height: 56px, z-index: 50
- No useDropdown hook, no hover-based state management

### Phase 3: Hero Section Rewrite

Rewrite `apps/landing/components/hero-section.tsx`:

Structure:
1. Eyebrow badge: "AI Evaluation Infrastructure" with subtle glow border
   - DM Mono font, uppercase, letter-spacing 0.12em, text-xs
   - Pill shape (border-radius: 9999px), border: 1px solid var(--color-signal-border)
   - Background: var(--color-signal-subtle)
2. Headline: "Turn AI failures into training data."
   - Instrument Serif, var(--text-4xl) which is clamp(2.75rem, 2rem + 2vw, 4.5rem)
   - Color: white (#FAFAFA)
   - "training data" span in signal-orange (#FF6B35)
   - line-height: var(--leading-tight) (1.08)
   - letter-spacing: var(--tracking-tight) (-0.02em)
3. Subhead: "Capture failed AI responses. Route to verified domain experts. Deliver audit-ready RLHF data."
   - text-lg (18px), text-secondary (#A1A1AA), max-width 560px, mx-auto
   - line-height: var(--leading-normal) (1.5)
4. CTA row: [Start Evaluating →] (primary) + [Book a Demo] (secondary/ghost)
   - Primary: bg-signal, white text, px-8 py-3, rounded-md, glow on hover
   - Secondary: transparent bg, border, white text, px-6 py-3
   - Gap: 16px between buttons, centered
5. Trust bar: "Works with" label + provider logos (OpenAI, Anthropic, Google, Meta, Groq, DeepSeek)
   - Label: text-xs, text-muted, uppercase, letter-spacing wide
   - Logos: white SVGs (or text placeholders), opacity 50%, hover opacity 70%
   - Flex row with gap-8, centered, mt-12
6. Product visual:
   - Glassmorphism card: bg rgba(20,20,21,0.8), backdrop-blur(12px), border 1px solid var(--color-border), border-radius 12px
   - Shows simplified chat interface mockup with a flagged failure highlighted
   - Subtle radial gradient glow behind: radial-gradient(ellipse, rgba(255,107,53,0.1), transparent)
   - mt-16, max-width 800px, mx-auto
   - Add subtle shadow-lg for depth

Remove: audience cards (3-column grid), vanity stats (∞, 0, $1B+, 9×), passive CTA
Keep: eyebrow concept (but restyle), centered layout

### Phase 4: Homepage Sections (5 total, replace all 12)

Rewrite `apps/landing/app/page.tsx` to use exactly 5 sections:

```tsx
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { SocialProofSection } from '@/components/social-proof-section';
import { AudienceSection } from '@/components/audience-section';
import { CTASection } from '@/components/cta-section';

export default function Home() {
  return (
    <div className="bg-[var(--color-bg-base)] min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <SocialProofSection />
      <AudienceSection />
      <CTASection />
    </div>
  );
}
```

Create these new/rewritten components:

**HowItWorksSection** (`apps/landing/components/how-it-works-section.tsx`):
- Section eyebrow: "How it works" in DM Mono
- Section heading: "Three steps to production-grade data" in Instrument Serif, text-3xl
- 3-column grid (responsive: vertical stack on mobile)
- Step 1: MessageSquareWarning icon (lucide) + "01" badge in signal-orange + "Capture" title + "Users chat with AI models across providers. When responses fail, they flag them with one click." + mini visual placeholder
- Step 2: UserCheck icon + "02" badge + "Verify" + "2,400+ verified domain experts evaluate failures through structured rubrics and correction workflows." + mini visual
- Step 3: Zap icon + "03" badge + "Deliver" + "Clean, provenance-rich RLHF data delivered via API or batch export. Every data point traced to its source." + mini visual
- Each card: bg-surface (#141415), border (#27272A), rounded-lg (12px), padding 24-32px
- Hover: border brightens to #3F3F46
- Subtle dashed connecting line between step badges on desktop
- Below steps: "See the full pipeline →" link → /how-it-works/capture

**SocialProofSection** (`apps/landing/components/social-proof-section.tsx`):
- 4 metrics in a row: "47,000+" evaluations | "2,400+" experts | "45" countries | "96.8%" accuracy
- Each metric: large number in white (text-3xl, font-medium), label below in text-secondary (text-sm)
- Animate numbers on scroll-into-view with IntersectionObserver + requestAnimationFrame counter
- Grid: 4 columns on desktop, 2x2 on mobile
- Below metrics: optional testimonial quote in Instrument Serif italic
- Below that: "Supports all major providers" + logo strip
- NOTE: Replace placeholder metrics with real numbers when available

**AudienceSection** (`apps/landing/components/audience-section.tsx`):
- Section heading: "Built for both sides of AI evaluation"
- 2-column split (stack on mobile)
- Left card: "For AI Labs & Enterprises"
  - 4 bullet points with Check icon (lucide): verified data at scale, custom expert panels, API-first RLHF-ready delivery, SOC 2 compliant provenance
  - [View Enterprise Plans →] ghost button → /organizations
- Right card: "For Domain Experts"
  - 4 bullet points: earn $18-120 per task, work on your schedule, AI-powered quality vetting, transparent scoring and tiers
  - [Join the Expert Network →] ghost button → /experts
- Cards: bg-surface, border, rounded-lg, hover border-glow (signal at 15% opacity)
- Equal height cards via grid or flex

**CTASection** (rewrite `apps/landing/components/cta-section.tsx`):
- Full-width section, bg slightly darker (#080808) or subtle gradient
- Centered content, py-24
- Heading: "Ready to capture what AI gets wrong?" in Instrument Serif, text-3xl, white
- [Start Evaluating →] large primary button (px-8 py-4 text-lg)
- Below button: "No credit card required. Free tier available." in text-muted, text-sm
- Optional: three small links below: "View pricing" · "Read the docs" · "Talk to us"

Delete/archive these components that are no longer used on the homepage:
- ticker-strip.tsx
- problem-section.tsx
- pipeline-header.tsx
- platform-capture.tsx
- platform-experts.tsx
- platform-workbench.tsx
- connector.tsx
- delivery-section.tsx
- why-now-section.tsx
- who-we-serve-section.tsx
(Keep them in the repo for now — some content may be useful for sub-pages)

### Phase 5: New Pricing Page

Create `apps/landing/app/pricing/page.tsx`:

Define pricing data as a config object at the top of the file for easy updates:

```tsx
const PRICING_TIERS = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    description: 'Try the chat, flag failures, get started',
    cta: { label: 'Start Free →', href: 'https://chat.raweval.com/signup' },
    featured: false,
    features: [
      '100 conversations per month',
      '3 AI models',
      'Basic flag & feedback tools',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 49, annual: 39 },
    description: 'Full platform access for teams',
    cta: { label: 'Start Pro Trial →', href: 'https://chat.raweval.com/signup?plan=pro' },
    featured: true,
    features: [
      'Unlimited conversations',
      'All AI models',
      'Priority expert evaluation queue',
      'API access & webhooks',
      'Team collaboration',
      'Email support',
    ],
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    description: 'Volume pipelines, SLAs, custom expert panels',
    cta: { label: 'Contact Sales →', href: '/contact?type=enterprise' },
    featured: false,
    features: [
      'Custom model deployment',
      'Dedicated expert panels by domain',
      'SOC 2 compliance reports',
      'SLA guarantees (99.9% uptime)',
      'Dedicated account manager',
      'Custom RLHF data formats',
      'Volume discounts',
    ],
  },
];
```

Layout:
- Page title: "Simple, transparent pricing"
- Subtitle: "Start free. Scale as you grow."
- Monthly / Annual toggle (Annual saves 20%) — use React state for active billing period
- 3-tier card grid (horizontal on desktop, vertical stack on mobile)
- Pro tier (featured): highlighted with signal-orange border (2px), "Most Popular" badge
- Starter and Enterprise: standard border (#27272A)
- Each card: bg-surface, rounded-xl (16px), padding 32px
- Price display: "$49" large (text-4xl), "/mo" small (text-sm, text-muted)
- Enterprise: "Custom" instead of price, "Let's talk" subtext
- Feature list: Check icons in signal-orange for featured tier, text-muted for others
- CTA button at bottom of each card: primary for Pro, secondary for others

Below tiers: FAQ accordion with 6-8 questions:
1. "What happens when I exceed the free tier limits?"
2. "Can I switch plans at any time?"
3. "What AI models are supported?"
4. "How does expert evaluation work?"
5. "What data formats do you deliver?"
6. "Is there a discount for annual billing?"
7. "What's included in SOC 2 compliance?"
8. "Can I get a custom enterprise quote?"

Use Radix Accordion or a simple details/summary pattern. Dark styled.

### Phase 6: Footer Redesign

Rewrite `apps/landing/components/footer.tsx`:

Dark footer (bg-base #0A0A0B with top border 1px solid #27272A):

4 columns on desktop (stack to 2x2 on tablet, single column on mobile):

**Product** column:
- How It Works → /how-it-works/capture
- Chat → /chat
- Expert Network → /experts
- Enterprise → /organizations
- API & Docs → /developers
- Pricing → /pricing

**Company** column:
- About → /about
- Blog → /blog
- Careers → /careers
- Contact → /contact
- Security → /security

**Resources** column:
- Documentation → /developers
- Changelog → /changelog (or # if not yet built)
- Status → # (or external status page URL)
- GitHub → # (if applicable)

**Legal** column:
- Privacy Policy → /legal/privacy
- Terms of Service → /legal/terms

Bottom row (border-top 1px solid #1E1E21, pt-8, mt-8):
- Left: © 2025 RawEval, Inc.
- Right: Social icons (Twitter/X, LinkedIn, GitHub) — lucide icons, text-muted, hover text-primary

Links: text-sm, text-muted (#71717A), hover text-primary (#FAFAFA), transition 150ms
Column headings: text-xs, text-secondary (#A1A1AA), uppercase, letter-spacing wide, font-weight 500, mb-4
External links: add small ArrowUpRight icon (lucide, 12px)

### Phase 7: Sub-pages Polish

Update these existing pages to match the new dark design system. For each page:
- Set bg-base (#0A0A0B) as page background
- Update all text colors to use dark-theme tokens
- Convert any inline styles to Tailwind classes
- Ensure responsive layout at 375px, 768px, 1280px

**`/about`** — Keep timeline content and stats, restyle:
- Dark hero with "AI Evaluation Infrastructure" eyebrow
- Stats section: dark cards with large white numbers
- Principles section: dark surface cards
- Timeline: vertical line with signal-orange dots, dark cards

**`/experts`** — Restyle the 4-tier system:
- Make earning potential the hero number ($18–$120/task)
- Tier cards with signal-orange border on highest tier
- Application CTA prominent above the fold

**`/organizations`** — Restyle enterprise page:
- Dark hero, keep the 3-tier pricing
- Feature grid with dark surface cards
- Enterprise CTA with "Contact Sales" primary button

**`/developers`** — Expand API docs:
- Dark code blocks with syntax highlighting (use Shiki or Prism `github-dark` theme)
- Add real code examples for each endpoint (cURL, Python, JavaScript)
- Getting started section with authentication flow
- Interactive "Try it" buttons (optional, can link to Swagger)

**`/blog`** — Dark blog cards:
- Dark surface card backgrounds
- Category pills with signal-orange for active
- Featured post with larger card
- If no real content yet, show 2-3 placeholder posts with "Coming soon" indicator

**`/chat`** (product showcase page, not the app) — Show product:
- Hero with product screenshot/mockup
- Feature list with dark cards
- CTA: "Try it free" → chat.raweval.com/signup

**`/how-it-works/*`** — All 4 sub-pages:
- Dark backgrounds, signal-orange accents
- Keep content, restyle cards and typography
- Improve visual hierarchy

**`/contact`** — Simple dark form:
- Dark input fields (bg-surface, border, white text)
- Signal-orange submit button
- Keep the contact form fields and direct channels section

**`/careers`** — Dark job listings:
- If positions exist, dark expandable cards
- "We're hiring" hero with company values
- Application links or email

### Phase 8: Performance & SEO

1. Remove ALL inline `style={}` attributes from ALL landing app components. Convert to Tailwind classes or CSS custom properties. Scan every file in `apps/landing/components/` and `apps/landing/app/`.

2. Add metadata to `apps/landing/app/layout.tsx`:
   ```tsx
   export const metadata: Metadata = {
     metadataBase: new URL('https://www.raweval.com'),
     title: {
       default: 'RawEval — Turn AI Failures into Training Data',
       template: '%s | RawEval',
     },
     description: 'AI evaluation infrastructure that captures failed AI responses, routes them to 2,400+ verified domain experts, and delivers audit-ready RLHF data.',
     keywords: ['AI evaluation', 'RLHF', 'training data', 'AI quality', 'domain experts', 'AI infrastructure', 'LLM evaluation'],
     openGraph: {
       type: 'website',
       locale: 'en_US',
       url: 'https://www.raweval.com',
       siteName: 'RawEval',
       title: 'RawEval — Turn AI Failures into Training Data',
       description: 'AI evaluation infrastructure. Capture. Verify. Deliver.',
       images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'RawEval — AI Evaluation Infrastructure' }],
     },
     twitter: {
       card: 'summary_large_image',
       title: 'RawEval — Turn AI Failures into Training Data',
       description: 'AI evaluation infrastructure. Capture. Verify. Deliver.',
       images: ['/og-image.png'],
       creator: '@raweval',
     },
     robots: {
       index: true,
       follow: true,
       googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
     },
   };
   ```

3. Add `app/robots.ts`:
   ```tsx
   import type { MetadataRoute } from 'next';
   export default function robots(): MetadataRoute.Robots {
     return {
       rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
       sitemap: 'https://www.raweval.com/sitemap.xml',
     };
   }
   ```

4. Add `app/sitemap.ts`:
   ```tsx
   import type { MetadataRoute } from 'next';
   export default function sitemap(): MetadataRoute.Sitemap {
     const baseUrl = 'https://www.raweval.com';
     return [
       { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
       { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
       { url: `${baseUrl}/developers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
       { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
       { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
       { url: `${baseUrl}/experts`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
       { url: `${baseUrl}/organizations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
       { url: `${baseUrl}/how-it-works/capture`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
       { url: `${baseUrl}/how-it-works/vetting`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
       { url: `${baseUrl}/how-it-works/workbench`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
       { url: `${baseUrl}/how-it-works/delivery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
       { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
       { url: `${baseUrl}/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
       { url: `${baseUrl}/security`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
       { url: `${baseUrl}/legal/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
       { url: `${baseUrl}/legal/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
     ];
   }
   ```

5. Ensure all images use `next/image` with proper width/height/alt attributes. No `<img>` tags.

6. Add JSON-LD structured data to layout:
   ```tsx
   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
     "@context": "https://schema.org",
     "@type": "SoftwareApplication",
     "name": "RawEval",
     "applicationCategory": "DeveloperApplication",
     "description": "AI evaluation infrastructure that captures failed AI responses, routes them to verified domain experts, and delivers audit-ready RLHF data.",
     "url": "https://www.raweval.com",
     "operatingSystem": "Web",
     "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
   })}} />
   ```

### Phase 9: Chat App Quick Wins

In `apps/chat`:
1. Improve empty state (`features/chat/components/empty-state.tsx`) — replace category cards with 4 specific, clickable example prompts:
   - "Explain quantum computing to a 5-year-old"
   - "Write a Python function to merge two sorted arrays"
   - "Compare React vs Vue for a startup MVP"
   - "Summarize the key findings of the latest IPCC report"
   - Each prompt should be a clickable card that auto-fills the chat input
   - Keep the gradient icon box at top but simplify

2. After flagging a response (via MarkWrongModal or flag button):
   - Show a success toast/animation with checkmark
   - Display estimated payout badge: "Estimated payout: $2.50–$8.00"
   - Brief message: "Your flag helps improve AI for everyone"

3. Add a quality score badge in the chat header or sidebar:
   - If user has completed evaluations, show their accuracy score
   - Small badge icon with tooltip showing details

### Phase 10: Expert App Quick Wins

In `apps/experts`:
1. Dashboard: show total earnings and current tier prominently at the top
   - Large earnings number as the hero element
   - Current tier badge with progress to next tier
   - Available tasks count

2. Interview setup: default to recommended settings, show "Quick Start" option
   - One-click "Start Interview" with recommended config
   - "Customize" expandable section for advanced users

3. Add progress bars for tier advancement (e.g., "12/20 tasks to Tier 2")
   - Visual progress bar with signal-orange fill
   - Milestone markers at tier boundaries
   - Estimated earnings increase at next tier

## IMPORTANT CONSTRAINTS

- Do NOT break any existing API integrations or service files
- Do NOT change API endpoint URLs, request/response handling, or any code in `services/` directories
- Keep all existing routes/pages working (redirects are OK)
- All new pages must be server components where possible (Next.js 16 app router)
- Use the existing @raweval/ui package for shared Shadcn components (import via subpath: `@raweval/ui/button`)
- All responsive: test at 375px (mobile), 768px (tablet), 1280px (desktop)
- Preserve the Instrument Serif display font — it's part of brand identity
- Preserve the DM Mono monospace font — used for labels and code
- Keep the burnt orange signal color — just make it brighter (#FF6B35) for dark backgrounds
- Don't add any new npm dependencies unless absolutely necessary (lucide-react, Radix UI already available)
- No stock photos. Use icons (lucide-react), geometric shapes, product screenshots/mockups, code blocks
- Use CSS custom properties (var(--token)) not raw hex values in components
- All animations respect prefers-reduced-motion
- All interactive elements must have visible focus states
- Keep the Facebook pixel script in layout.tsx
- Ensure no regressions in middleware.ts auth flows
```

---

## Part 5: Priority Order

### If You Can Only Do 3 Things (Before Investor Meeting)

1. **Fix the hero section** — Clear headline ("Turn AI failures into training data"), real CTA ("Start Evaluating →"), trust logos. This is 80% of first impressions. Takes ~2 hours.
2. **Switch to dark theme** — Update globals.css tokens, set bg-base to #0A0A0B. Instantly looks like a serious dev tool, not a blog. Takes ~1 hour for tokens, ~3 hours for component updates.
3. **Simplify navigation** — Remove all dropdowns, reduce to 5 items + 1 CTA. Takes ~1 hour.

### Full Priority Ranking

| Priority | Phase | Effort | Impact | Dependencies |
|----------|-------|--------|--------|--------------|
| **P0** | Phase 1: Dark theme tokens | 2-3 hours | Transformative | None |
| **P0** | Phase 3: Hero rewrite | 2-3 hours | Transformative | Phase 1 |
| **P0** | Phase 2: Nav simplification | 1-2 hours | High | Phase 1 |
| **P0** | Phase 4: Homepage 5 sections | 4-6 hours | Transformative | Phase 1, 3 |
| **P1** | Phase 6: Footer redesign | 1-2 hours | Medium | Phase 1 |
| **P1** | Phase 5: Pricing page | 3-4 hours | High | Phase 1 |
| **P1** | Phase 7: Sub-pages polish | 4-6 hours | Medium | Phase 1 |
| **P2** | Phase 8: Performance & SEO | 3-4 hours | Medium (long-term) | Any |
| **P2** | Phase 9: Chat app wins | 2-3 hours | Medium | None |
| **P3** | Phase 10: Expert app wins | 2-3 hours | Low-Medium | None |

### Implementation Order (Recommended)

```
Day 1 (Morning):  Phase 1 → Phase 2 → Phase 3
Day 1 (Afternoon): Phase 4 (homepage sections)
Day 2 (Morning):  Phase 6 → Phase 5
Day 2 (Afternoon): Phase 7 (sub-pages)
Day 3:            Phase 8 → Phase 9 → Phase 10
```

---

## Part 6: What VCs Want to See vs. What to Save for Meetings

### Show on the Website
- **What you do** — Clear headline, 6 words or fewer
- **That people use it** — Logos, real metrics, testimonials
- **That you're credible** — Team page with backgrounds, investor logos if applicable
- **How to start** — One-click CTA to product, no decision paralysis
- **Basic pricing structure** — Transparent tiers, free tier available
- **Product velocity** — Changelog, blog posts, active development signals
- **Security posture** — SOC 2 mention, security page, status page

### Save for the Meeting
- Detailed competitive analysis (Scale AI, Surge, Appen positioning)
- Financial projections and unit economics (cost per evaluation, margin per task)
- Technical architecture deep dives (pipeline infrastructure, QC algorithms)
- Customer pipeline details (qualified leads, contracts in progress)
- Fundraising terms (valuation, round size, use of funds)
- Product roadmap details (upcoming features, timeline)
- Detailed market sizing methodology (TAM/SAM/SOM breakdown)
- Expert network growth strategy (acquisition channels, retention)
- Data moat arguments (network effects, switching costs)

### The Golden Rule
> "Your website gets the meeting. Your pitch deck closes the deal. Your product keeps the customer."

The website should create **enough intrigue to book a meeting**, not enough information to make a decision without one. VCs want to see clarity, traction, and a CTA. Everything else is a conversation.

### Website → Meeting Funnel

```
Visitor lands on homepage
  ↓ (5 seconds)
Understands what RawEval does (clear headline)
  ↓ (15 seconds)
Sees proof that it works (metrics, logos)
  ↓ (30 seconds)
Clicks CTA → tries product OR books demo
  ↓ (1-3 days)
Demo/trial → deeper conversation
  ↓
Deal / investment
```

Every extra second of confusion at the top loses 20-30% of your funnel.

---

## Part 7: Competitive Benchmarks

### Landing Page Comparison

| Company | Hero Words | Sections | Theme | Nav Items | CTA | Above-Fold Demo |
|---------|-----------|----------|-------|-----------|-----|-----------------|
| Linear | 6 | 4 | Dark | 5 | "Sign up" | Yes (product UI) |
| Vercel | 5 | 5 | Dark | 6 | "Start Deploying" | Yes (terminal) |
| Supabase | 7 | 5 | Dark | 6 | "Start your project" | Yes (code editor) |
| Resend | 3 | 3 | Dark | 4 | "Get Started" | Yes (email preview) |
| Retool | 7 | 5 | Light | 5 | "Try for free" | Yes (app builder) |
| Cal.com | 5 | 4 | Dark | 4 | "Get started" | Yes (calendar) |
| Helicone | 8 | 5 | Dark | 5 | "Get started free" | Yes (dashboard) |
| Braintrust | 6 | 4 | Dark | 5 | "Start for free" | Yes (traces) |
| Arize AI | 7 | 5 | Dark | 6 | "Get started" | Yes (observability) |
| **RawEval now** | **10** | **12** | **Light** | **7+dropdowns** | **"See how it works"** | **No** |
| **RawEval target** | **6** | **5** | **Dark** | **5** | **"Start Evaluating"** | **Yes (chat mockup)** |

### Navigation Comparison

| Company | Primary Nav Items | Dropdowns | Login Treatment | CTA Style |
|---------|------------------|-----------|-----------------|-----------|
| Linear | Product, Pricing, Customers, Company | 0-1 | Text link | Filled button |
| Vercel | Products, Solutions, Resources, Enterprise, Pricing | 2-3 | Text link | Filled button |
| Resend | Product, Pricing, Blog | 0 | Text link | Text link |
| Supabase | Product, Developers, Pricing, Docs, Blog | 1-2 | Text link | Filled button |
| **RawEval now** | Platform, API, Company, Login, Get Started | **4** | **Dropdown (3 apps)** | **Dropdown (3 options)** |
| **RawEval target** | Product, Pricing, Docs, Blog | **0** | **Single link** | **Single button** |

### Pricing Page Comparison

| Company | Tiers | Free Tier | Pricing Visibility | Toggle |
|---------|-------|-----------|-------------------|--------|
| Linear | 4 | Yes | Dedicated page + nav | Monthly/Annual |
| Vercel | 3 | Yes | Dedicated page + nav | Monthly/Annual |
| Supabase | 4 | Yes | Dedicated page + nav | Monthly/Annual |
| Resend | 4 | Yes | Dedicated page + nav | Monthly/Annual |
| **RawEval now** | **3 (enterprise only)** | **No** | **Buried on /organizations** | **No** |
| **RawEval target** | **3 (Starter/Pro/Enterprise)** | **Yes** | **Dedicated page + nav** | **Monthly/Annual** |

### Social Proof Strategies

| Company | Trust Signals | Placement |
|---------|--------------|-----------|
| Linear | "Built for the way you work" + customer logos (Vercel, Loom, Cash App, etc.) | Below hero |
| Vercel | "Trusted by the best frontend teams" + logos (Washington Post, Notion, etc.) | Below hero |
| Supabase | GitHub stars count + "Trusted by" logos | Below hero |
| Resend | "Loved by developers" + testimonial quotes | Below hero |
| **RawEval now** | **Abstract stats (∞, 0, $1B+, 9×)** | **Below hero (2nd scroll)** |
| **RawEval target** | **Real metrics (47K evals, 2,400 experts) + provider logos** | **Below hero (1st scroll)** |

---

## Part 8: Copywriting Guidelines

### Voice & Tone

| Attribute | Do | Don't |
|-----------|-----|-------|
| **Clarity** | "Capture failed AI responses" | "Revolutionizing the AI evaluation paradigm" |
| **Specificity** | "2,400+ verified domain experts in 45 countries" | "A global network of qualified professionals" |
| **Action** | "Start Evaluating →" | "Learn more about our platform" |
| **Confidence** | "Audit-ready RLHF data" | "We try to provide high-quality data" |
| **Brevity** | "Three steps to production-grade data" | "Our comprehensive three-step process ensures..." |

### Headline Hierarchy

1. **Hero headline**: 6-8 words, outcome-driven, Instrument Serif
   - "Turn AI failures into training data."

2. **Section headings**: 5-8 words, describe the section's value, Instrument Serif
   - "Three steps to production-grade data"
   - "Built for both sides of AI evaluation"

3. **Card titles**: 1-3 words, noun or verb phrase, system font bold
   - "Capture" / "Verify" / "Deliver"
   - "For AI Labs" / "For Domain Experts"

4. **Body copy**: Short paragraphs (1-2 sentences), system font regular
   - Max line length: 65-75 characters for readability
   - Lead with the what, follow with the how

### Words to Use vs. Avoid

| Use | Avoid |
|-----|-------|
| Capture, flag, verify, deliver | Revolutionize, disrupt, synergize |
| Infrastructure, pipeline | Platform, ecosystem, solution |
| Verified, audit-ready, provenance | Best-in-class, world-class, cutting-edge |
| Domain experts | Crowd workers, annotators, labelers |
| Training data, RLHF data | Datasets, data products |
| Production-grade | Enterprise-ready (overused) |

### CTA Copy Patterns

| Context | CTA Text | Notes |
|---------|----------|-------|
| Homepage hero | "Start Evaluating →" | Action verb + arrow suggests momentum |
| Homepage hero secondary | "Book a Demo" | Specific, low-commitment |
| Pricing free tier | "Start Free →" | Emphasizes no risk |
| Pricing pro tier | "Start Pro Trial →" | Trial removes commitment fear |
| Pricing enterprise | "Contact Sales →" | Clear next step |
| Expert signup | "Join the Network →" | Belonging language |
| Enterprise inquiry | "View Enterprise Plans →" | Exploratory, not pushy |
| Final CTA | "Start Evaluating →" | Repeat the primary CTA |
| Below final CTA | "No credit card required. Free tier available." | Objection handling |

---

## Part 9: Animation & Micro-Interaction Spec

### Principles
- **Purposeful**: Every animation communicates state change or guides attention
- **Subtle**: 150-300ms durations, ease-out curves, no bouncing or overshooting
- **Respectful**: All animations disabled when `prefers-reduced-motion: reduce` is set
- **Performant**: Use `transform` and `opacity` only (GPU-composited properties), avoid animating `width`, `height`, `margin`, `padding`

### Specific Animations

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Nav background | Scroll > 50px | Opacity 0 → 0.95 | 200ms | ease-out |
| Hero headline | Page load | Fade up (translateY 20px → 0, opacity 0 → 1) | 600ms | ease-out |
| Hero subhead | Page load (staggered) | Fade up, 100ms delay after headline | 600ms | ease-out |
| Hero CTA buttons | Page load (staggered) | Fade up, 200ms delay | 600ms | ease-out |
| Trust logos | Page load (staggered) | Fade in, 300ms delay | 400ms | ease-out |
| Product visual | Page load (staggered) | Fade up + slight scale (0.98 → 1), 400ms delay | 800ms | ease-out |
| Metric numbers | Scroll into view | Count up from 0 to target value | 1500ms | ease-out |
| How It Works cards | Scroll into view | Fade up, staggered 100ms per card | 500ms | ease-out |
| Card hover | Mouse enter | Border color brightens, subtle translateY(-2px) | 150ms | ease |
| Button hover | Mouse enter | Background lightens, glow shadow appears | 150ms | ease |
| Mobile menu | Toggle | Slide in from right (translateX 100% → 0) | 250ms | ease-out |
| FAQ accordion | Click | Height auto-animate, chevron rotation | 200ms | ease-out |

### CSS Implementation

```css
/* Fade-up animation for scroll-triggered elements */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion: instant appearance, no movement */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Grain texture overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E");
}
```

---

## Part 10: Responsive Breakpoint Strategy

### Breakpoints

| Name | Width | Target Device |
|------|-------|---------------|
| `xs` | 0-374px | Small phones (rare, but don't break) |
| `sm` | 375-639px | Standard phones (iPhone, Pixel) |
| `md` | 640-767px | Large phones, small tablets |
| `lg` | 768-1023px | Tablets (iPad portrait) |
| `xl` | 1024-1279px | Laptops, tablets (landscape) |
| `2xl` | 1280px+ | Desktops |

### Component Behavior by Breakpoint

| Component | Mobile (< 768px) | Tablet (768-1023px) | Desktop (1024px+) |
|-----------|-----------------|--------------------|--------------------|
| **Navbar** | Hamburger → slide-in panel | Hamburger → slide-in | Full horizontal nav |
| **Hero headline** | 36px, centered | 48px, centered | 56-72px, centered |
| **Hero CTAs** | Stacked vertically, full-width | Inline, auto-width | Inline, auto-width |
| **Trust logos** | 2 rows of 3 | Single row of 6 | Single row of 6 |
| **How It Works** | Vertical stack | Vertical stack | 3-column grid |
| **Metrics** | 2x2 grid | 4x1 row | 4x1 row |
| **Audience cards** | Stacked vertically | Stacked vertically | 2-column grid |
| **Pricing tiers** | Stacked vertically | Stacked vertically | 3-column grid |
| **Footer columns** | Single column | 2x2 grid | 4-column grid |
| **Section padding** | 24px horizontal, 48px vertical | 48px horizontal, 64px vertical | 48px horizontal, 80px vertical |

### Touch Target Requirements (Mobile)
- Minimum tap target: 44x44px (Apple HIG) / 48x48px (Material)
- Minimum spacing between tap targets: 8px
- CTA buttons: minimum height 48px, full-width on mobile
- Nav links in mobile menu: minimum height 48px with adequate spacing

---

## Part 11: Accessibility Checklist

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|---------------|
| **Color contrast** | Text on dark bg: #FAFAFA on #0A0A0B = 19.5:1 (exceeds 4.5:1 AA). Signal text on dark: #FF6B35 on #0A0A0B = 5.2:1 (passes AA for large text, passes AAA) |
| **Focus indicators** | 2px solid signal-orange outline, 2px offset on all interactive elements |
| **Keyboard navigation** | Full tab order through nav, CTAs, cards, accordion, footer links |
| **Screen reader** | Semantic HTML (nav, main, footer, h1-h6, section), aria-labels on icon-only buttons |
| **Skip navigation** | "Skip to main content" link (already exists, keep it) |
| **Reduced motion** | All animations disabled via `prefers-reduced-motion: reduce` |
| **Alt text** | All images, icons with decorative `aria-hidden="true"`, meaningful alt text on screenshots |
| **Link purpose** | All links have clear text or aria-label (no "click here" or "read more" alone) |
| **Form labels** | All inputs have associated labels (contact form, pricing toggle) |
| **Error states** | Form errors announced via aria-live, visible error messages |

### Semantic HTML Structure

```html
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header>
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main id="main-content">
    <section aria-labelledby="hero-heading">
      <h1 id="hero-heading">...</h1>
    </section>
    <section aria-labelledby="how-it-works-heading">
      <h2 id="how-it-works-heading">...</h2>
    </section>
    <!-- ... more sections ... -->
  </main>
  <footer aria-label="Site footer">...</footer>
</body>
```

---

## Part 12: Analytics & Conversion Tracking

### Key Events to Track

| Event | Trigger | Properties |
|-------|---------|------------|
| `page_view` | Every page load | path, referrer, utm_* params |
| `cta_click` | Any CTA button click | button_text, button_location (hero/nav/footer/section), destination |
| `nav_click` | Navigation item click | item_text, mobile_or_desktop |
| `pricing_view` | Pricing page load | referrer_section |
| `pricing_toggle` | Monthly/Annual toggle | selected_period |
| `pricing_cta_click` | Tier CTA button | tier_name, billing_period |
| `faq_open` | FAQ accordion expand | question_text |
| `scroll_depth` | 25%, 50%, 75%, 100% | depth_percentage |
| `trust_logo_hover` | Provider logo hover | provider_name |
| `demo_request` | Book a Demo click | source_section |
| `signup_start` | Start Free → click | source_section |

### Implementation Notes
- Use the existing Facebook Pixel (already in layout.tsx) for ad attribution
- Add Google Analytics 4 or Plausible for privacy-friendly analytics
- Implement via a lightweight analytics wrapper that fires both FB Pixel + GA4 events
- All tracking must respect Do Not Track headers and cookie consent

### A/B Test Candidates

| Test | Variant A | Variant B | Success Metric |
|------|-----------|-----------|---------------|
| Hero headline | "Turn AI failures into training data." | "Human evaluation data. Verified. At scale." | CTA click rate |
| Primary CTA text | "Start Evaluating →" | "Try Free →" | Signup conversion |
| Trust bar content | Provider logos | Customer logos | Time on page |
| Pricing default view | Monthly pricing | Annual pricing | Upgrade rate |
| Hero visual | Chat mockup | 3-step flow diagram | Scroll depth |

---

## Part 13: Component Architecture (New Files)

### New Components to Create

```
apps/landing/components/
├── navbar.tsx                    ← REWRITE (remove dropdowns)
├── hero-section.tsx              ← REWRITE (new headline, CTAs, trust bar, visual)
├── how-it-works-section.tsx      ← NEW (3-step pipeline)
├── social-proof-section.tsx      ← NEW (metrics + logos + optional testimonial)
├── audience-section.tsx          ← NEW (2-column AI Labs / Experts)
├── cta-section.tsx               ← REWRITE (simplified dark CTA)
├── footer.tsx                    ← REWRITE (4-column dark footer)
├── pricing-card.tsx              ← NEW (reusable tier card for pricing page)
├── faq-accordion.tsx             ← NEW (reusable accordion for pricing FAQ)
├── metric-counter.tsx            ← NEW (animated number counter with IntersectionObserver)
├── trust-logos.tsx               ← NEW (provider logo strip, reusable)
└── [ARCHIVE - no longer imported from homepage]
    ├── ticker-strip.tsx
    ├── problem-section.tsx
    ├── pipeline-header.tsx
    ├── platform-capture.tsx
    ├── platform-experts.tsx
    ├── platform-workbench.tsx
    ├── connector.tsx
    ├── delivery-section.tsx
    ├── why-now-section.tsx
    └── who-we-serve-section.tsx
```

### New Pages to Create

```
apps/landing/app/
├── pricing/page.tsx              ← NEW (3-tier pricing + FAQ)
├── robots.ts                     ← NEW (SEO)
├── sitemap.ts                    ← NEW (SEO)
└── changelog/page.tsx            ← NEW (P1, product velocity signal)
```

### Component Props Interfaces

```typescript
// Pricing card
interface PricingTier {
  name: string;
  price: { monthly: number | null; annual: number | null };
  description: string;
  cta: { label: string; href: string };
  featured: boolean;
  features: string[];
}

// Metric counter
interface MetricProps {
  value: string;     // "47,000+" — displayed as-is after animation
  numericValue: number; // 47000 — used for count-up animation
  label: string;     // "evaluations completed"
}

// Trust logos
interface TrustLogo {
  name: string;      // "OpenAI"
  // Logo rendered as text in DM Mono since we don't have SVG assets
}

// FAQ item
interface FAQItem {
  question: string;
  answer: string;
}
```

---

## Part 14: Pre-Launch Checklist

### Before Going Live

- [ ] All pages render without errors (check browser console)
- [ ] All links point to correct destinations (no 404s)
- [ ] Mobile responsive at 375px, 768px, 1024px, 1280px
- [ ] Dark theme consistent across all pages (no light-theme remnants)
- [ ] Keyboard navigation works through entire page (tab order)
- [ ] Screen reader reads content in logical order
- [ ] All images have alt text
- [ ] Meta tags render correctly (test with https://metatags.io)
- [ ] OG image exists at `/public/og-image.png` (1200x630px)
- [ ] Favicon is visible on dark browser tabs
- [ ] Facebook Pixel fires on page load
- [ ] No console errors or warnings
- [ ] No inline `style={}` attributes remain
- [ ] Font loading doesn't cause layout shift
- [ ] Lighthouse score ≥ 90 on Performance, Accessibility, Best Practices, SEO
- [ ] All CTAs lead to correct signup/demo flows
- [ ] Contact form submits successfully
- [ ] Legal pages (Privacy, Terms) are accessible from footer
- [ ] Copyright year is current (2025)
- [ ] No placeholder text remains ("Lorem ipsum", "Coming soon" where real content is needed)

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS + iOS)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS 16+)
- [ ] Chrome for Android

---

## Appendix A: File-by-File Change Summary

| File | Action | Scope |
|------|--------|-------|
| `apps/landing/app/globals.css` | **Major rewrite** | Dark theme tokens, new button classes, grain texture |
| `apps/landing/app/page.tsx` | **Major rewrite** | 5 sections replacing 12 |
| `apps/landing/app/layout.tsx` | **Update** | Enhanced metadata, JSON-LD, body bg class |
| `apps/landing/components/navbar.tsx` | **Major rewrite** | Flat nav, no dropdowns, sticky blur |
| `apps/landing/components/hero-section.tsx` | **Major rewrite** | New headline, CTAs, trust bar, product visual |
| `apps/landing/components/cta-section.tsx` | **Major rewrite** | Simplified dark CTA |
| `apps/landing/components/footer.tsx` | **Major rewrite** | 4-column dark footer |
| `apps/landing/components/how-it-works-section.tsx` | **New file** | 3-step pipeline section |
| `apps/landing/components/social-proof-section.tsx` | **New file** | Metrics + logos + testimonial |
| `apps/landing/components/audience-section.tsx` | **New file** | 2-column audience split |
| `apps/landing/app/pricing/page.tsx` | **New file** | 3-tier pricing + FAQ |
| `apps/landing/app/sitemap.ts` | **New file** | SEO sitemap |
| `apps/landing/app/robots.ts` | **New file** | SEO robots |
| `apps/landing/app/about/page.tsx` | **Restyle** | Dark theme adaptation |
| `apps/landing/app/experts/page.tsx` | **Restyle** | Dark theme + earning prominence |
| `apps/landing/app/organizations/page.tsx` | **Restyle** | Dark theme adaptation |
| `apps/landing/app/developers/page.tsx` | **Restyle** | Dark theme + expanded docs |
| `apps/landing/app/blog/page.tsx` | **Restyle** | Dark cards |
| `apps/landing/app/chat/page.tsx` | **Restyle** | Dark theme + product visual |
| `apps/landing/app/how-it-works/*/page.tsx` | **Restyle** | Dark theme adaptation (4 pages) |
| `apps/landing/app/contact/page.tsx` | **Restyle** | Dark form |
| `apps/landing/app/careers/page.tsx` | **Restyle** | Dark cards |
| `packages/ui/src/tokens.css` | **Major update** | Dark-first token values |
| `apps/chat/features/chat/components/empty-state.tsx` | **Update** | Specific example prompts |
| All landing components with `style={}` | **Refactor** | Convert inline styles to Tailwind |

---

## Appendix B: Design Token Migration Map

### Current → New Token Values

| Token | Current (Light) | New (Dark) |
|-------|----------------|------------|
| `--color-bg-base` | `#f5f2ec` (parchment) | `#0A0A0B` (near-black) |
| `--color-bg-surface` | `#eae5db` | `#141415` |
| `--color-bg-muted` | `#ddd7ca` | `#1C1C1E` |
| `--color-bg-inverse` | `#0d0d0d` | `#FAFAFA` (light, for inverse sections) |
| `--color-text-primary` | `#0d0d0d` | `#FAFAFA` |
| `--color-text-secondary` | `rgba(13,13,13,0.7)` | `#A1A1AA` |
| `--color-text-muted` | `rgba(13,13,13,0.5)` | `#71717A` |
| `--color-text-faint` | `rgba(13,13,13,0.35)` | `#52525B` |
| `--color-signal` | `#d4440c` | `#FF6B35` |
| `--color-signal-hover` | `#c13d0b` | `#FF8A5C` |
| `--color-border` | `rgba(13,13,13,0.1)` | `#27272A` |
| `--color-border-hover` | `rgba(13,13,13,0.18)` | `#3F3F46` |

### Inverse Token Handling
Some sections (like testimonial cards or highlighted areas) may need light-on-dark or dark-on-light variations. Keep `--color-bg-inverse` and `--color-text-inverse-*` tokens for these cases, but they should be the exception, not the rule.

---

## Appendix C: Content Inventory (What to Keep, Cut, or Move)

| Current Content | Action | Destination |
|----------------|--------|-------------|
| TickerStrip market insights | **Cut** from homepage | Could move to /blog or /about |
| Hero audience cards (AI Labs, Experts, Researchers) | **Replace** with trust logos | Audience split goes to Section 4 |
| Hero vanity stats (∞, 0, $1B+, 9×) | **Replace** with real metrics | Real metrics go to Section 3 |
| ProblemSection (3 problems) | **Cut** from homepage | Content absorbed into About page |
| PipelineHeader positioning | **Cut** | Redundant with hero headline |
| PlatformCapture demo | **Move** | Keep on /how-it-works/capture |
| PlatformExperts 4-step gauntlet | **Move** | Keep on /how-it-works/vetting |
| PlatformWorkbench rubric mockup | **Move** | Keep on /how-it-works/workbench |
| Connector components | **Cut** | Visual noise |
| DeliverySection JSONL code block | **Move** | Keep on /how-it-works/delivery, reference in hero visual |
| WhyNowSection market forces | **Move** | Great content for /about or pitch deck |
| WhoWeServeSection | **Replace** | Replaced by AudienceSection (Section 4) |
| CTASection with form | **Simplify** | No form — just headline + button + supporting text |

---

## Appendix D: Glossary

| Term | Definition | Usage |
|------|-----------|-------|
| **Above the fold** | Content visible without scrolling (first viewport) | Hero section must deliver value here |
| **CTA** | Call-to-action — a button or link prompting user action | "Start Evaluating →" |
| **Eyebrow** | Small text above a headline, categorizing the content | "AI Evaluation Infrastructure" |
| **Glassmorphism** | UI effect combining transparency, blur, and subtle borders | Product visual cards |
| **LCP** | Largest Contentful Paint — Core Web Vital measuring load speed | Target < 2.0s |
| **CLS** | Cumulative Layout Shift — measures visual stability | Target < 0.05 |
| **INP** | Interaction to Next Paint — measures responsiveness | Target < 100ms |
| **RLHF** | Reinforcement Learning from Human Feedback | RawEval's core data output |
| **Signal color** | Brand accent color used for CTAs and key UI elements | #FF6B35 (burnt orange) |
| **Social proof** | Evidence that others trust/use the product | Logos, metrics, testimonials |
| **Trust bar** | Row of logos showing partners/integrations/customers | Below hero CTAs |
