# DESIGNS.md

## Purpose

This file captures the primary visual inspiration for Finwise UI work.

Use it as a design reference when creating or refining:
- mobile-first product screens
- LINE Mini App style surfaces
- desktop back office screens
- shadcn/ui + Tailwind CSS component styling
- charts, cards, forms, navigation, and information-dense layouts

This document is inspiration, not a requirement to copy NVIDIA literally. The goal is to adapt the system's discipline, contrast, and precision to a fintech expense-tracking product.

## Primary Inspiration

Primary visual reference: NVIDIA marketing/design system.

Core idea:
- engineering-documentation structure with premium graphic design polish
- monochrome foundation with a single disciplined green accent
- sharp, angular geometry
- dense, factual, high-signal layouts
- dark hero/frame surfaces surrounding bright content canvases

For Finwise, apply this as:
- a premium AI-native finance product
- mobile-first for end users
- efficient desktop back office for operations and analytics
- trust, clarity, auditability, and speed over decorative softness

## Overview

NVIDIA's marketing system feels like technical documentation that learned editorial design. Pages are structured, dense, factual, and grid-based. A paper-white content canvas is framed by deep black hero and footer sections. One accent color does nearly all the emphasis work: NVIDIA Green.

The system relies on:
- one dominant accent color
- black/white/gray surface architecture
- very small border radius
- hairline borders instead of shadows
- strong typography and strict hierarchy
- compact spacing with repetitive structural rhythm

This creates a precise, technical, premium visual language that suits AI, infrastructure, and performance-oriented products.

## Key Characteristics

- Single-accent system: green carries primary CTAs, active states, and decorative motifs.
- Two-mode surface architecture: black/dark for hero and framing sections, white/light for primary content.
- Hyper-angular geometry: 2px radius on nearly every component.
- Dense card/grid composition: information-rich layouts with minimal decoration.
- Hairline separation: borders and dividers replace soft elevation.
- Strong typographic restraint: hierarchy is built mostly through size and weight.
- Signature green corner-square motif on selected cards and callouts.
- Footer and navigation feel infrastructural, not playful.

## Color System

### Brand & Accent

- `primary`: `#76b900`
- `primary-dark`: `#5a8d00`
- `accent-green-pale`: `#bff230`

### Surface

- `canvas`: `#ffffff`
- `surface-soft`: `#f7f7f7`
- `surface-dark`: `#000000`
- `surface-elevated`: `#1a1a1a`
- `hairline`: `#cccccc`
- `hairline-strong`: `#5e5e5e`

### Text

- `ink`: `#000000`
- `body`: `#1a1a1a`
- `mute`: `#757575`
- `stone`: `#898989`
- `ash`: `#a7a7a7`
- `on-dark`: `#ffffff`
- `on-dark-mute`: `rgba(255,255,255,0.7)`

### Semantic

- `error`: `#e52020`
- `error-deep`: `#650b0b`
- `warning`: `#df6500`
- `warning-bright`: `#ef9100`
- `success-deep`: `#3f8500`
- `link-blue`: `#0046a4`

### Editorial Accents

Use sparingly, mostly for non-core content:
- `accent-purple`: `#952fc6`
- `accent-purple-deep`: `#4d1368`
- `accent-purple-pale`: `#f9d4ff`
- `accent-yellow-pale`: `#feeeb2`

## Color Principles

- Green is the only primary accent.
- Do not introduce multiple competing accent colors into product chrome.
- Most surfaces should remain black, white, gray, or muted neutral.
- Use green intentionally for CTA, active state, focus, confirmation emphasis, and chart highlight.
- For Finwise, avoid making the UI look like gaming hardware marketing. Keep the tone more restrained, financial, and operational.

## Typography

### Brand Direction

The reference system uses NVIDIA-EMEA, a proprietary sans-serif. For implementation in this project, use a close modern sans-serif with strong legibility and compact UI behavior.

Recommended substitute direction:
- Inter
- Arial fallback

### Typography Principles

