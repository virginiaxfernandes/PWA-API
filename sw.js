const CACHE_NAME = 'petfinder-v2';
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
    console.log('🔄 Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Service Worker: Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker: Todos os recursos em cache');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker: Erro no cache', error);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('✅ Service Worker: Ativado');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Removendo cache antigo', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Pronto para controlar clientes');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('📦 Service Worker: Servindo do cache', event.request.url);
                    return response;
                }
                
                console.log('🌐 Service Worker: Buscando da rede', event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        if (!event.request.url.includes('api.thedogapi') && 
                            !event.request.url.includes('api.thecatapi') &&
                            event.request.url.startsWith(self.location.origin)) {
                            return caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, networkResponse.clone());
                                    return networkResponse;
                                });
                        }
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('❌ Service Worker: Erro no fetch', error);
                        if (event.request.destination === 'document') {
                            return caches.match('/PWA-API/index.html');
                        }
                    });
            })
    );
});

