# Tatul Danielyan

Minimal personal website for https://daniel7an.github.io/.

Plain HTML and CSS with no build step and no dependencies. The only JavaScript is ~14 inline lines driving the light/dark toggle; the page renders correctly without it, in light.

## Preview

Run `python3 -m http.server 8000` and open http://localhost:8000.

## Edit

Edit `index.html` for content and `style.css` for appearance. Replace `assets/portrait.jpg` to change the photo. GitHub Pages serves the root of the `main` branch.

## Content sources

- https://arxiv.org/abs/2609.03611 — FailBench title, authors, and summary.
- https://arxiv.org/abs/2608.29284 — Uzbek Legal RAG title, authors, and acceptance status.
- https://www.linkedin.com/in/tatul-danielyan/ — university and study years.
- https://github.com/daniel7an — GitHub profile.
- Site image supplied by Tatul.

The introduction is draft copy for review. The CV button links to `assets/cv.pdf`, which is not committed yet — drop the PDF at that path to make it live. Projects are intentionally omitted from v1.

## Visitor map

The footer map shows roughly where visitors come from. The dotted land layer is `assets/world-dots.svg`; the dots on top come from a small Cloudflare Worker in `visitor-map/` that stores only a rounded city location and a count per city (no IPs). Each browser is counted at most once every 30 days.

One-time setup (free Cloudflare account):

1. `cd visitor-map && npx wrangler login`
2. `npx wrangler kv namespace create VISITS` and paste the printed id into `wrangler.toml`
3. `npx wrangler deploy` and copy the `https://visitor-map.<you>.workers.dev` URL
4. Put that URL in the `data-api` attribute of the `.visitor-map` figure in `index.html`

Until `data-api` is set (or if the Worker is unreachable), the map stays hidden and the footer shows only the "Last updated" line.
