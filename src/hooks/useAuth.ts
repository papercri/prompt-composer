import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { watchAuthState } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = watchAuthState((u) => setUser(u));
    return () => unsub();
  }, []);

  return { user };
}
