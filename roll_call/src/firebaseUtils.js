// src/firebaseUtils.js
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "./firebase"; // Đảm bảo bạn đã export app từ firebase.js

const db = getFirestore(app);

export async function saveUserToFirestore(uid, userData) {
    await setDoc(doc(db, "users", uid), userData);
}