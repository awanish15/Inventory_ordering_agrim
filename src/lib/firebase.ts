import { initializeApp, type FirebaseApp } from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC2_BvnidISmS-jRTVSVUGG5ZgxKzoWO7Q",
    authDomain: "inventory-ordering-app-testing.firebaseapp.com",
    projectId: "inventory-ordering-app-testing",
    storageBucket: "inventory-ordering-app-testing.firebasestorage.app",
    messagingSenderId: "491094764300",
    appId: "1:491094764300:web:b55cc370c30064ad907729"
};

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig);
