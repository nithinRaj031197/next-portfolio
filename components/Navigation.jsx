import React from "react";
import "@/styles/navigation.css";

const Navigation = () => {
  return (
    <ul className="flex justify-center items-center gap-x-8">
      <li className="link">
        <a href="#about" aria-label="About Section">
          About
        </a>
      </li>
      <li className="link">
        <a href="#experience" aria-label="Experience Section">
          Experience
        </a>
      </li>
      <li className="link">
        <a href="#work" aria-label="Work Section">
          Work
        </a>
      </li>
    </ul>
  );
};

export default Navigation;
