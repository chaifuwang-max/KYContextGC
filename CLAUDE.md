# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Kappa Psi Context Rule Builder — a collaborative web tool for annotating 77 sections of the Kappa Psi Pharmaceutical Fraternity Constitution and By-Laws. Users add interpretive guidance (category, severity, trigger flags, source) to each section. On export, all annotations are sent to Claude Sonnet to be structured into a formal JSON schema usable as AI context rules.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

No test framework or linter is configured.

**Environment** — create `.env.local` with:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=       # Used only by the Netlify serverless function
```

The Netlify function (`netlify/functions/generate-schema.js`) runs server-side. In local dev it is not available unless you run `netlify dev` instead of `npm run dev`.

## Architecture

Three files drive the entire annotation capability:

### 1. `src/ALL_SECTIONS.js` — the data source (3,227 lines)

Exports a single `ALL_SECTIONS` array of **77 section objects** covering six documents:
- Constitution (18 sections, IDs prefixed `c-`)
- General By-Laws (16 sections, IDs prefixed `b-`)
- Collegiate Chapter By-Laws (16 sections, IDs prefixed `col-`)
- Graduate Chapter By-Laws (16 sections, IDs prefixed `grad-`)
- Province By-Laws (11 sections, IDs prefixed `prov-`)
- Disciplinary Trial Guide (1 section)

Each object has this shape:
```js
{
  id: string,             // unique key used as section_id in Supabase (e.g. "c-art-I")
  group: string,          // one of the six document names above
  provision: string,      // citation string, e.g. "Constitution §001-002"
  title: string,          // heading shown in sidebar
  text: string,           // verbatim constitutional text (pre-formatted, preserve whitespace)
  defaultCategory: string // one of the 15 valid categories (see below)
}
```

This file is read-only reference data. It is never written to and has no Supabase counterpart — the sections themselves live only here.

### 2. `src/App.jsx` — UI controller and state manager (409 lines)

The single React component that orchestrates everything:

**State that drives annotation:**
- `selectedId` — which section is being viewed; initialized to `ALL_SECTIONS[0].id`
- `annotations` — all rows from the Supabase `annotations` table, loaded once and kept live via real-time channel
- `formCategory`, `formSeverity`, `formText` (guidance), `formFlags`, `formSource` — controlled inputs for the active annotation form

**Key functions:**
- `saveAnnotation()` — upserts a row to Supabase using `section_id`, `provision`, and all form fields
- `deleteAnnotation(id)` — removes a row after `window.confirm`
- `loadAnnotations()` — `SELECT *` from `annotations`; called on mount and on real-time change events
- `openExportModal()` — validates that every section has ≥1 annotation, then computes a token estimate (`totalChars / 4 + 500`)
- `runExport()` — POSTs all annotations to `/api/generate-schema`, then triggers a browser download of the returned JSON

**Section navigation (sidebar):**
- Sections are grouped by `section.group`
- `ALL_SECTIONS.map(s => s.group)` → deduplicated group list for collapse/expand controls
- Search filters by `title`, `provision`, and `group` fields
- "Show only annotated" toggle: `s => annotated.has(s.id)`
- Progress bar: `annotated.size / ALL_SECTIONS.length * 100`

**Real-time collaboration:**
- Supabase channel on `annotations` table → calls `loadAnnotations()` on any INSERT/UPDATE/DELETE
- Supabase channel on `user_sessions` table → shows "User X is also viewing this section"
- `setInterval` every 10 s upserts the current user's session row (session ID = `s-` + random hex, username = `User` + random digits)

### 3. `netlify/functions/generate-schema.js` — Claude Sonnet integration (135 lines)

The only place in the codebase where the Anthropic SDK is called. Triggered exclusively by `runExport()` in App.jsx.

**Request:** `POST /.netlify/functions/generate-schema` (proxied from `/api/*` via `netlify.toml`)
```json
{ "annotations": [ ...all annotation rows... ] }
```

**What it does:**
1. Validates input is a non-empty array
2. Calls `claude-sonnet-4-20250514` with a system prompt describing it as a "rules engine expert"
3. Passes the raw annotations as the user message, asking Claude to:
   - Auto-assign sequential IDs (`CTX-001`, `CTX-002`, …)
   - Validate/normalize category and severity values
   - Synthesize 2–3 example `{ ruling, reason }` objects per rule
   - Return valid JSON only

**Response:**
```json
{ "schema": [ ...structured rules... ], "tokenUsage": { ...Anthropic usage object... } }
```

**Output rule shape:**
```js
{
  id: "CTX-001",
  category: string,      // one of the 15 valid categories
  provision: string,
  title: string,
  guidance: string,
  examples: [{ ruling: string, reason: string }],  // 2-3 per rule
  flags: string[],        // e.g. ["resignation", "inactive"]
  severity: string,       // HARD_REJECT | HIGH | MEDIUM | INFO
  source: string
}
```

## Valid Controlled Values

These are enforced in the UI and expected by the Netlify function:

**Categories (15):** `membership`, `dues`, `discipline`, `elections`, `quorum`, `amendments`, `scope`, `procedure`, `insignia`, `officers`, `committees`, `province`, `ritual`, `hazing`, `finance`

**Severities (4):** `HARD_REJECT`, `HIGH`, `MEDIUM`, `INFO`

## Supabase Schema (inferred)

**`annotations` table:** `id`, `section_id` (FK to ALL_SECTIONS id), `provision`, `category`, `severity`, `guidance`, `flags`, `source`, `user_session_id`, `created_at`

**`user_sessions` table:** `id` (session_id), `current_section`, `username`, `last_active`

## Deployment

Netlify handles hosting and serverless functions. `netlify.toml` configures:
- Build: `npm run build` → `dist/`
- Functions directory: `netlify/functions/`
- URL rewrite: `/api/*` → `/.netlify/functions/:splat`

`ANTHROPIC_API_KEY` must be set as a Netlify environment variable (not `VITE_`-prefixed) so it stays server-side.

## The Annotation → Schema Pipeline

```
ALL_SECTIONS.js (77 section objects)
  → App.jsx renders section text + annotation form
  → User submits form → saveAnnotation() → Supabase annotations table
  → Real-time channel → loadAnnotations() → state update → all users see new annotation
  → User clicks Export → openExportModal() checks all 77 sections annotated
  → runExport() POSTs to /api/generate-schema
  → generate-schema.js calls Claude Sonnet with raw annotations
  → Claude returns structured JSON with CTX-### IDs and examples
  → Browser downloads kappa-psi-context-rules.json
```

`CONSTITUTION.js` in `src/` is an alternative/backup version of the sections data and is not imported by the current application.
