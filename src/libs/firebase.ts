import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyC9473ncXwvLIQxsOV6P_EV-EQqaeH6WK0",
    authDomain: "quizy-id.firebaseapp.com",
    projectId: "quizy-id",
    storageBucket: "quizy-id.firebasestorage.app",
    messagingSenderId: "361433021734",
    appId: "1:361433021734:web:54546978848168bc8795e7",
    measurementId: "G-BK7846LWVD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const firestore = getFirestore(app);