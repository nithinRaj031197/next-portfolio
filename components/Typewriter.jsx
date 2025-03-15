"use client";

import { useState, useEffect } from "react";

const Typewriter = ({ words, typeSpeed = 100, deleteSpeed = 50, delaySpeed = 1500 }) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const word = words[index];
    const typingDelay = isDeleting ? deleteSpeed : typeSpeed;
    const timeout = setTimeout(() => {
      if (!isDeleting && text === word) {
        setTimeout(() => setIsDeleting(true), delaySpeed);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      } else {
        setText((prev) => (isDeleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1)));
      }
    }, typingDelay);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, words, typeSpeed, deleteSpeed, delaySpeed]);

  useEffect(() => {
    const cursorBlink = setInterval(() => setCursorVisible((prev) => !prev), 500);
    return () => clearInterval(cursorBlink);
  }, []);

  return (
    <span className="text-[#45e7ec] font-semibold">
      {text}
      <span className={`text-white ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>_</span>
    </span>
  );
};

export default Typewriter;
