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