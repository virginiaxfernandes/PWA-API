const CACHE_NAME = 'petfinder-v1';
const urlsToCache = [
    '/PWA-API/',
    '/PWA-API/index.html',
    '/PWA-API/style.css',
    '/PWA-API/app.js',
    '/PWA-API/manifest.json',
    '/PWA-API/images/icon-72x72.jpg',
    '/PWA-API/images/icon-96x96.jpg',
    '/PWA-API/images/icon-144x144.jpg',
    '/PWA-API/images/rick-golden.jpg',
    '/PWA-API/images/lana-frajola.jpg',
    '/PWA-API/images/bob-bulldog.jpg',
    '/PWA-API/images/lulu.jpg'
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

