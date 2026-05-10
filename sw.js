/* ════════════════════════════════════════════════════════════
   부산아이파크 선수앱 — Service Worker (Web Push)
   카톡처럼 앱이 닫혀있어도 푸시/소리/진동 알림이 울리도록 처리.
   배치 위치: ipark-player 저장소 루트 (sw.js)
   scope: '/ipark-player/' (GitHub Pages 경로)
   ════════════════════════════════════════════════════════════ */
const SW_VERSION = 'ipark-sw-v1.0.0';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// ── 푸시 수신
self.addEventListener('push', (event) => {
  let data = { title: '부산아이파크', body: '새 알림이 도착했습니다.' };
  try {
    if (event.data) data = event.data.json();
  } catch (_) {
    try { data.body = event.data.text(); } catch (_) {}
  }

  const title = data.title || '부산아이파크';
  const options = {
    body:    data.body || '',
    icon:    '/ipark-player/icon-192.png',
    badge:   '/ipark-player/badge-72.png',
    // ⚡ 진동 패턴 — iOS/Android 모두 지원, 카톡 느낌
    vibrate: [250, 120, 250, 120, 400],
    // 시스템 알림음 사용(OS 기본) — iOS는 사용자 알림 사운드 자동 적용
    silent:  false,
    requireInteraction: false,   // 사용자가 끄지 않아도 자동 사라짐
    renotify: true,              // 동일 tag여도 다시 진동/소리
    tag:      data.tag || 'ipark-notif',
    timestamp: Date.now(),
    data: {
      url:  data.url || '/ipark-player/',
      raw:  data,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .catch(err => console.warn('showNotification fail', err))
  );
});

// ── 알림 클릭 → 선수앱 열기 (이미 열려있으면 포커스)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/ipark-player/';

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of allClients) {
      try {
        if (c.url.includes('/ipark-player') && 'focus' in c) {
          await c.focus();
          if ('navigate' in c) c.navigate(targetUrl);
          return;
        }
      } catch (_) {}
    }
    if (clients.openWindow) {
      await clients.openWindow(targetUrl);
    }
  })());
});

// ── 구독 만료 시 자동 재구독 (선택)
self.addEventListener('pushsubscriptionchange', (event) => {
  // 새 endpoint를 다시 받아 서버에 저장 — 클라이언트 코드에서 재구독 처리하므로 여기선 로깅만
  console.log('pushsubscriptionchange — 클라이언트가 재구독 필요');
});
