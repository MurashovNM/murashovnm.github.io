importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-messaging.js');

var firebaseConfig = {
  apiKey: "AIzaSyCRXnah5DNJzyr6DhSRXugUgGY8r9ZgqpY",
  authDomain: "fmc-test-14150.firebaseapp.com",
  projectId: "fmc-test-14150",
  storageBucket: "fmc-test-14150.appspot.com",
  messagingSenderId: "636475170145",
  appId: "1:636475170145:web:389d4fb749693008937920"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Customize notification handler
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Handling background message', payload);

  // Copy data object to get parameters in the click handler
  payload.data.data = JSON.parse(JSON.stringify(payload.data));

  return self.registration.showNotification(payload.data.title, payload.data);
});

self.addEventListener('notificationclick', function(event) {
  const target = event.notification.data.click_action || '/';
  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function(clientList) {
    // clientList always is empty?!
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url === target && 'focus' in client) {
        return client.focus();
      }
    }

    return clients.openWindow(target);
  }));
});

//self.addEventListener('message', function(event) {
//  let opts = event.data.json();
//
//  if (opts.data && opts.data.action) {
//    event.waitUntil(
//      clients.matchAll().then(
//        function(windowClients) {
//          for (let i = 0; i < windowClients.length; i += 1) {
//            windowsClients[i].postMessage(opts.data);
//          }
//        }
//      )
//    );
//  }
//});


self.addEventListener('push', function(event) {
    console.log('GET', 'push')
    console.log('EVENT', event)
//    const analyticsPromise = pushReceivedTracking();
//    const pushInfoPromise = fetch('/api/get-more-data')
//    .then(function(response) {
//        return response.json();
//    })
//    .then(function(response) {
//        const title = response.data.userName + ' says...';
//        const message = response.data.message;
//
//        self.registration.showNotification(title, {
//        body: message
//        });
//    });
//
//    const promiseChain = Promise.all([
//    analyticsPromise,
//    pushInfoPromise
//    ]);
//
//    event.waitUntil(promiseChain);
});