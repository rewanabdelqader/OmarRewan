'use strict';

const weddingConfig = {
  coupleNames: 'Omar & Rewan',
  weddingDateText: '08 · 08 · 2026',
  start: new Date('2026-08-08T19:00:00+03:00'),
  end: new Date('2026-08-08T23:00:00+03:00'),
  startLocal: '20260808T190000',
  endLocal: '20260808T230000',
  venueName: 'Swiss Club Cairo',
  venueAddress: 'Swiss Club Cairo, Cairo, Egypt',
  venueMapsUrl: 'https://maps.app.goo.gl/iwaNAY48Krx1mPwG9?g_st=ic',
  // Google Apps Script web-app URL that saves RSVPs into your Google Sheet.
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
    'We are honored to celebrate with you.',
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
  const end = toIcsStamp(weddingConfig.end);
  const uid = `omar-rewan-${Date.now()}@wedding-invitation`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Omar and Rewan Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${weddingConfig.coupleNames} Wedding`,
    `LOCATION:${weddingConfig.venueAddress}`,
    `DESCRIPTION:Venue: ${weddingConfig.venueName}\\nMap: ${weddingConfig.venueMapsUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
}

function toIcsStamp(date) {
  const year = date.getUTCFullYear();
  const month = formatTwoDigits(date.getUTCMonth() + 1);
  const day = formatTwoDigits(date.getUTCDate());
  const hours = formatTwoDigits(date.getUTCHours());
  const minutes = formatTwoDigits(date.getUTCMinutes());
  const seconds = formatTwoDigits(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function initStaticContent() {
  // #coupleNames is now a styled heading with its own markup — leave its DOM alone.
  $('#weddingDateLabel').textContent = weddingConfig.weddingDateText;
  const eventDateCard = $('#eventDateCard');
  if (eventDateCard) eventDateCard.textContent = '8.8.2026';
  const venueCard = $('#venueCard');
  if (venueCard) venueCard.textContent = weddingConfig.venueName;
  const footerDate = $('#footerDate');
  if (footerDate) footerDate.textContent = '08 · 08 · 2026';

  const googleLink = $('#googleCalendarLink');
  if (googleLink) {
    googleLink.href = buildGoogleCalendarUrl();
  }

  const icsBlob = buildIcsFile();
  const icsUrl = URL.createObjectURL(icsBlob);

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

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const count = 18;
  for (let index = 0; index < count; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    const left = Math.random() * 100;
    const size = 8 + Math.random() * 10;
    const delay = Math.random() * 10;
    const duration = 14 + Math.random() * 10;
    petal.style.left = `${left}%`;
    petal.style.top = `${-10 - Math.random() * 30}vh`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 0.85}px`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.opacity = '0';
    petal.style.transform = `rotate(${Math.random() * 180}deg)`;
    container.appendChild(petal);
  }
}

function initRevealAnimations() {
  const items = $$('.reveal');
  if (!items.length) return;

  // Give siblings within the same container a staggered delay so groups
  // cascade in instead of all snapping at once.
  const groups = new Map();
  items.forEach((item) => {
    const parent = item.parentElement;
    const list = groups.get(parent) || [];
    item.style.setProperty('--reveal-delay', `${list.length * 90}ms`);
    list.push(item);
    groups.set(parent, list);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach((item) => observer.observe(item));
}

function initCountdown() {
  const days = $('#days');
  const hours = $('#hours');
  const minutes = $('#minutes');
  const seconds = $('#seconds');
  const target = weddingConfig.start.getTime();

  const setDigit = (el, value) => {
    if (!el) return;
    const next = formatTwoDigits(value);
    if (el.textContent === next) return;
    el.textContent = next;
    el.classList.remove('is-rolling');
    // force reflow so the animation can replay
    void el.offsetWidth;
    el.classList.add('is-rolling');
  };

  const tick = () => {
    const delta = target - Date.now();
    const distance = Math.max(0, delta);

    const remainingDays = Math.floor(distance / 86400000);
    const remainingHours = Math.floor((distance % 86400000) / 3600000);
    const remainingMinutes = Math.floor((distance % 3600000) / 60000);
    const remainingSeconds = Math.floor((distance % 60000) / 1000);

    setDigit(days, remainingDays);
    setDigit(hours, remainingHours);
    setDigit(minutes, remainingMinutes);
    setDigit(seconds, remainingSeconds);
  };

  tick();
  setInterval(tick, 1000);
}

function getStoredRsvps() {
  try {
    const raw = localStorage.getItem(weddingConfig.rsvpStorageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredRsvp(entry) {
  const current = getStoredRsvps();
  current.unshift(entry);
  try {
    localStorage.setItem(weddingConfig.rsvpStorageKey, JSON.stringify(current));
  } catch {
    // Some browsers block storage in private or restricted modes.
  }
  return current;
}

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

async function submitRsvpToEndpoint(payload) {
  if (!weddingConfig.rsvpEndpoint) return { skipped: true };

  // Google Apps Script web apps don't return CORS headers, so we send a
  // "simple" request (text/plain, no-cors). The row still lands in the sheet;
  // the response is opaque, which is fine — we also keep a local backup.
  await fetch(weddingConfig.rsvpEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  return { ok: true };
}

function initRsvpForm() {
  const form = $('#rsvpForm');
  const status = $('#rsvpStatus');
  const submitButton = $('#submitRsvp');
  const bringingChildren = $('#bringingChildren');
  const childrenCountField = $('#childrenCountField');
  const childrenCountInput = $('#childrenCount');

  if (!form || !status || !submitButton) return;

  const syncChildrenCountState = () => {
    const showCount = bringingChildren?.value === 'Yes';
    if (childrenCountField) {
      childrenCountField.style.display = showCount ? 'grid' : 'none';
    }
    if (!showCount && childrenCountInput) {
      childrenCountInput.value = '0';
    }
  };

  bringingChildren?.addEventListener('change', syncChildrenCountState);
  syncChildrenCountState();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = buildRsvpPayload(form);
    if (!payload.fullName) {
      status.textContent = 'Please add your full name before sending.';
      status.style.color = '#8f6650';
      $('#fullName', form).focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    status.textContent = 'Saving your response...';
    status.style.color = '#8f6650';

    saveStoredRsvp(payload);

    try {
      await submitRsvpToEndpoint(payload);
      status.textContent = 'Your place has been reserved. We cannot wait to celebrate with you — Omar & Rewan';
      status.style.color = '#667c62';
      form.reset();
      $('#guestCount', form).value = '1';
      $('input[name="attendance"][value="Attending"]', form).checked = true;
      syncChildrenCountState();
    } catch (error) {
      console.warn('RSVP endpoint unavailable, stored locally instead.', error);
      status.textContent = "Your place has been reserved. If you don't hear back, feel free to message us directly too.";
      status.style.color = '#667c62';
      form.reset();
      $('#guestCount', form).value = '1';
      $('input[name="attendance"][value="Attending"]', form).checked = true;
      syncChildrenCountState();
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send RSVP';
    }
  });
}

// --- Opening unveil: the "open the evening" moment ---------------------------
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
    window.setTimeout(() => opening.remove(), 1300);
  };

  openBtn?.addEventListener('click', reveal);
  opening.addEventListener('click', (e) => { if (e.target === opening) reveal(); });

  if (reduce) reveal();
}

// --- Atmosphere: scroll progress + the evening turning to gold ---------------
function initAtmosphere() {
  const root = document.documentElement;
  const progress = $('#scrollProgress');
  const lights = $('#gardenLights');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (lights && !reduce) {
    const count = 28;
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'glight';
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${8 + Math.random() * 86}%`;
      dot.style.setProperty('--d', `${(Math.random() * 3).toFixed(2)}s`);
      dot.style.setProperty('--s', (0.55 + Math.random() * 0.95).toFixed(2));
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
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

// --- Scroll-spy side navigation ----------------------------------------------
function initScrollSpy() {
  const links = $$('.spy a');
  if (!links.length) return;
  const map = new Map(links.map((a) => [a.dataset.spy, a]));
  const sections = links
    .map((a) => document.getElementById(a.dataset.spy))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.remove('is-active'));
          map.get(entry.target.id)?.classList.add('is-active');
        }
      });
    },
    { threshold: 0, rootMargin: '-45% 0px -45% 0px' }
  );
  sections.forEach((s) => observer.observe(s));
}

