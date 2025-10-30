"use client";

// app/page.tsx
import Auth from "@/components/Auth";
import Composer from "@/components/Composer";

export default function Page() {
  return (
    <Auth>
      {(user) => <Composer user={user} />}
    </Auth>
  );
}
