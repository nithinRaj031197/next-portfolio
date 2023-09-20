"use client";

import Navbar from "./components/Navbar";
import "./scss/index.scss";
import "./scss/globals.css";
import StyledLayout from "./components/StyledComponent";
import Loader from "./components/Loader";
import { useState } from "react";
import SocialIcons from "./components/SocialIcons";
import Hero from "./sections/Hero";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleLoaderLoaded = () => {
    setIsLoading(false);
    setTimeout(() => setShowContent(true), 450);
  };

  return (
    <>
      {showContent ? (
        <>
          <StyledLayout />
          <Navbar />
          <SocialIcons />
          <main>
            <Hero />
          </main>
        </>
      ) : (
        <Loader isLoading={isLoading} setIsLoading={handleLoaderLoaded} />
      )}
    </>
  );
}
