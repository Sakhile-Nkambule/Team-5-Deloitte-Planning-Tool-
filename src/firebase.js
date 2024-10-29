// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAg80QB4nnB-xUjgWnjWXL1vYUUpQPLd0s",
  authDomain: "planning-tool-c1843.firebaseapp.com",
  projectId: "planning-tool-c1843",
  storageBucket: "planning-tool-c1843.appspot.com",
  messagingSenderId: "58299939109",
  appId: "1:58299939109:web:dc6a42aaaa3c8f160942cc",
  measurementId: "G-81GVG9ZC5G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
