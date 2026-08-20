/* Orbit Decay service worker.
   The whole game is one HTML file, so a plain precache makes it work
   offline and satisfies the installability requirement. */
var VERSION = "od-v8";
var ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
              "./f-rubik-he.woff2", "./f-rubik-la.woff2", "./f-title-he.woff2", "./f-title-la.woff2"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ASSETS); }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return k === VERSION ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  // network first so a fresh deploy is picked up, cache as the fallback
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put(e.request, copy); }).catch(function () {});
      return res;
    }).catch(function () { return caches.match(e.request).then(function (m) { return m || caches.match("./index.html"); }); })
  );
});
