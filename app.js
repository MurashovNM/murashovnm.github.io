// Firebase Configurations
var firebaseConfig = {
  apiKey: "AIzaSyCRXnah5DNJzyr6DhSRXugUgGY8r9ZgqpY",
  authDomain: "fmc-test-14150.firebaseapp.com",
  projectId: "fmc-test-14150",
  storageBucket: "fmc-test-14150.appspot.com",
  messagingSenderId: "636475170145",
  appId: "1:636475170145:web:389d4fb749693008937920"
};

// Initializing Firebase App
firebase.initializeApp(firebaseConfig);

var bt_register = $('#register');
var bt_delete = $('#delete');
var token = $('#token');
var form = $('#notification');
var massage_id = $('#massage_id');
var massage_row = $('#massage_row');

var info = $('#info');
var info_message = $('#info-message');

var alert = $('#alert');
var alert_message = $('#alert-message');

var input_body = $('#body');
var timerId = setInterval(setNotificationDemoBody, 10000);

function setNotificationDemoBody() {
    if (input_body.val().search(/^It's sent today at \d\d:\d\d$/i) !== -1) {
        var now = new Date();
        input_body.val('It\'s sent today at ' + now.getHours() + ':' + addZero(now.getMinutes()));
    } else {
        clearInterval(timerId);
    }
}

function addZero(i) {
    return i > 9 ? i : '0' + i;
}

setNotificationDemoBody();
resetUI();

if (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'localStorage' in window &&
    'fetch' in window &&
    'postMessage' in window
) {
    var messaging = firebase.messaging();

    // already granted
    if (Notification.permission === 'granted') {
        getToken();
    }

    // get permission on subscribe only once
    bt_register.on('click', function() {
        getToken();
    });

    bt_delete.on('click', function() {
        // Delete Instance ID token.
        messaging.getToken()
            .then(function(currentToken) {
                messaging.deleteToken(currentToken)
                    .then(function() {
                        console.log('Token deleted');
                        setTokenSentToServer(false);
                        // Once token is deleted update UI.
                        resetUI();
                    })
                    .catch(function(error) {
                        showError('Unable to delete token', error);
                    });
            })
            .catch(function(error) {
                showError('Error retrieving Instance ID token', error);
            });
    });

    // handle catch the notification on current page
    messaging.onMessage(function(payload) {

        console.log('Message received', payload);

        if (payload.data.action && payload.data.action === 'close') {
            console.log('Message received', 'CLOSE');
        } else {
            info.show();
            info_message
                .text('')
                .append('<strong>'+payload.data.title+'</strong>')
                .append('<em>'+payload.data.body+'</em>');

            // register fake ServiceWorker for show notification on mobile devices
            navigator.serviceWorker.register('/firebase-messaging-sw.js');
            Notification.requestPermission(function(permission) {
                if (permission === 'granted') {
                    navigator.serviceWorker.ready.then(function(registration) {
                      // Copy data object to get parameters in the click handler
                      payload.data.data = JSON.parse(JSON.stringify(payload.data));

                      registration.showNotification(payload.data.title, payload.data);
                    }).catch(function(error) {
                        // registration failed :(
                        showError('ServiceWorker registration failed', error);
                    });
                }
            });
        }

    });

    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(function() {
        messaging.getToken()
            .then(function(refreshedToken) {
                console.log('Token refreshed');
                // Send Instance ID token to app server.
                sendTokenToServer(refreshedToken);
                updateUIForPushEnabled(refreshedToken);
            })
            .catch(function(error) {
                showError('Unable to retrieve refreshed token', error);
            });
    });

} else {
    if (!('Notification' in window)) {
        showError('Notification not supported');
    } else if (!('serviceWorker' in navigator)) {
        showError('ServiceWorker not supported');
    } else if (!('localStorage' in window)) {
        showError('LocalStorage not supported');
    } else if (!('fetch' in window)) {
        showError('fetch not supported');
    } else if (!('postMessage' in window)) {
        showError('postMessage not supported');
    }

    console.warn('This browser does not support desktop notification.');
    console.log('Is HTTPS', window.location.protocol === 'https:');
    console.log('Support Notification', 'Notification' in window);
    console.log('Support ServiceWorker', 'serviceWorker' in navigator);
    console.log('Support LocalStorage', 'localStorage' in window);
    console.log('Support fetch', 'fetch' in window);
    console.log('Support postMessage', 'postMessage' in window);

    updateUIForPushPermissionRequired();
}

function getToken() {
    messaging.requestPermission()
        .then(function() {
            // Get Instance ID token. Initially this makes a network call, once retrieved
            // subsequent calls to getToken will return from cache.
            messaging.getToken()
                .then(function(currentToken) {

                    if (currentToken) {
                        sendTokenToServer(currentToken);
                        updateUIForPushEnabled(currentToken);
                    } else {
                        showError('No Instance ID token available. Request permission to generate one');
                        updateUIForPushPermissionRequired();
                        setTokenSentToServer(false);
                    }
                })
                .catch(function(error) {
                    showError('An error occurred while retrieving token', error);
                    updateUIForPushPermissionRequired();
                    setTokenSentToServer(false);
                });
        })
        .catch(function(error) {
            showError('Unable to get permission to notify', error);
        });
}

// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer(currentToken)) {
        console.log('Sending token to server...');
        // send current token to server
        //$.post(url, {token: currentToken});
        setTokenSentToServer(currentToken);
    } else {
        console.log('Token already sent to server so won\'t send it again unless it changes');
    }
}

