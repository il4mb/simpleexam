const CACHE_NAME = "edudoexam-cache-v1";

// daftar asset yang dicache ketika install
const ASSETS = [
    "/",
    "/icon-192x192.png",
    "/icon-512x512.png",
    "/mp3/quiz-master.mp3",
    "/models/age_gender_model-shard1",
    "/models/age_gender_model-weights_manifest.json",
    "/models/face_expression_model-shard1",
    "/models/face_expression_model-weights_manifest.json",
    "/models/face_landmark_68_model-shard1",
    "/models/face_landmark_68_model-weights_manifest.json",
    "/models/face_landmark_68_tiny_model-shard1",
    "/models/face_landmark_68_tiny_model-weights_manifest.json",
    "/models/face_recognition_model-shard1",
    "/models/face_recognition_model-shard2",
    "/models/face_recognition_model-weights_manifest.json",
    "/models/mtcnn_model-shard1",
    "/models/mtcnn_model-weights_manifest.json",
    "/models/ssd_mobilenetv1_model-shard1",
    "/models/ssd_mobilenetv1_model-shard2",
    "/models/ssd_mobilenetv1_model-weights_manifest.json",
    "/models/tiny_face_detector_model-shard1",
    "/models/tiny_face_detector_model-weights_manifest.json"
];

// install = precache
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// activate = hapus cache lama
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

// fetch = ambil dari cache, fallback ke network
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request);
        })
    );
});
