"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";

const LogoLoader = ({ onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsAnimating(false);
      onComplete();
    }, 4000); // Stops after 4 seconds
  }, [onComplete]);

  if (!isAnimating) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 1, 0] }} // Fades out at the end
      transition={{ duration: 4, ease: "easeInOut" }}
      className="fixed inset-0 flex items-center justify-center bg-[#0b192e] z-[9999]"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{
          y: [0, -20, 0], // Bounces up and down
        }}
        transition={{
          duration: 1, // Bounce duration
          repeat: 3, // Repeats 3 times to match 4 seconds total
          repeatType: "reverse",
        }}
      >
        <Logo className="w-[10rem] h-[10rem]" />
      </motion.div>
    </motion.div>
  );
};

export default LogoLoader;
