// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHXa99ZjPzdzwQzcqT9haWrGv300Y42Zo",
  authDomain: "imdb-9afba.firebaseapp.com",
  projectId: "imdb-9afba",
  storageBucket: "imdb-9afba.firebasestorage.app",
  messagingSenderId: "488764684248",
  appId: "1:488764684248:web:dd7c1f1f365958d49e24ad",
  measurementId: "G-X7SS4PYMHV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