- Use a single sans-serif family across product UI.
- Use hierarchy through size and weight, not decorative styling.
- Keep headings bold and direct.
- Keep body copy readable and neutral.
- Use uppercase sparingly for utility labels, eyebrow text, metadata, and table headers.

### Reference Scale

| Token | Size | Weight | Line Height | Use |
|---|---:|---:|---:|---|
| `display-xl` | 48px | 700 | 1.25 | large hero headline |
| `display-lg` | 36px | 700 | 1.25 | big section/stat headline |
| `heading-xl` | 24px | 700 | 1.25 | section title |
| `heading-lg` | 22px | 400 | 1.75 | intro paragraph / narrative header |
| `heading-md` | 20px | 700 | 1.25 | card group title |
| `heading-sm` | 18px | 700 | 1.4 | filter group / small section title |
| `card-title` | 17px | 700 | 1.47 | card title |
| `body-md` | 16px | 400 | 1.5 | main body |
| `body-strong` | 16px | 700 | 1.5 | nav label / emphasized body |
| `body-sm` | 15px | 400 | 1.67 | secondary body |
| `button-lg` | 18px | 700 | 1.25 | hero CTA |
| `button-md` | 16px | 700 | 1.25 | standard button |
| `button-sm` | 14.4px | 700 | 1.0 | compact tab/button |
| `caption-md` | 14px | 700 | 1.43 | eyebrow / breadcrumb |
| `caption-sm` | 12px | 400 | 1.25 | metadata |
| `caption-xs` | 11px | 700 | 1.0 | chip / utility |
| `utility-xs` | 10px | 700 | 1.5 | fine print |

## Layout

### Spacing System

- Base unit: `8px`
- Suggested scale:
  - `xxs`: `2px`
  - `xs`: `4px`
  - `sm`: `8px`
  - `md`: `12px`
  - `lg`: `16px`
  - `xl`: `24px`
  - `xxl`: `32px`
  - `section`: `64px`

### Layout Principles

- Whitespace is structural, not atmospheric.
- Prefer repeated section rhythm over dramatic empty space.
- Use card grids and panels to organize dense information cleanly.
- Alternate dark framing sections and light content sections in a predictable way.
- Prefer strong containers and visible dividers over soft, floating compositions.

### Container Guidance

- Desktop content max width: around `1280px`
- Desktop gutters: `24px` to `48px`
- Mobile should remain compact, thumb-friendly, and vertically efficient

### Grid Guidance

- Card grid: 4 columns desktop, 3 columns medium, 2 columns tablet, 1 column mobile
- Long-form split content: 60/40 desktop, single-column on smaller screens
- Footer: 6 columns desktop, 2 columns tablet, accordion/mobile stack on small screens

## Elevation & Depth

The system is mostly flat.

### Levels

- Level 0: no border, no shadow
- Level 1: 1px light hairline border
- Level 2: 1px stronger divider on dark surfaces
- Level 3: very subtle shadow only for sticky chrome when necessary

### Guidance

- Do not rely on large card shadows.
- Use borders, contrast, spacing, and imagery to create separation.
- Hero sections may use photographic or rendered depth, but product UI should remain controlled.

## Shape Language

### Border Radius

- `none`: `0px`
- `xs`: `1px`
- `sm`: `2px`
- `full`: circular only for avatars/icon dots

### Principles

- Keep corners sharp.
- Avoid pills unless there is a very specific reason.
- Buttons, cards, inputs, tabs, and badges should stay close to `2px`.
- The visual tone should feel engineered, not soft or bubbly.

## Components

### Buttons

#### Primary Button

- Background: `primary`
- Text: white
- Height: `44px`
- Padding: `11px 24px`
- Radius: `2px`

Use for:
- main CTA
- submit/save
- confirmation actions

#### Outline Button

- Transparent background
- 2px green border
- Dark text on light surfaces
- White text on dark surfaces where needed

Use for:
- secondary action
- compare/view details
- supporting CTA

#### Ghost Link

- Text-led action with green arrow treatment
- No filled background

