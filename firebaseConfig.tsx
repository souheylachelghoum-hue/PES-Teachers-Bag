import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDv9ajOo49KCRM0KF0oNTwb5UzZPB9CKMo",
    authDomain: "eps-teachers-bag.firebaseapp.com",
    projectId: "eps-teachers-bag",
    storageBucket: "eps-teachers-bag.firebasestorage.app",
    messagingSenderId: "220162148178",
    appId: "1:220162148178:web:a51d333a025f6af02bdc8b",
    measurementId: "G-NL71BBDQ3X"
};

// تهيئة Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
