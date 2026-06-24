// Service worker "kamikaze" — efface tout cache et se désinstalle.
// (L'ancien sw.js mettait la page en cache POUR TOUJOURS, même après mise à jour du site.
// C'est pour ça que les anciennes versions "marchaient" et les nouvelles non.)

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.registration.unregister();
    }).then(function() {
      return self.clients.matchAll();
    }).then(function(clientsList) {
      clientsList.forEach(function(client) { client.navigate(client.url); });
    })
  );
});
