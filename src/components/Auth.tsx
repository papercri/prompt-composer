"use client";
import React, { JSX, useState } from "react";
import { User } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginScreen from "./LoginScreen";
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
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-[#F7ECE1] to-[#EDE3E9] text-[#242038]">
      <Header user={user} onShowInfo={() => setShowInfo(true)} />
      <main className="flex-1 flex flex-col pt-20 w-full overflow-auto">
        {children(user)}
      </main>
      <Footer />
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}
