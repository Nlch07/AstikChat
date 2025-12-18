// Название кэша для работы в офлайне
const CACHE_NAME = 'astik-chat-v1';

// Установка Service Worker и кэширование базовых файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

// Активация и удаление старых кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Перехват запросов (позволяет приложению открываться быстрее)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// --- ЛОГИКА УВЕДОМЛЕНИЙ ---

// Слушатель Push-событий (когда сервер присылает уведомление)
self.addEventListener('push', function(event) {
  let data = { title: 'Новое сообщение', body: 'Зайдите в AstikChat' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Новое сообщение', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/5962/5962463.png', // Иконка в уведомлении
    badge: 'https://cdn-icons-png.flaticon.com/512/5962/5962463.png', // Маленькая иконка в строке состояния
    vibrate: [200, 100, 200], // Вибрация
    data: {
      url: self.location.origin // Ссылка, которая откроется при клике
    },
    actions: [
      { action: 'open', title: 'Читать' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Слушатель клика по уведомлению
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Закрываем уведомление после клика

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Если чат уже открыт во вкладке — переключаемся на неё
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Если закрыт — открываем заново
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
