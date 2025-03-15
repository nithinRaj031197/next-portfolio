"use client";

import { useEffect, useState } from "react";
import { LuGithub } from "react-icons/lu";
import { SlSocialLinkedin } from "react-icons/sl";

const SocialLinks = () => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleFocus = () => setIsHovered(false);
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="fixed bottom-0 left-[2rem] flex flex-col justify-center items-center gap-5">
      <ul className="flex flex-col gap-5">
        <li
          className="social-links cursor-pointer hover:text-[#45e7ec]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <a href="https://github.com/nithinRaj031197/" target="_blank" rel="noopener noreferrer">
            <LuGithub size={30} />
          </a>
        </li>
        <li
          className="social-links cursor-pointer hover:text-[#45e7ec]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <a href="https://www.linkedin.com/in/nithin-raj-831108214/" target="_blank" rel="noopener noreferrer">
            <SlSocialLinkedin size={28} />
          </a>
        </li>
      </ul>

      <div
        className={`w-1 h-[20vh] rounded-t-2xl stick transition-all duration-500 ${
          isHovered ? " bg-[#45e7ec] shadow-[0px_0px_15px_4px_#45e7ec] backdrop-blur-sm" : " bg-white"
        }`}
      ></div>
    </div>
  );
};

export default SocialLinks;
