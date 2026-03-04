import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAz2Z4ndA6HnDTToMAA0yswUyrVAQUXvpo",
  authDomain: "kay7-45783.firebaseapp.com",
  projectId: "kay7-45783",
  storageBucket: "kay7-45783.firebasestorage.app",
  messagingSenderId: "611820331957",
  appId: "1:611820331957:web:d37a668dad4f4b40bbeffc",
  measurementId: "G-PKCN41MJXT"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

export { auth, firestore, storage };
