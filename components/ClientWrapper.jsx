"use client";

import { useState } from "react";
import LogoLoader from "@/components/LogoLoader";
import Header from "@/components/Header";

export default function ClientWrapper({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && (
        <main className="bg-[#0b192e] min-h-screen">
          <LogoLoader onComplete={() => setIsLoaded(true)} />
        </main>
      )}
      {isLoaded && (
        <>
          <main className="mt-16">{children}</main>
        </>
      )}
    </>
  );
}
