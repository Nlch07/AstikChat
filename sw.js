self.addEventListener('install', (e) => {
  console.log('Service Worker установлен');
});

self.addEventListener('fetch', (event) => {
  // Позволяет приложению открываться даже при плохом интернете
});