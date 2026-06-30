"use client";
import React, { JSX, useState } from "react";
import { User } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginScreen from "@/components/auth/LoginScreen";
import InfoModal from "./InfoModal";

export default function Auth({
  children,
}: {
  children: (user: User) => JSX.Element;
}) {
  const { user } = useAuth();
  const [showInfo, setShowInfo] = useState(false);

  if (!user) return <LoginScreen />;

  return (
    <div
      className="flex flex-col min-h-screen w-full bg-linear-to-br text-(--foreground)"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, var(--light), var(--background))",
      }}>
      <Header user={user} onShowInfo={() => setShowInfo(true)} />
      <main className="flex-1 flex flex-col pt-20 w-full overflow-auto max-w-\[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        {children(user)}
      </main>
      <Footer />
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}
