"use client";

import Navbar from "./components/Navbar";
import "./scss/index.scss";
import "./scss/globals.css";
import StyledLayout from "./components/StyledComponent";
import Loader from "./components/Loader";
import { useState } from "react";
import SocialIcons from "./components/SocialIcons";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Experience from "./sections/Experience";
import Contact from "./sections/Contact";
import { StarsCanvas } from "./canvas";
import Footer from "./components/Footer";
import Project from "./sections/Project";

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
            <div id=""></div>
            <Hero />

            <div id="about"></div>
            <About />

            <div id="experience"></div>
            <Experience />

            {/* <div id="work"></div> */}
            <Project />

            <div id="contact" className="relative z-0">
              <Contact />
              <StarsCanvas />
            </div>

            <Footer />
          </main>
        </>
      ) : (
        <Loader isLoading={isLoading} setIsLoading={handleLoaderLoaded} />
      )}
    </>
  );
}
