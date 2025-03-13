"use client";

import { useState } from "react";
import LogoLoader from "@/components/LogoLoader";
import Header from "@/components/Header";
import "@/styles/main.css";

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
          <div className="video-container">
            <video autoPlay loop muted className="background-video">
              <source src="/northern_lights_bg.mp4" type="video/mp4" />
            </video>
            <main className="mt-16 min-h-screen">{children}</main>
          </div>
        </>
      )}
    </>
  );
}