Use for:
- in-card affordance
- read more
- view details

### Tabs & Chips

#### Pill Tab

- Default: transparent or light background
- Active: inverted or dark active fill with strong contrast
- Keep angular radius

#### Badge Tag

- Soft background
- Uppercase compact label
- Used for type, status, category, or workflow state

### Inputs

#### Text Input

- White/light background
- 1px hairline border
- 44px height
- 2px radius
- Focus state becomes green bordered

#### Search Input

- Same styling family
- Search icon at left
- Slightly more compact for toolbar use

### Cards

#### Product / Feature / Resource Card Pattern

- Light canvas surface
- Hairline border
- 24px to 32px padding
- Small green corner square as optional signature motif
- Title + compact description + action

Use for:
- dashboard modules
- analytics summaries
- upload modules
- admin work queues
- resource-like content blocks

### Hero & Framing Sections

#### Dark Hero

- Black/dark surface
- Full-bleed image or graphic
- White headline
- Green primary CTA
- Minimal ornament

Use sparingly for:
- landing surfaces
- onboarding hero
- major product moments

### Navigation

#### Utility/Top Bar

- Dark background
- Compact height
- Utility actions aligned clearly

#### Primary Navigation

- Dark background
- Strong text contrast
- Brand at left, actions at right

#### Mobile Navigation

- Compact top bar
- Drawer pattern or bottom navigation
- Strong active state using green

### Footer

- Dark background
- Structured columns
- Dense but readable
- Utility/legal line below

## Signature Motif

### Corner Square

A small green square is the main decorative signal in the system.

Recommended adaptation for Finwise:
- use on selected cards, analytics modules, or hero callouts
- keep it subtle
- do not over-apply it to every component

## Finwise Adaptation Guidance

This reference should be adapted to Finwise's product reality:
- mobile-first expense tracking
- receipt upload and AI extraction
- Thai bank slip upload and review
- dashboard analytics
- desktop back office operations
- Thai and English bilingual UI

### What To Preserve

- disciplined single-accent color model
- precise geometry
- flat bordered cards
- dense information hierarchy
- strong dark/light contrast
- technical and trustworthy tone

### What To Adapt

- make forms more touch-friendly for mobile users
- reduce marketing-style spectacle for core product screens
- use friendlier spacing where financial input and review require clarity
- ensure Thai text reads cleanly and does not feel cramped
- keep back office tables efficient and highly legible

### Mobile Product Guidance

- prioritize thumb reach and one-handed scanning flows
- use bottom navigation for core sections
- use clear primary CTA for save/upload/confirm
- keep upload, preview, review, and confirmation flows compact
- present AI extraction as assistive, not authoritative

### Desktop Back Office Guidance

- use sidebar + topbar layout
- favor tables, filters, detail panes, and verification workspaces
- keep analytics clean and contrast-rich
- use status chips and verification flags clearly
- emphasize auditability and document review

## Do

- use shadcn/ui primitives with sharp styling
- keep panels flat and crisp
- rely on hierarchy, borders, and contrast
- use green as the main action signal
- design charts that feel precise, not playful
- keep interactions deliberate and trustworthy

## Avoid

- overly soft gradients and glassmorphism
- oversized shadows
- multiple accent colors in product chrome
- rounded, bubbly, consumer-social shapes
- playful fintech illustration styles
- visually noisy dashboards
- making the product feel like gaming hardware marketing

## Implementation Notes For This Repo

- Default to CSS variable-driven theme tokens
- Keep styles compatible with shadcn/ui and Tailwind CSS
- Preserve mobile-first behavior for user-facing product routes
- Use the same visual system for desktop back office, but with wider layouts and denser data presentation
- Support Thai and English labels without breaking spacing or hierarchy

## Short Design Summary

Finwise should feel like:
- a precise AI-assisted finance tool
- dark-framed and light-canvas
- green-accented and highly disciplined
- sharp-edged, compact, and operational
- premium without being flashy
- trustworthy, bilingual, and efficient
