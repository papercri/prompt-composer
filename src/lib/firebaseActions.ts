import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

type DataShape = {
  folders: Record<string, string[]>;
  free: string[];
};

export async function ensureUserDoc(uid: string): Promise<DataShape> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const initialData: DataShape = { folders: {}, free: [] };
    await setDoc(ref, initialData);
    return initialData;
  }
  return snap.data() as DataShape;
}

export function subscribeUserDoc(uid: string, callback: (data: DataShape) => void) {
  const ref = doc(db, "users", uid);
  const unsub = onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data() as DataShape);
  });
  return unsub;
}

export async function saveUserDoc(uid: string, data: DataShape) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, data);
}