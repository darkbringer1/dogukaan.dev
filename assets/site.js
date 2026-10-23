// dogukaan.dev: menus, windows, the Berlin clock and Zerre.
(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 760px)');
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // ---------- Berlin clock ----------
  const clock = $('#clock'), clockShort = $('.clock-short');
  const long = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  const short = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false });
  function tick() {
    const now = new Date();
    clock.textContent = long.format(now).replace(',', '');
    clock.dateTime = now.toISOString();
    clockShort.textContent = short.format(now);
    setTimeout(tick, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50);
  }
  tick();

  // ---------- Menus ----------
  const menus = $$('.menu');
  let openMenu = null;

  function items(menu) { return $$('.menu-panel > li > a, .menu-panel > li > button, .menu-panel--popover button', menu); }
  function showMenu(menu, focusFirst) {
    if (openMenu && openMenu !== menu) hideMenu(openMenu);
    openMenu = menu;
    $('.menu-title', menu).setAttribute('aria-expanded', 'true');
    $('.menu-panel', menu).hidden = false;
    if (focusFirst) items(menu)[0]?.focus();
  }
  function hideMenu(menu, refocus) {
    $('.menu-title', menu).setAttribute('aria-expanded', 'false');
    $('.menu-panel', menu).hidden = true;
    if (openMenu === menu) openMenu = null;
    if (refocus) $('.menu-title', menu).focus();
  }

  menus.forEach((menu, i) => {
    const title = $('.menu-title', menu);
    title.addEventListener('click', () => (openMenu === menu ? hideMenu(menu) : showMenu(menu)));
    title.addEventListener('pointerenter', () => { if (openMenu && openMenu !== menu) showMenu(menu); });
    menu.addEventListener('keydown', (e) => {
      const list = items(menu), at = list.indexOf(document.activeElement);
      const step = (d) => menus[(i + d + menus.length) % menus.length];
      if (e.key === 'ArrowDown') { e.preventDefault(); if (openMenu !== menu) showMenu(menu, true); else list[(at + 1) % list.length]?.focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (openMenu !== menu) showMenu(menu); list[(at - 1 + list.length) % list.length]?.focus(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const next = step(e.key === 'ArrowRight' ? 1 : -1);
        if (openMenu) showMenu(next, true); else $('.menu-title', next).focus();
      } else if (e.key === 'Escape' && openMenu === menu) { e.stopPropagation(); hideMenu(menu, true); }
    });
    $('.menu-panel', menu).addEventListener('click', (e) => { if (e.target.closest('a, button')) hideMenu(menu); });
  });
  document.addEventListener('pointerdown', (e) => { if (openMenu && !openMenu.contains(e.target)) hideMenu(openMenu); });

  // ---------- Windows ----------
  const windows = Object.fromEntries($$('[data-window]').map((w) => [w.dataset.window, w]));
  const backdrop = $('.sheet-backdrop');
  const order = [];               // back to front
  const returnTo = new Map();     // window -> element to focus when it closes
  let cascade = 0;

  const isOpen = (w) => !w.hidden && !w.classList.contains('is-closing');
  const isSheet = (w) => phone.matches && w.classList.contains('window--info');

  function front(w) {
    const i = order.indexOf(w); if (i >= 0) order.splice(i, 1);
    order.push(w);
    order.forEach((x, n) => { x.style.zIndex = 10 + n; x.classList.toggle('is-front', x === w); });
  }
  function frontmost() { for (let i = order.length - 1; i >= 0; i--) if (isOpen(order[i])) return order[i]; return null; }

  function syncDock() {
    $$('.dock-item[data-open]').forEach((d) => d.classList.toggle('is-running', isOpen(windows[d.dataset.open])));
    backdrop.hidden = !Object.values(windows).some((w) => isOpen(w) && isSheet(w));
    document.body.style.overflow = backdrop.hidden ? '' : 'hidden';
  }

  function place(w) {
    if (phone.matches || !w.classList.contains('window--info') || w.dataset.placed) return;
    const width = w.offsetWidth, height = w.offsetHeight;
    const n = cascade++ % 5;
    const left = Math.max(16, (innerWidth - width) / 2 - 60 + n * 30);
    const top = scrollY + Math.max(46, Math.min(110, (innerHeight - height) / 2 - 40)) + n * 26;
    Object.assign(w.style, { left: `${left}px`, top: `${top}px` });
    w.dataset.placed = '1';
  }

  function animate(w, cls) {
    if (reduce.matches) return Promise.resolve();
    w.classList.remove('is-opening', 'is-closing', 'is-intro');
    void w.offsetWidth;
    w.classList.add(cls);
    return new Promise((done) => {
      const end = () => { w.classList.remove(cls); done(); };
      w.addEventListener('animationend', end, { once: true });
      setTimeout(end, 600);
    });
  }

  function open(id, origin) {
    const w = windows[id]; if (!w) return;
    if (openMenu) hideMenu(openMenu);
    if (phone.matches && !w.classList.contains('window--info')) { w.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' }); return; }
    if (isSheet(w)) Object.values(windows).forEach((x) => { if (x !== w && isOpen(x) && isSheet(x)) close(x, true); });
    if (origin) returnTo.set(w, origin);
    const wasOpen = isOpen(w);
    w.hidden = false;
    place(w);
    front(w);
    if (!wasOpen) {
      if (origin && !isSheet(w)) {
        const o = origin.getBoundingClientRect(), r = w.getBoundingClientRect();
        w.style.transformOrigin = `${o.left + o.width / 2 - r.left}px ${o.top + o.height / 2 - r.top}px`;
      } else w.style.transformOrigin = '';
      animate(w, 'is-opening');
    }
    syncDock();
    w.focus({ preventScroll: true });
    if (id === 'zerre') pet.say("That's me!", 'happy');
  }

  function close(w, quiet) {
    if (!isOpen(w)) return;
    w.style.transformOrigin = '';
    const back = returnTo.get(w);
    w.classList.add('is-closing');
    animate(w, 'is-closing').then(() => { w.classList.remove('is-closing'); w.hidden = true; syncDock(); });
    syncDock();
    if (quiet) return;
    const next = frontmost();
    if (next) front(next);
    if (back && document.contains(back) && back.offsetParent) back.focus({ preventScroll: true });
    else next?.focus({ preventScroll: true });
  }

  function tidy() {
    cascade = 0;
    ['about', 'apps'].forEach((id) => { windows[id].style.left = windows[id].style.top = ''; });
    Object.values(windows).forEach((w) => { if (w.dataset.placed) { delete w.dataset.placed; if (isOpen(w)) place(w); } });
    ['apps', 'about'].forEach((id) => { if (!isOpen(windows[id])) open(id); });
    front(windows.about);
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open], [data-close], [data-action]');
    if (!t) return;
    if (t.matches('[data-open]')) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; // let the link open normally
      e.preventDefault();
      open(t.dataset.open, t.closest('.menu-panel') ? null : t);
    } else if (t.matches('[data-close]')) close(t.closest('[data-window]'));
    else if (t.dataset.action === 'tidy') tidy();
    else if (t.dataset.action === 'close-all') Object.values(windows).forEach((w) => close(w, true));
  });
  backdrop.addEventListener('click', () => { const w = frontmost(); if (w && isSheet(w)) close(w); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || openMenu) return;
    const w = frontmost();
    if (w && (isSheet(w) || !phone.matches)) close(w);
  });
  Object.values(windows).forEach((w) => w.addEventListener('pointerdown', () => { if (isOpen(w) && order.at(-1) !== w) front(w); }));

  // Drag by the title bar (desktop only)
  $$('.titlebar').forEach((bar) => {
    const w = bar.closest('[data-window]');
    bar.addEventListener('pointerdown', (e) => {
      if (phone.matches || e.button !== 0 || e.target.closest('button, a')) return;
      const desk = w.offsetParent.getBoundingClientRect(), r = w.getBoundingClientRect();
      const dx = e.clientX - r.left, dy = e.clientY - r.top;
      Object.assign(w.style, { left: `${r.left - desk.left}px`, top: `${r.top - desk.top}px`, right: 'auto' });
      w.dataset.placed = '1';
      bar.setPointerCapture(e.pointerId);
      const move = (m) => {
        const x = Math.min(Math.max(m.clientX - dx, 60 - r.width), innerWidth - 60);
        const y = Math.min(Math.max(m.clientY - dy, 30), innerHeight - 60);
        w.style.left = `${x - desk.left}px`;
        w.style.top = `${y - desk.top}px`;
      };
      const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });
  });

  phone.addEventListener('change', () => { Object.values(windows).forEach((w) => { if (w.classList.contains('window--info') && isOpen(w)) close(w, true); }); syncDock(); });

  front(windows.apps);
  front(windows.about);
  if (!reduce.matches) { windows.about.classList.add('is-intro'); windows.apps.classList.add('is-intro'); }

  // ---------- Zerre ----------
  const pet = (() => {
    const root = $('.zerre'), button = $('.zerre-pet'), bubble = $('.zerre-bubble');
    const canvas = $('canvas', root), ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, CX = W / 2, GY = H - 6, SCALE = 2;
    const names = ['body', 'shadow', 'sprout.2', 'arm.up', 'card.agent_done', 'card.command_done', 'particle.sparkle', 'particle.confetti', 'particle.dust',
      'face.neutral', 'face.blink', 'face.happy', 'face.curious', 'face.grin', 'face.focused', 'face.surprised'];
    const imgs = {};
    function fit() {
      // Whole device pixels per art pixel, about 1.5x on phones and 2x on desktops.
      const dpr = devicePixelRatio || 1, want = phone.matches ? 1 : 2;
      const k = Math.max(1, Math.round(want * dpr)) / dpr;
      canvas.style.width = `${W * k}px`; canvas.style.height = `${H * k}px`;
      root.style.width = canvas.style.width; root.style.height = canvas.style.height;
    }
    fit(); phone.addEventListener('change', fit);
    let pending = null;
    const api = { say(...a) { pending = a; } };

    let x = 24, target = 24, face = 'neutral', look = 0, mouseX = null;
    let moment = null, momentAt = 0, next = 0, blinkAt = 2, bubbleTimer = 0, last = 0, started = 0;
    const MOMENTS = [
      { name: 'agent', text: 'Your agent is done!', dur: 3 },
      { name: 'ship', text: 'You shipped it!', dur: 2.4 },
      { name: 'focus', text: 'Working with you.', dur: 3 },
    ];

    function draw(name, px, py, o = {}) {
      const image = typeof name === 'string' ? imgs[name] : name; if (!image) return;
      const [ax, ay] = o.anchor ?? [0.5, 1];
      ctx.save();
      if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
      ctx.translate(Math.round(px), Math.round(py));
      if (o.flip) ctx.scale(-1, 1);
      ctx.drawImage(image, Math.round(-image.width * ax), Math.round(-image.height * ay));
      ctx.restore();
    }
    const bodies = {};
    function creature(f, l) {
      const key = `${f}${l}`; if (bodies[key]) return bodies[key];
      const c = document.createElement('canvas'); c.width = 44; c.height = 54;
      const g = c.getContext('2d');
      g.drawImage(imgs.body, 0, 12);
      g.drawImage(imgs[`face.${f}`], 12 + l, 54 - 12 - 10);
      g.drawImage(imgs['sprout.2'], 14, 54 - 35 - 10);
      return bodies[key] = c;
    }
    function squash(src, sx, sy) {
      const c = document.createElement('canvas'); c.width = Math.round(src.width * sx); c.height = Math.round(src.height * sy);
      const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, c.width, c.height);
      return c;
    }
    const arc = (k, h) => (k > 0 && k < 1 ? 4 * h * k * (1 - k) : 0);
    function burst(name, bx, by, k, n, speed) {
      if (k < 0 || k > 1) return;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.3, sp = speed * (0.7 + ((i * 37) % 10) / 20);
        draw(name, bx + Math.cos(a) * sp * k, by - Math.sin(a) * sp * k + 30 * k * k, { anchor: [0.5, 0.5], alpha: 1 - k * 0.6 });
      }
    }

    function range() {
      const dock = $('.dock').getBoundingClientRect();
      const max = phone.matches || dock.left < 360 ? innerWidth - root.offsetWidth - 8 : dock.left - 150;
      return [8, Math.max(8, max)];
    }

    function say(text, f) {
      bubble.textContent = text;
      bubble.classList.toggle('is-left', x > innerWidth - 260);
      bubble.classList.add('is-on');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.remove('is-on'), 2600);
      if (f) { moment = { name: 'react', dur: 1.4, face: f }; momentAt = performance.now() / 1000; }
      if (reduce.matches) render(performance.now() / 1000);
    }

    function render(t) {
      ctx.clearRect(0, 0, W, H);
      const walking = !moment && Math.abs(target - x) > 1 && !reduce.matches;
      const k = moment ? (t - momentAt) / moment.dur : 0;
      let f = face, lift = 0, sx = 1, sy = 1;
      const bob = walking && Math.floor(t * 6) % 2 ? 1 : 0;

      if (moment?.name === 'agent') { f = k < 0.18 ? 'surprised' : 'happy'; }
      else if (moment?.name === 'ship') { f = 'grin'; lift = arc(k / 0.35, 10); if (k > 0.33 && k < 0.4) { sx = 1.08; sy = 0.92; } }
      else if (moment?.name === 'focus') { f = 'focused'; }
      else if (moment?.name === 'react') { f = moment.face; lift = arc(k / 0.3, 6); }
      else if (t > blinkAt && t < blinkAt + 0.14) f = 'blink';

      draw('shadow', CX, GY + 2, { alpha: lift > 6 ? 0.6 : 1 });
      let body = creature(f, look);
      if (sx !== 1 || sy !== 1) body = squash(body, sx, sy);
      const top = GY - lift - bob;
      if (moment?.name === 'agent') {
        const up = Math.min(1, k / 0.25);
        const cardBottom = top - 40 - Math.round(up * 8);
        draw('card.agent_done', CX, cardBottom);
        if (up >= 1) { draw('arm.up', CX - 8, cardBottom + 6, { flip: true }); draw('arm.up', CX + 8, cardBottom + 6); }
        if (up >= 1) burst('particle.sparkle', CX, cardBottom - 8, (k - 0.25) / 0.4, 4, 18);
      }
      draw(body, CX, top);
      if (moment?.name === 'ship') { burst('particle.confetti', CX, GY - 52, (k - 0.1) / 0.6, 8, 26); burst('particle.sparkle', CX, GY - 50, (k - 0.3) / 0.5, 4, 20); }
      if (moment?.name === 'focus') { const n = Math.floor(t * 2) % 3; for (let i = 0; i <= n; i++) draw('particle.dust', CX + 20 + i * 3, GY - 40 - i * 4, { alpha: 0.7 }); }
      if (moment?.name === 'react' && k < 0.5) burst('particle.sparkle', CX, GY - 44, k / 0.5, 4, 20);
    }

    function frame(now) {
      const t = now / 1000, dt = Math.min(0.05, t - (last || t)); last = t;
      if (moment && t - momentAt > moment.dur) { moment = null; next = t + 2 + Math.random() * 3; }

      if (!moment) {
        const [lo, hi] = range();
        target = Math.min(Math.max(target, lo), hi);
        if (Math.abs(target - x) > 1) {
          x += Math.sign(target - x) * Math.min(Math.abs(target - x), 34 * dt);
          look = Math.sign(target - x) * 2;
        } else {
          look = mouseX == null ? 0 : Math.max(-2, Math.min(2, Math.round((mouseX - (x + root.offsetWidth / 2)) / 140)));
          if (t > next) { target = lo + Math.random() * (hi - lo); next = Infinity; }
        }
        if (Math.abs(target - x) <= 1 && next === Infinity) next = t + 3 + Math.random() * 5;
      }
      if (t > blinkAt + 0.14) blinkAt = t + 2 + Math.random() * 4;
      root.style.transform = `translateX(${Math.round(x)}px)`;
      render(t);
      if (t - started < 1.4 && !bubble.classList.contains('is-on') && t - started > 1.2) say("Hi! I'm Zerre.");
      requestAnimationFrame(frame);
    }

    let cycle = 0;
    button.addEventListener('click', () => {
      const m = MOMENTS[cycle++ % MOMENTS.length];
      moment = { ...m }; momentAt = performance.now() / 1000;
      target = x;
      say(m.text);
      if (reduce.matches) { moment.dur = Infinity; render(momentAt); moment = null; }
    });
    addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') mouseX = e.clientX; }, { passive: true });

    Promise.all(names.map((n) => new Promise((ok, fail) => {
      const im = new Image(); im.onload = () => ok(imgs[n] = im); im.onerror = fail; im.src = `/assets/zerre/${n}.png`;
    }))).then(() => {
      root.hidden = false;
      api.say = say;
      if (pending) setTimeout(() => say(...pending), 500);
      if (reduce.matches) {
        x = 24; root.style.transform = `translateX(${x}px)`;
        render(0);
        // Without motion, a moment is a still pose that holds until the bubble fades.
        button.addEventListener('click', () => {
          const m = MOMENTS[(cycle - 1) % MOMENTS.length];
          moment = { ...m }; momentAt = 0; render(m.dur * 0.6);
          setTimeout(() => { moment = null; render(0); }, 2600);
        });
        api.say = (text) => { say(text); };
        return;
      }
      started = performance.now() / 1000; next = started + 3;
      requestAnimationFrame(frame);
    }).catch(() => {});

    return { say: (...a) => api.say(...a) };
  })();

  // dogukaan.dev/#zerre opens that app's window
  const deep = location.hash.slice(1);
  if (windows[deep]?.classList.contains('window--info')) open(deep);
})();
