"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect } from "react";

type ILoaderProps = { isLoading: boolean; setIsLoading: () => void };

const Loader = ({ isLoading, setIsLoading }: ILoaderProps) => {
  useEffect(() => {
    // setTimeout(() => {
    setIsLoading();
    // }, 1900);
  }, [setIsLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="loader"
          exit={{ scale: 0 }}
          key="motiondivleave"
          transition={{
            duration: 0.45,
            ease: "easeInOut",
          }}
        >
          <div className="loading-spinner">
            <div className="circle-wrapper">
              <div className="circle"></div>
            </div>
            <Image src="/download.png" alt="Logo" width={300} height={300} className="circle-image" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