function isTokenSentToServer(currentToken) {
    return window.localStorage.getItem('sentFirebaseMessagingToken') === currentToken;
}

function setTokenSentToServer(currentToken) {
    if (currentToken) {
        window.localStorage.setItem('sentFirebaseMessagingToken', currentToken);
    } else {
        window.localStorage.removeItem('sentFirebaseMessagingToken');
    }
}

function updateUIForPushEnabled(currentToken) {
    console.log(currentToken);
    token.text(currentToken);
    bt_register.hide();
    bt_delete.show();
    form.show();
}

function resetUI() {
    token.text('');
    bt_register.show();
    bt_delete.hide();
    form.hide();
    massage_row.hide();
    info.hide();
}

function updateUIForPushPermissionRequired() {
    bt_register.attr('disabled', 'disabled');
    resetUI();
}

function showError(error, error_data) {
    alert.show();

    if (typeof error_data !== "undefined") {
        alert_message.html(error + '<br><pre>' + JSON.stringify(error_data) + '</pre>');
        console.error(error, error_data);
    } else {
        alert_message.html(error);
        console.error(error);
    }
}

navigator.serviceWorker.addEventListener('message', function(event) {
    console.log('close event', event)
    var data = event.data["firebase-messaging-msg-data"].data

    if (data && data.action && data.action === 'close') {
        closeNotification(event.data["firebase-messaging-msg-data"].data.messageId);
    }
});

function closeNotification(id) {
    navigator.serviceWorker.ready.then(function(reg) {
        reg.getNotifications().then(function(notifications) {
            for (let i = 0; i < notifications.length; i += 1) {

                console.log('ntf', notifications[i])

                if (
                    notifications[i].data &&
                    notifications[i].data.messageId &&
                    notifications[i].data.messageId === id
                ) {
                    notifications[i].close();
                }
            }
        });
    });
}


// Registering Service worker
//if ('serviceWorker' in navigator) {
//    navigator.serviceWorker.register('./sw.js').then(res => {
//        console.log("Register Success");
//        messaging.useServiceWorker(res);
//    }).catch(e => {
//        console.log(e);
//    });
//}

// Subscribing to push Notifications
//const subscribe = () => {
//    const token = document.getElementById('token');
//    // getting PushNotification permission from browser
//    Notification.requestPermission().then(permission => {
//        if (permission == "granted") {
//            // if Permission is allowed then getting firebase messanging token from firebase
//            messaging.getToken().then(currentToken => {
//                console.log(currentToken);
//                // displaying token in index file
//                token.textContent = currentToken;
//            });
//        } else {
//            token.textContent = "Permission not granted";
//        }
//    }).catch(e=>{
//        token.textContent=e;
//    });
//};
