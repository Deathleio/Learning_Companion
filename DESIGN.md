# 🎨 Design — Learning Companion (AURA)

> Visual & interaction design reference for the frontend. Covers the Landing Page and the
> Glass-Box Dashboard, the design tokens, animations, and component inventory.

---

## 1. Design Overview

Two distinct surfaces share one visual language:

| Surface | File | Mood |
| --- | --- | --- |
| **Landing Page** | `src/components/LandingPage.jsx` | Marketing: hero, feature grid, offering cards, gallery lightbox |
| **Glass-Box Dashboard** | `src/App.jsx` | Telemetry: study deck, practice lab, exam, live "active node" readout |

Both use the **outrun/dark-dashboard** aesthetic: near-black slate background, glass
panels with backdrop blur, colored glow, gradient accents, and subtle float animations
("glowing orbs" in the hero).

---

## 2. Design Tokens

| Token | Value | Where used |
| --- | --- | --- |
| Background | `#020617` (`slate-950`) | Body + all surfaces |
| Panel | `rgba(15,23,42,.65)` + `backdrop-filter: blur(12px)` | `.glass-panel` |
| Border | `rgba(255,255,255,0.05)` | `.glass-panel` border |
| Font | `Outfit` (Google Fonts) + system-ui fallback | Entire app |
| Corner radius | `rounded-xl` / `rounded-2xl` | Cards, buttons, panels |
| Grid | 12-col for dashboard (`lg:grid-cols-12`) | App layout |
| Glow | `.glow-blue` `.glow-emerald` `.glow-purple` (25px blur @ 15% opacity) | Active panels |

### Subject → Accent color map (`getSubjectColor` in App.jsx)

| Subject | Accent |
| --- | --- |
| Physics | Blue (`text-blue-400`, `bg-blue-500/10`, `border-blue-500/20`) |
| Biology | Emerald (`text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/20`) |
| Mathematics | Purple (`text-purple-400`, `bg-purple-500/10`, `border-purple-500/20`) |

---

## 3. Landing Page Anatomy (`LandingPage.jsx`)

Sections, top to bottom:

1. **Sticky header** — AURA logo (gradient blue→purple icon), desktop nav anchors
   (Features, Gallery, etc.), mobile hamburger menu.
2. **Hero** — headline with animated gradient text, CTA (`Start Learning`), floating
   blurred orbs (`animate-float` / `animate-float-slow`), hero image.
3. **Features** — feature cards with lucide icons (RAG study decks, Socratic feedback,
   glass-box cognitive routing…).
4. **Offerings — "2×3 grid"** — three **subject cards** (Physics `Atom`, Biology `Dna`,
   Mathematics `Binary`) + three **level cards** (Class 10 `School`, Class 11-12
   `Library`, Undergraduate `GraduationCap`).
5. **Selection modal** — pick subject + level → "Launch Dashboard". Error text shows if
   both aren't chosen. Cards animate with shimmer / glow-pulse.
6. **Gallery lightbox** — 5 preview images (`heroImage.png`, `gallery1–5.png`); prev/next
   arrows, counter, escape-to-close, body scroll lock.
7. **Footer** — social icons (Instagram, Facebook, Twitter) + nav.

### Interaction details
- `confirmSelection()` requires **both** subject and tier, then calls
  `onStartLearning(subject, tier)` (prop from `App.jsx`).
- Gallery keyboard support: `←` `→` `Esc` (see the `useEffect` in LandingPage).
- Mobile menu + modal both use `useState` toggles; modal announced via `modalError`.
- Scroll-to-section uses `scrollIntoView({behavior:'smooth'})` + `Reveal.jsx` for
  scroll-triggered entrance animations.

---

## 4. Dashboard Anatomy (`App.jsx`)

Left rail → central panel → right telemetry:

- **Header** — subject color accent, tier switcher pills (`Class 10 / Class 11-12 /
  Undergraduate`), subject switcher, chat toggle.
- **Left nav — Workspace Modes:** Study Deck (`theory`), Practice Lab (`quiz`),
  Threshold Exam (`final_exam`). Disabled when no content for the tier.
- **Context Metadata panel** — subject, tier, active node, fuzzy telemetry
  (score / degree of failure / performance tier, grayed out or pulsing).
