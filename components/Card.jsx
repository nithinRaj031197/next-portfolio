import React from "react";

const Card = ({ color, children, className }) => {
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const x = e.clientX - card.getBoundingClientRect().left;
    const y = e.clientY - card.getBoundingClientRect().top;

    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
  };

  return (
    <div
      className={`relative w-80 h-96 bg-gray-800 rounded-2xl overflow-hidden group ${className}`}
      style={{ "--clr": color }}
      onMouseMove={handleMouseMove}
    >
      {/* Glow effect */}
      <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(var(--clr),transparent,transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 top-[var(--y)] left-[var(--x)] -translate-x-1/2 -translate-y-1/2" />

      {/* Card content */}
      <div className="absolute inset-1 bg-gray-900/50 rounded-2xl flex items-center justify-center p-4 text-white">{children}</div>
    </div>
  );
};

export default Card;
