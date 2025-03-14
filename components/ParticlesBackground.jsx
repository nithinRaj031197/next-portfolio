"use client";

import React, { useEffect } from "react";
import "particles.js";

const ParticlesBackground = () => {
  useEffect(() => {
    window.particlesJS.load("particles-js", "/particles-config.json");
  }, []);

  return <div id="particles-js" className="absolute top-0 left-0 w-full h-full z-[-1]"></div>;
};

export default ParticlesBackground;
