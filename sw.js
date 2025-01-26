self.addEventListener('fetch', event => {
    if (event.request.url.endsWith('/tts') && event.request.method === 'POST') {
        event.respondWith(
            event.request.clone().json().then(data => {
                return clients.matchAll().then(clients => {
                    return clients[0].handleAPIRequest(event.request.clone());
                });
            })
        );
    }
});
