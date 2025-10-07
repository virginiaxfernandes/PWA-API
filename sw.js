const CACHE_NAME = 'petfinder-v2';
const urlsToCache = [
    './',
    './index.html',
    './style.css', 
    './app.js',
    './manifest.json',
    './images/icon-72x72.jpg',
    './images/icon-96x96.jpg',
    './images/icon-144x144.jpg',
    './images/rick-golden.jpg',
    './images/lana-frajola.jpg',
    './images/bob-bulldog.jpg', 
    './images/lulu.jpg'
];

self.addEventListener('install', event => {
    console.log('✅ Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache opened');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('❌ Cache failed:', error);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('✅ Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('✅ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

