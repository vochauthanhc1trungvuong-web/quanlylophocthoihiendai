import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBaNHC68XKFyjqqxfCOKE2XoasBVC_nuZM",
  authDomain: "quanlylophoc-e67d2.firebaseapp.com",
  projectId: "quanlylophoc-e67d2",
  storageBucket: "quanlylophoc-e67d2.firebasestorage.app",
  messagingSenderId: "554992971133",
  appId: "1:554992971133:web:ab88402bfe23f199063014"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
