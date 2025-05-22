const CACHE_NAME = 'valora-producto-ia-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // '/index.tsx', // index.tsx y otros módulos JS/TSX se cargan dinámicamente
  // '/App.tsx',
  // '/types.ts',
  // '/constants.tsx',
  // '/services/geminiService.ts',
  // '/components/WebcamCapture.tsx',
  // '/components/Footer.tsx',
  // '/components/LoadingIndicator.tsx',
  // '/screens/ProductCaptureScreen.tsx',
  // '/screens/ConfirmationConditionScreen.tsx',
  // '/screens/ValuationResultsScreen.tsx',
  // '/screens/ChecklistScreen.tsx',
  // Podrías añadir más archivos específicos aquí o dejar que el fetch los cachee dinámicamente.
  // La CDN de Tailwind y las fuentes de Google se cachearán por el navegador o si se accede a ellas.
  // '/icons/icon-192x192.png', // Asumiendo que crearás estos iconos
  // '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Cachear los recursos iniciales. Ser más selectivo aquí es importante.
        // Por ahora, solo cacheamos lo esencial para el shell de la app.
        return cache.addAll([
          '/',
          '/index.html',
          // Considerar añadir aquí los iconos una vez creados
        ]);
      })
      .catch(err => {
        console.error('Failed to open cache or add urls: ', err);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Importante: Clona la solicitud. Una solicitud es un stream y
        // solo puede ser consumida una vez. Necesitamos una para el navegador
        // y otra para la caché.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Comprueba si recibimos una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              // No cachear recursos de terceros si no es 'basic' o si falla.
              // Para las CDNs (esm.sh, tailwind, fonts), el navegador las gestiona bien.
              return response;
            }

            const responseToCache = response.clone();

            // No cachear dinámicamente todos los recursos de esm.sh o Google Fonts
            // ya que pueden ser muchos y cambiar. El caché del navegador es suficiente.
            // Solo considera cachear tus propios assets si es necesario.
            /*
            if (event.request.url.startsWith(self.location.origin)) { // Cache only own assets
                caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(event.request, responseToCache);
                });
            }
            */
            return response;
          }
        );
      })
    .catch(err => {
        console.error('Fetch error:', err);
        // Podrías devolver una página offline genérica aquí si es necesario
        // return caches.match('/offline.html'); 
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
