import React from "react";
import "@/styles/navigation.css";

const Navigation = () => {
  const handleSmoothScroll = (event, targetId) => {
    event.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <ul className="flex justify-center items-center gap-x-8">
      <li className="link" onClick={(e) => handleSmoothScroll(e, "about")}>
        <a href="#about" aria-label="About Section">
          About
        </a>
      </li>
      <li className="link" onClick={(e) => handleSmoothScroll(e, "experience")}>
        <a href="#experience" aria-label="Experience Section">
          Experience
        </a>
      </li>
      <li className="link" onClick={(e) => handleSmoothScroll(e, "projects")}>
        <a href="#projects" aria-label="Projects Section">
          Projects
        </a>
      </li>
    </ul>
  );
};

export default Navigation;
