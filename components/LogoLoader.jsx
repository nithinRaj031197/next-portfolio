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
    }, 4000);
  }, [onComplete]);

  if (!isAnimating) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 1, 0] }}
      transition={{ duration: 4, ease: "easeInOut" }}
      className="fixed inset-0 flex items-center justify-center bg-[#0b192e] z-[9999]"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 1,
          repeat: 3,
          repeatType: "reverse",
        }}
      >
        <Logo className="w-[10rem] h-[10rem]" />
      </motion.div>
    </motion.div>
  );
};

export default LogoLoader;
