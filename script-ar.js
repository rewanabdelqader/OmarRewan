'use strict';

const weddingConfig = {
  coupleNames: 'Omar & Rewan',
  weddingDateText: '٠8 · 8 · 2026',
  start: new Date('2026-08-08T19:00:00+03:00'),
  end: new Date('2026-08-08T23:00:00+03:00'),
  startLocal: '20260808T190000',
  endLocal: '20260808T230000',
  venueName: 'النادى السويسرى بالقاهره',
  venueAddress: 'Swiss Club Cairo, Cairo, Egypt',
  venueMapsUrl: 'https://maps.app.goo.gl/iwaNAY48Krx1mPwG9?g_st=ic',
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbyzceubK37TDNa0K3uyqr9bHAb6DfD_noG1GxkT87IvKPUmIUvzAKuVoGYNaqEc1D4BiA/exec',
  rsvpStorageKey: 'omar_rewan_rsvps',
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function formatTwoDigits(value) {
  return String(value).padStart(2, '0');
}

function buildGoogleCalendarUrl() {
  const details = [
    'يشرفنا احتفالكم معنا.',
    `Venue: ${weddingConfig.venueName}`,
    `Map: ${weddingConfig.venueMapsUrl}`,
  ].join('\n');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${weddingConfig.coupleNames} Wedding`,
    dates: `${weddingConfig.startLocal}/${weddingConfig.endLocal}`,
    location: weddingConfig.venueAddress,
    details,
    ctz: 'Africa/Cairo',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcsFile() {
  const stamp = toIcsStamp(new Date());
  const start = toIcsStamp(weddingConfig.start);
  const end   = toIcsStamp(weddingConfig.end);
  const uid   = `omar-rewan-${Date.now()}@wedding-invitation`;
  const lines = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Omar and Rewan Wedding//EN',
    'CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
    `UID:${uid}`,`DTSTAMP:${stamp}`,`DTSTART:${start}`,`DTEND:${end}`,
    `SUMMARY:${weddingConfig.coupleNames} Wedding`,
    `LOCATION:${weddingConfig.venueAddress}`,
    `DESCRIPTION:Venue: ${weddingConfig.venueName}\\nMap: ${weddingConfig.venueMapsUrl}`,
    'END:VEVENT','END:VCALENDAR',
  ];
  return new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
}

function toIcsStamp(date) {
  return [
    date.getUTCFullYear(),
    formatTwoDigits(date.getUTCMonth() + 1),
    formatTwoDigits(date.getUTCDate()),
    'T',
    formatTwoDigits(date.getUTCHours()),
    formatTwoDigits(date.getUTCMinutes()),
    formatTwoDigits(date.getUTCSeconds()),
    'Z',
  ].join('');
}

function initStaticContent() {
  const wdl = $('#weddingDateLabel');
  if (wdl) wdl.textContent = weddingConfig.weddingDateText;
  const fd = $('#footerDate');
  if (fd) fd.textContent = '٠٨ · ٠٨ · ٢٠٢٦';

  const googleLink = $('#googleCalendarLink');
  if (googleLink) googleLink.href = buildGoogleCalendarUrl();

  const icsUrl = URL.createObjectURL(buildIcsFile());
  const appleLink = $('#appleCalendarLink');
  const outlookLink = $('#outlookCalendarLink');
  if (appleLink) appleLink.href = icsUrl;
  if (outlookLink) outlookLink.href = icsUrl;

  const mapsLink = $('#mapsLink');
  if (mapsLink) mapsLink.href = weddingConfig.venueMapsUrl;
}

function createPetals() {
  const container = $('#petals');
  if (!container) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    const size = 8 + Math.random() * 10;
    p.style.cssText = `left:${Math.random()*100}%;top:${-10-Math.random()*30}vh;width:${size}px;height:${size*.85}px;animation-duration:${14+Math.random()*10}s;animation-delay:${Math.random()*10}s;opacity:0;transform:rotate(${Math.random()*180}deg)`;
    container.appendChild(p);
  }
}

// ─── GSAP helpers ────────────────────────────────────────────
function hasGsap() {
  return typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
}

function initRevealAnimations() {
  const items = $$('.reveal');
  if (!items.length) return;
  const groups = new Map();
  items.forEach((item) => {
    const parent = item.parentElement;
    const list = groups.get(parent) || [];
    item.style.setProperty('--reveal-delay', `${list.length * 90}ms`);
    list.push(item);
    groups.set(parent, list);
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  items.forEach((item) => observer.observe(item));
}

function initMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasGsap()) { initRevealAnimations(); return; }

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('gsap-on');

  $$('.reveal').filter((el) => !el.closest('.hero')).forEach((el) => {
    const markVisible = () => el.classList.add('is-visible');
    if (reduce) { gsap.set(el, { opacity:1, y:0 }); markVisible(); return; }
    const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
    const idx = siblings.indexOf(el);
    gsap.set(el, { opacity:0, y:30 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => { markVisible(); gsap.to(el, { opacity:1, y:0, duration:1.1, delay:idx*0.08, ease:'power3.out' }); },
    });
  });

  if (!reduce) {
    gsap.set('.hero-media img', { scale:1.22, transformOrigin:'50% 50%' });
    gsap.to('.hero-media img', { scale:1.3, duration:24, ease:'sine.inOut', yoyo:true, repeat:-1 });
    gsap.to('.hero-media img', {
      yPercent:8, ease:'none',
      scrollTrigger: { trigger:'.hero', start:'top top', end:'bottom top', scrub:0.6 },
    });
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

function playHeroEntrance() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroItems = $$('.hero .reveal');
  if (!heroItems.length) return;
  if (!hasGsap() || reduce) { heroItems.forEach((el) => el.classList.add('is-visible')); return; }
  gsap.fromTo(heroItems, { opacity:0, y:34 }, { opacity:1, y:0, duration:1.2, stagger:0.14, ease:'power3.out', delay:0.25 });
}

// ─── Countdown ────────────────────────────────────────────────
function initCountdown() {
  const days = $('#days'), hours = $('#hours'), minutes = $('#minutes'), seconds = $('#seconds');
  const target = weddingConfig.start.getTime();
  const setDigit = (el, value) => {
    if (!el) return;
    const next = formatTwoDigits(value);
    if (el.textContent === next) return;
    el.textContent = next;
    el.classList.remove('is-rolling');
    void el.offsetWidth;
    el.classList.add('is-rolling');
  };
  const tick = () => {
    const distance = Math.max(0, target - Date.now());
    setDigit(days,    Math.floor(distance / 86400000));
    setDigit(hours,   Math.floor((distance % 86400000) / 3600000));
    setDigit(minutes, Math.floor((distance % 3600000) / 60000));
    setDigit(seconds, Math.floor((distance % 60000) / 1000));
  };
  tick();
  setInterval(tick, 1000);
}

// ─── Invitation card generator ────────────────────────────────
function sanitizeName(name) {
  return (name || 'Guest').replace(/[<>"&]/g, '').trim().slice(0, 60) || 'Guest';
}

function generateInvitationCard(guestName, guestCount) {
  const W = 1400, H = 840;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // background warm ivory gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#f4eeE4'); bg.addColorStop(1, '#ece4d5');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // soft radial glow top-left
  const gl = ctx.createRadialGradient(W*0.3, H*0.2, 0, W*0.3, H*0.2, W*0.65);
  gl.addColorStop(0, 'rgba(255,251,244,0.7)'); gl.addColorStop(1, 'rgba(255,251,244,0)');
  ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);

  // white card with gold border
  const CX=68, CY=56, CW=W-136, CH=H-112, CR=34;
  ctx.save();
  ctx.beginPath(); ctx.roundRect(CX, CY, CW, CH, CR);
  ctx.fillStyle = '#fffdfa'; ctx.fill();
  ctx.strokeStyle = '#c79a5c'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();

  // OR watermark inside card top-right
  ctx.save();
  ctx.globalAlpha = 0.055; ctx.fillStyle = '#c79a5c';
  ctx.font = 'italic 240px "Cormorant Garamond","Playfair Display",Georgia,serif';
  ctx.fillText('OR', CX + CW - 295, CY + 222);
  ctx.restore();

  // "YOUR INVITATION" kicker
  ctx.fillStyle = '#c79a5c';
  ctx.font = '600 17px "Inter",Arial,sans-serif';
  ctx.letterSpacing = '0.22em';
  ctx.fillText('دعوتك الشخصية', CX + 46, CY + 50);
  ctx.letterSpacing = '0';

  // Couple names
  ctx.fillStyle = '#2b2320';
  ctx.font = 'italic 78px "Cormorant Garamond","Playfair Display",Georgia,serif';
  ctx.fillText('Omar & Rewan', CX + 46, CY + 138);

  // thin gold rule
  ctx.strokeStyle = '#d6be94'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(CX+46, CY+156); ctx.lineTo(CX+500, CY+156); ctx.stroke();

  // 4 data rows
  const ROW_X = CX+46, ROW_W = CW-92, ROW_H = 78, ROW_GAP = 90, ROW_START = CY+170;
  const rows = [
    { label: 'اسم الضيف', value: sanitizeName(guestName), italic: true },
    { label: 'التاريخ والوقت', value: 'السبت ٨ أغسطس ٢٠٢٦  ·  ٧:٠٠ م', italic: false },
    { label: 'المكان', value: 'النادى السويسرى بالقاهره', italic: false },
    { label: 'الباركينج', value: 'باركينج جوّا النادي', italic: false },
  ];
  rows.forEach((row, i) => {
    const ry = ROW_START + i * ROW_GAP;
    ctx.save(); ctx.beginPath(); ctx.roundRect(ROW_X, ry, ROW_W, ROW_H, 16);
    ctx.fillStyle = '#f6f1e7'; ctx.fill(); ctx.restore();
    ctx.fillStyle = '#8c7864';
    ctx.font = '600 15px "Inter",Arial,sans-serif';
    ctx.letterSpacing = '0.18em';
    ctx.fillText(row.label, ROW_X + 22, ry + 24);
    ctx.letterSpacing = '0';
    ctx.fillStyle = row.italic ? '#c79a5c' : '#2b2320';
    ctx.font = row.italic
      ? 'italic 46px "Cormorant Garamond","Playfair Display",Georgia,serif'
      : '400 40px "Cormorant Garamond","Playfair Display",Georgia,serif';
    ctx.fillText(row.value, ROW_X + 290, ry + 58);
  });

  // footer
  ctx.strokeStyle = '#d6be94'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(CX+46, CY+CH-52); ctx.lineTo(CX+CW-46, CY+CH-52); ctx.stroke();
  ctx.fillStyle = '#8c7864';
  ctx.font = '400 16px "Inter",Arial,sans-serif';
  ctx.fillText('omar-rewan.vercel.app', CX + 46, CY + CH - 22);
  ctx.fillStyle = '#c79a5c';
  ctx.font = '600 16px "Inter",Arial,sans-serif';
  ctx.letterSpacing = '0.12em';
  ctx.fillText('8  ·  8  ·  2026', CX + CW - 200, CY + CH - 22);
  ctx.letterSpacing = '0';

  return canvas;
}


function roundRectFill(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function downloadInvitationCard(guestName, guestCount) {
  return new Promise((resolve) => {
    const canvas = generateInvitationCard(guestName, guestCount);
    if (!canvas) { resolve(false); return; }
    const safe = sanitizeName(guestName).replace(/\s+/g, '_');
    canvas.toBlob((blob) => {
      if (!blob) { resolve(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `دعوة_عمر_روان_${safe}.png`;
      a.href = url;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      resolve(true);
    }, 'image/png');
  });
}

// ─── RSVP form ────────────────────────────────────────────────
function buildRsvpPayload(form) {
  const attendance = form.querySelector('input[name="attendance"]:checked')?.value || 'Attending';
  return {
    fullName: $('#fullName', form).value.trim(),
    phoneNumber: $('#phoneNumber', form).value.trim(),
    guestCount: Number($('#guestCount', form).value || 1),
    attendance,
    bringingChildren: $('#bringingChildren', form).value,
    childrenCount: Number($('#childrenCount', form).value || 0),
    specialNotes: $('#specialNotes', form).value.trim(),
    createdAt: new Date().toISOString(),
  };
}

function getStoredRsvps() {
  try { const raw = localStorage.getItem(weddingConfig.rsvpStorageKey); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

function saveStoredRsvp(entry) {
  const current = getStoredRsvps();
  current.unshift(entry);
  try { localStorage.setItem(weddingConfig.rsvpStorageKey, JSON.stringify(current)); } catch {}
}

async function submitRsvpToEndpoint(payload) {
  if (!weddingConfig.rsvpEndpoint) return { skipped: true };
  await fetch(weddingConfig.rsvpEndpoint, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return { ok: true };
}

function initRsvpForm() {
  const form         = $('#rsvpForm');
  const status       = $('#rsvpStatus');
  const submitButton = $('#submitRsvp');
  const bringingChildren    = $('#bringingChildren');
  const childrenCountField  = $('#childrenCountField');
  const childrenCountInput  = $('#childrenCount');
  if (!form || !status || !submitButton) return;

  const syncChildrenCountState = () => {
    const show = bringingChildren?.value === 'Yes';
    if (childrenCountField) childrenCountField.style.display = show ? 'grid' : 'none';
    if (!show && childrenCountInput) childrenCountInput.value = '0';
  };
  bringingChildren?.addEventListener('change', syncChildrenCountState);
  syncChildrenCountState();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = buildRsvpPayload(form);
    if (!payload.fullName) {
      status.textContent = 'من فضلك اكتب اسمك الكامل الأول.';
      status.style.color = '#8f6650';
      $('#fullName', form).focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'بنبعت…';
    status.textContent = 'بنحفظ إجابتك…';
    status.style.color = '#8f6650';
    saveStoredRsvp(payload);

    try {
      await submitRsvpToEndpoint(payload);
      status.style.color = '#667c62';

      if (payload.attendance === 'Attending') {
        status.textContent = 'اتحجز مكانك! بنجهّز كارت الدعوة بتاعك…';
        submitButton.textContent = 'بنجهّز الكارت…';
        await downloadInvitationCard(payload.fullName, payload.guestCount);
        status.textContent = `اتحجز مكانك يا ${payload.fullName.split(' ')[0]}! كارت الدعوة اتحفظ على جهازك 🤍`;
      } else {
        status.textContent = 'وصلتنا إجابتك. هتوحشنا. 🤍';
      }

      form.reset();
      $('#guestCount', form).value = '1';
      $('input[name="attendance"][value="Attending"]', form).checked = true;
      syncChildrenCountState();
    } catch (err) {
      console.warn('RSVP error:', err);
      status.textContent = "اتحفظ. لو ما وصلكيش رد، بعتلنا على طول.";
      status.style.color = '#8f6650';
      if (payload.attendance === 'Attending') {
        await downloadInvitationCard(payload.fullName, payload.guestCount);
      }
      form.reset();
      $('#guestCount', form).value = '1';
      $('input[name="attendance"][value="Attending"]', form).checked = true;
      syncChildrenCountState();
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'احجز مكانك';
    }
  });
}

// ─── Opening screen ───────────────────────────────────────────
function initOpening() {
  const opening = $('#opening');
  if (!opening) return;
  const openBtn = $('#openBtn');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('is-locked');

  const reveal = () => {
    if (opening.classList.contains('is-open')) return;
    opening.classList.add('is-open');
    document.body.classList.remove('is-locked');
    document.body.classList.add('entered');
    playHeroEntrance();
    window.setTimeout(() => opening.remove(), 1300);
  };

  openBtn?.addEventListener('click', reveal);
  opening.addEventListener('click', (e) => { if (e.target === opening) reveal(); });

  if (hasGsap() && !reduce) {
    document.documentElement.classList.add('gsap-open');
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.opening-monogram', { opacity:0, y:22, duration:1.1, delay:0.3 })
      .from('.opening-names',    { opacity:0, y:16, duration:0.9 }, '-=0.55')
      .from('.opening-lines',    { opacity:0, y:18, duration:1.0 }, '-=0.45')
      .from('.opening-meta',     { opacity:0, y:14, duration:0.9 }, '-=0.5')
      .from('.opening-btn',      { opacity:0, y:14, duration:0.9 }, '-=0.45');
  }
  if (reduce) reveal();
}

// ─── Atmosphere ───────────────────────────────────────────────
function initAtmosphere() {
  const root = document.documentElement;
  const progress = $('#scrollProgress');
  const lights = $('#gardenLights');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (lights && !reduce) {
    for (let i = 0; i < 28; i++) {
      const dot = document.createElement('span');
      dot.className = 'glight';
      dot.style.left = `${Math.random()*100}%`;
      dot.style.top  = `${8+Math.random()*86}%`;
      dot.style.setProperty('--d', `${(Math.random()*3).toFixed(2)}s`);
      dot.style.setProperty('--s', (0.55+Math.random()*0.95).toFixed(2));
      lights.appendChild(dot);
    }
  }

  let ticking = false;
  const update = () => {
    const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    root.style.setProperty('--evening', p.toFixed(3));
    if (progress) progress.style.transform = `scaleX(${p})`;
    document.body.classList.toggle('is-dusk', p > 0.6);
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

// ─── Scroll spy ───────────────────────────────────────────────
function initScrollSpy() {
  const links = $$('.spy a');
  if (!links.length) return;
  const map = new Map(links.map((a) => [a.dataset.spy, a]));
  const sections = links.map((a) => document.getElementById(a.dataset.spy)).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((a) => a.classList.remove('is-active'));
        map.get(entry.target.id)?.classList.add('is-active');
      }
    });
  }, { threshold:0, rootMargin:'-45% 0px -45% 0px' });
  sections.forEach((s) => observer.observe(s));
}

// ─── Lightbox ─────────────────────────────────────────────────
function initLightbox() {
  const box = $('#lightbox'), img = $('#lightboxImg'), closeBtn = $('#lightboxClose');
  if (!box || !img) return;
  const open = (src, alt) => {
    img.src = src; img.alt = alt || '';
    box.classList.add('is-open'); box.setAttribute('aria-hidden','false');
    document.body.classList.add('is-locked');
  };
  const close = () => {
    box.classList.remove('is-open'); box.setAttribute('aria-hidden','true');
    document.body.classList.remove('is-locked');
  };
  $$('.venue-photo img,.kids-photo img,.story-image img').forEach((t) => {
    t.style.cursor = 'zoom-in';
    t.addEventListener('click', () => open(t.currentSrc || t.src, t.alt));
  });
  closeBtn?.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// ─── Micro interactions ───────────────────────────────────────
function initMicroInteractions() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;
  $$('.button').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX-(r.left+r.width/2))*0.16}px,${(e.clientY-(r.top+r.height/2))*0.2}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

// ─── Optional music ───────────────────────────────────────────
function initMusic() {
  const btn = $('#musicToggle'), audio = $('#bgMusic');
  if (!btn || !audio) return;
  fetch('Media/music.mp3', { method: 'HEAD' }).then((r) => { if (r.ok) btn.hidden = false; }).catch(() => {});
  let playing = false;
  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause(); btn.classList.remove('is-playing'); btn.setAttribute('aria-label','Play music'); playing = false;
    } else {
      audio.play().then(() => { playing = true; btn.classList.add('is-playing'); btn.setAttribute('aria-label','Pause music'); }).catch(() => {});
    }
  });
}

// ─── Bootstrap ────────────────────────────────────────────────
function init() {
  initStaticContent();
  createPetals();
  initMotion();
  initCountdown();
  initRsvpForm();
  initOpening();
  initAtmosphere();
  initScrollSpy();
  initLightbox();
  initMicroInteractions();
  initMusic();
}

document.addEventListener('DOMContentLoaded', init);