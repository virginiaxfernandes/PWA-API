const CACHE_NAME = 'petfinder-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css', 
    '/app.js',
    '/manifest.json',
    '/images/icon-72x72.jpg',
    '/images/icon-96x96.jpg',
    '/images/icon-144x144.jp'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
