importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-messaging.js');
var firebaseConfig = {
    projectId: "fmc-test-14150",
    messagingSenderId: "636475170145",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();