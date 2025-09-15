// Service Worker для обработки push-уведомлений
self.addEventListener('push', (event) => {
    const payload = event.data ? event.data.text() : 'Привет от Зевса! Выполни свой ритуал.';
    const title = 'Режим Зевса';
    const options = {
        body: payload,
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Lightning_icon.svg',
        badge: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Lightning_icon.svg',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow('/');
            })
    );
});
