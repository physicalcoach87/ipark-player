self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '부산아이파크';
  const options = {
    body: data.body || '새 알림이 있습니다.',
    icon: '/ipark-player/icon-192.png',
    badge: '/ipark-player/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: 'https://physicalcoach87.github.io/ipark-player/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