- **Central views:**
  - *Study Deck:* 3D **flip cards** (`.flip-card`), prev/next card, "Generate AI
    Flashcards" button (calls `/api/tutor/generate-flashcards`).
  - *Practice Lab:* question text + free-answer input; submits to
    `/api/tutor/evaluate-short-answer` → sanitized hint + fuzzy grade shown inline.
  - *Threshold Exam:* timed questions, per-question timer, submit → `/api/tutor/evaluate-exam`
    report (score, tier, remediation plan, growth metrics).
  - *Chat pane:* conversation log + type-ahead; each tutor message shows
    `active_node` + `depth_level` badge = the **glass-box telemetry**.
- **On-demand hint launcher** button in exam view (`showSideHintBox`).

### Dashboard component states
- `loading` overlay/spinner, `isGeneratingCards` spinner, `isFlipped` flip state,
  `examReport` full-report view, per-question `lastQuestionEvaluated` feedback.
- Empty states when `cards/quizzes/finalExams` are empty (buttons disabled).
---

## 5. Animation & Motion Inventory (`src/index.css`)

| Utility | Effect | Applied to |
| --- | --- | --- |
| `.animate-fadeIn` | 0.4s opacity fade | Modal + lightbox overlays |
| `.animate-float` / `-slow` | 8s / 12s vertical+horizontal drift | Hero orbs |
| `.animate-gradient-text` | 6s hue-shifting gradient | Hero headline |
| `.animate-glow-pulse` | 4s opacity pulse on cards | Offering cards |
| `.animate-shimmer` | 3.5s diagonal light sweep (`::before`) | Feature cards |
| `.animate-spin-slow` | 14s linear spin ring | Hero visual |
| `.animate-breathe` | 3s gentle scale | Hero icon |
| `.pulse-active` | 2s expanding pulse-ring | Active telemetry indicator |
| `.flip-card*` | 0.6s `rotateY(180deg)` cubic-bezier | Flashcards |
| `.custom-scrollbar` | 6px dark scrollbar rails | Log / RAG streams |
| `.mask-fading-edge` | Vertical fade mask | Streaming text frames |

**Accessibility:** `prefers-reduced-motion: reduce` disables every animation listed above.

---

## 6. Micro-copy & Tone

- Brand name: **AURA** (gradient white→slate logotype with `BrainCircuit` brain icon).
- CTA verbs: *Launch Dashboard*, *Start Learning*, *Explore Course*.
- Academic framing: "Foundational concepts" → "Advanced high-school curriculum" →
  "Rigorous academic content tailored for university students".
- Chat/telemetry labels are engineer-styled (mono uppercase: `WORKSPACE MODES`,
  `CONTEXT METADATA`, `ACTIVE ROUTING NODE`) — reinforcing the "glass box" concept.

---

## 7. Component Inventory

| Component | File | Purpose |
| --- | --- | --- |
| `LandingPage` | `components/LandingPage.jsx` | Marketing + onboarding flow |
| `Reveal` | `components/Reveal.jsx` | Scroll-triggered entrance wrapper |
| `App` | `App.jsx` | Dashboard shell + all workspace views |
| `HintMarkdown` | `App.jsx` (internal) | Renders `##`, `**bold**`, bullets/numbers from tutor hints |
| `formatInlineMarkdown` | `App.jsx` (internal) | Bold/`<strong>` tokenizer for hint text |

### Iconography
- All icons come from **`lucide-react`** (`BrainCircuit`, `GraduationCap`, `School`,
  `Library`, `Atom`, `Dna`, `Binary`, `ChevronRight/Left`, `Menu`, `X`, `Check`, …).
- Subjects use single lucide glyphs as brand marks.

---

## 8. Responsive Behavior

- Landing nav collapses to hamburger menu below `md`.
- Offerings grid fills width on mobile; gallery lightbox caps at `max-w-[90vw] max-h-[85vh]`.
- Dashboard layout is `12-col` on `lg+`, stacks single-column on small screens.
- Recent commit `35d441ad` "Fixed responsiveness on small screens" is the reference
  pass for small-viewport fixes.

---

## 9. Do / Don't Reference

**Do:** keep slate-950 base + glass panels; use the subject accent map; add
`prefers-reduced-motion` guards; prefer small-hint text `text-[10px]`/`text-xs` for
metadata; use mono uppercase for telemetry labels.

**Don't:** introduce new fonts (Outfit only is loaded); use full-opacity white borders
(drop to `border-slate-800`/`rgba(255,255,255,0.05)`); add background images (the palette
is flat + glow/orb based); bypass the `activeColor` map when adding subject-tinted UI.