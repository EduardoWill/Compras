// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCrJtROGq2jaHlBJz5lbfMckBX1x9N-DU",
  authDomain: "listacompras-cb9c2.firebaseapp.com",
  projectId: "listacompras-cb9c2",
  storageBucket: "listacompras-cb9c2.firebasestorage.app",
  messagingSenderId: "513870335959",
  appId: "1:513870335959:web:555e8fb05593d8a5d34592",
  measurementId: "G-GPKJS64503"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);