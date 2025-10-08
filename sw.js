const CACHE_NAME = 'petfinder-v1';
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
    console.log('🔄 Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Todos os recursos em cache');
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.log('✅ Service Worker ativado!');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

