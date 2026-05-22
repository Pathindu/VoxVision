// ─── VoxVision Service Worker ───────────────────────────────────────────────
// Strategy: Cache the app shell only.
// NEVER cache: Gemini API, backend API calls, image uploads, TTS audio.
// These are all dynamic and must always go to the network.

const CACHE_NAME = 'voxvision-v2'; // 👈 Bump this (v2, v3...) every time you redeploy

const SHELL_FILES = [
  '/',
  '/index.html',
];

// ─── Install: cache the app shell ───────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_FILES);
    })
  );
  // Force this SW to become active immediately (no waiting)
  self.skipWaiting();
});

// ─── Activate: delete old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ─── Fetch: smart routing ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Never intercept Gemini API calls
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // 2. Never intercept your Render backend (image upload, TTS, cash/doc processing)
  if (url.hostname.includes('onrender.com')) {
    return;
  }

  // 3. Never cache POST requests (image uploads to backend)
  if (event.request.method !== 'GET') {
    return;
  }

  // 4. Static JS/CSS assets (CRA gives them hashed names, safe to cache forever)
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          // Only cache valid responses
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // 5. HTML navigation requests — network first, fallback to index.html
  //    This keeps React Router working offline (shows app shell)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 6. Everything else — just fetch from network, no caching
  // (covers blob: URLs for audio, camera streams, etc.)
});
