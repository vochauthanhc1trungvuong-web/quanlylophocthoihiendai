import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcyYK25PJpqv8Z197OswBK9P8EByyzswI",
  authDomain: "qllhthoihiendai.firebaseapp.com",
  projectId: "qllhthoihiendai",
  storageBucket: "qllhthoihiendai.firebasestorage.app",
  messagingSenderId: "534087696793",
  appId: "1:534087696793:web:9ae4e9a009577aab10d308"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