// --- Photo lightbox ----------------------------------------------------------
function initLightbox() {
  const box = $('#lightbox');
  const img = $('#lightboxImg');
  const closeBtn = $('#lightboxClose');
  if (!box || !img) return;

  const open = (src, alt) => {
    img.src = src;
    img.alt = alt || '';
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  };
  const close = () => {
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  };

  $$('.venue-photo img, .kids-photo img, .story-image img').forEach((t) => {
    t.style.cursor = 'zoom-in';
    t.addEventListener('click', () => open(t.currentSrc || t.src, t.alt));
  });
  closeBtn?.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// --- Subtle micro-interactions (desktop, motion allowed) ---------------------
function initMicroInteractions() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  $$('.button').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${mx * 0.16}px, ${my * 0.2}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });

  $$('.detail-card, .calendar-card, .intro-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(720px) rotateX(${-py * 4}deg) rotateY(${px * 5}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

// --- Optional ambient music (off by default, user-activated) -----------------
function initMusic() {
  const btn = $('#musicToggle');
  const audio = $('#bgMusic');
  if (!btn || !audio) return;

  // Only reveal the control if a music file actually exists.
  fetch('Media/music.mp3', { method: 'HEAD' })
    .then((r) => { if (r.ok) btn.hidden = false; })
    .catch(() => {});

  let playing = false;
  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Play music');
      playing = false;
    } else {
      audio.play()
        .then(() => {
          playing = true;
          btn.classList.add('is-playing');
          btn.setAttribute('aria-label', 'Pause music');
        })
        .catch(() => {});
    }
  });
}

function init() {
  initStaticContent();
  createPetals();
  initRevealAnimations();
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