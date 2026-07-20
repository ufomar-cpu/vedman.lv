# Published material build input

Sanitized public passport JSON used by `scripts/generate-material-pages.js`.

## Structure

- `manifest.json` — list of published materials (`urlSlug`, `title`, `publishedAt`)
- `materials/{slug}.json` — sanitized public passport payload (same shape as `studio/published/{slug}.json`)

## Updating

**Option A — Manual export:** After Studio publish, copy sanitized JSON into `materials/{slug}.json` and update `manifest.json`.

**Option B — Anonymous sync (CI):**

```bash
npm run sync:published-data
```

Downloads `studio/manifest.json` and each `studio/published/{slug}.json` from Firebase Storage without credentials. Fails on malformed data, slug mismatch, or duplicate slugs.

## Build

```bash
npm run generate:materials
npm run validate:routes
```

GitHub Actions runs sync → tests → generate → validate before Pages deploy.
