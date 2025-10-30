import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export async function ensureUserDoc(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const initialData = { folders: {}, free: [] };
    await setDoc(ref, initialData);
    return initialData;
  }
  return snap.data();
}

export function subscribeUserDoc(uid: string, callback: (data: any) => void) {
  const ref = doc(db, "users", uid);
  const unsub = onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
  return unsub;
}

export async function saveUserDoc(uid: string, data: any) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, data);
}
