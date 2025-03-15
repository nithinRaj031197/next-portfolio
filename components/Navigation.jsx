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
      <li className="link">
        <a href="#about" aria-label="About Section" onClick={(e) => handleSmoothScroll(e, "about")}>
          About
        </a>
      </li>
      <li className="link">
        <a href="#experience" aria-label="Experience Section" onClick={(e) => handleSmoothScroll(e, "experience")}>
          Experience
        </a>
      </li>
      <li className="link">
        <a href="#projects" aria-label="Projects Section" onClick={(e) => handleSmoothScroll(e, "projects")}>
          Projects
        </a>
      </li>
    </ul>
  );
};

export default Navigation;
