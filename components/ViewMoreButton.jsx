"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { TiArrowRight } from "react-icons/ti";
import Link from "next/link";

const ViewMoreButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href="/projects" passHref>
      <motion.div
        className="relative flex items-center mt-8 text-cyan-400 text-lg cursor-pointer"
        whileHover={{ x: 10 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="relative">
          <p className="uppercase text-sm font-semibold">View More Projects</p>
          <motion.div
            className="absolute left-0 bottom-0 h-[2px] bg-cyan-400 w-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </span>

        <span className="ml-2">
          {isHovered ? (
            <TiArrowRight size={22} />
          ) : (
            <motion.div
              animate={{
                x: [-3, 3, -3],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex"
            >
              <MdOutlineKeyboardArrowRight size={22} />
              <MdOutlineKeyboardArrowRight size={22} />
              <MdOutlineKeyboardArrowRight size={22} />
            </motion.div>
          )}
        </span>
      </motion.div>
    </Link>
  );
};

export default ViewMoreButton;
