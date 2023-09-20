"use client";

import Navbar from "./components/Navbar";
import "./scss/index.scss";
import "./scss/globals.css";
import StyledLayout from "./components/StyledComponent";
import Loader from "./components/Loader";
import { useState } from "react";

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
          <Navbar />{" "}
        </>
      ) : (
        <Loader isLoading={isLoading} setIsLoading={handleLoaderLoaded} />
      )}
    </>
  );
}
