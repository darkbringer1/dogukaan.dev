# dogukaan.dev

The hub page for Doğukaan's apps, designed as a Mac desktop. A static site
(`index.html`, `assets/site.css`, `assets/site.js`, no build step), deployed to
GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

- Desktop: a menu bar with a Berlin clock and four real MenuUtils modules
  (System Monitor, Network Monitor, Transcription, Xcode Cleaner; each opens
  its actual panel) behind a working Menu Bar Hider arrow, an About window, an Applications
  window, one window per app (draggable, opened from the dock, the desktop
  icons or the menus), and Zerre walking along the bottom. Click Zerre.
- Phone (≤760px): a home screen with cards; app windows open as sheets.
- Every app link is a real link, so the page works without JavaScript.
  `dogukaan.dev/#zerre` (or `#menuutils`, `#glean`) opens that app's window.
- `assets/zerre/` holds sprite parts from the Zerre website; the pet is
  composed from them at runtime. `assets/shots/` holds app screenshots.
- Fonts are self-hosted under the SIL Open Font License: Instrument Sans and
  Silkscreen (`assets/fonts/`).

The app sites live in their own repos: [zerre](https://github.com/darkbringer1/zerre)
and [menuutils](https://github.com/darkbringer1/menuutils).
