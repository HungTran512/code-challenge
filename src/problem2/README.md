# Currency Swap (Problem 2)

A Vite + React + TypeScript + Tailwind CSS currency swap form for the 99Tech code challenge. Users pick pay/receive tokens, enter an amount, see a live rate-based quote, and confirm a mocked swap with toast feedback.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Tests

```bash
npm test
```

Runs Vitest unit tests for token/amount helpers in `src/utils/tokens.test.ts`.

## Production build

```bash
npm run build
```

Output goes to `dist/`. Preview the build locally with:

```bash
npm run preview
```

## Data sources

- **Token prices:** [https://interview.switcheo.com/prices.json](https://interview.switcheo.com/prices.json) — fetched on mount; entries without a price are omitted.
- **Token icons:** `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{currency}.svg` — with an inline SVG fallback when an icon fails to load.

## Features

- Pay / flip / receive layout with searchable token modal
- Live receive amount and rate derived from fetched prices
- Mock balance (3,491.78) with Max button and insufficient-balance validation
- Mock swap submit (~1.8s delay) with success toast
- Deep ledger visual theme (IBM Plex Sans + Mono)

## Stack

- Vite 6, React 19, TypeScript 5.8, Tailwind CSS v4, Sonner (toasts), Vitest + jsdom
