// Importiere Firebase und Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyCUznRu9r4_TF4bUoFHA7ABc9s6HchcFCQ",
    authDomain: "veschper-10337.firebaseapp.com",
    projectId: "veschper-10337",
    storageBucket: "veschper-10337.appspot.com",
    messagingSenderId: "669264661102",
    appId: "1:669264661102:web:d00ebc98e472515058f47f",
    measurementId: "G-ZE987JLHFT"
};


// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Die `db`-Variable global verfügbar machen
window.db = db;
