# dogukaan.dev

The hub page for Doğukaan's apps, designed as a Mac desktop. A static site
(`index.html`, `assets/site.css`, `assets/site.js`, no build step), deployed to
GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

- Desktop: a menu bar with a Berlin clock and four real MenuUtils modules
  (System Monitor, Network Monitor, Transcription, Xcode Cleaner; each opens
  its actual panel) behind a working Menu Bar Hider arrow, an About window, an Applications
  window, one window per app (draggable, opened from the dock, the desktop
  icons or the menus), and Zerre walking along the bottom. Click Zerre.
- About me: three more windows, opened from the About buttons, the Doğukaan
  menu, the desktop icons and the dock: "How I got here" (a note), Résumé and
  Talks and community (photos, SwiftBuddies, talks, recent LinkedIn posts,
  profile links). `#story`, `#resume` and `#community` open them directly.
- Phone (≤760px): a home screen with cards; app windows open as sheets.
- Every app link is a real link, so the page works without JavaScript.
  `dogukaan.dev/#zerre` (or `#menuutils`, `#glean`) opens that app's window.
- `assets/zerre/` holds sprite parts from the Zerre website; the pet is
  composed from them at runtime. `assets/shots/` holds app screenshots.
  `assets/photos/` holds photos from Doğukaan's public LinkedIn posts.
- Fonts are self-hosted under the SIL Open Font License: Instrument Sans and
  Silkscreen (`assets/fonts/`).

The app sites live in their own repos: [zerre](https://github.com/darkbringer1/zerre)
and [menuutils](https://github.com/darkbringer1/menuutils).
