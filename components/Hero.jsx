"use client";
import React from "react";
import Typewriter from "./Typewriter";
import Image from "next/image";
import { motion } from "framer-motion";
import ParticlesBackground from "./ParticlesBackground";

const Hero = () => {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-center items-center z-50 min-h-screen">
      <ParticlesBackground />
      <motion.div
        className="flex-1 flex sm:items-center justify-center"
        initial={{ x: "-100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div
          className="relative flex items-center h-[50vh] sm:h-[80vh] justify-center flex-col w-full sm:w-[80%] sm:left-[5rem]"
          style={{ padding: "2rem" }}
        >
          <div className="self-start">
            <p className="text-4xl sx:text-6xl font-bold">Hi, I'm Nithin Raj</p>
          </div>

          <div className="text-2xl sm:text-3xl font-medium self-start" style={{ margin: "1rem  0" }}>
            <Typewriter words={["React & Next.js Specialist", "Full-Stack Developer", "AI Enthusiast"]} />
          </div>

          <div className="text-lg" style={{ margin: "1rem 0", letterSpacing: "0.1rem" }}>
            I&apos;m a passionate full-stack developer who loves turning ideas into seamless, high-performance web and mobile experiences. With a
            strong eye for design and a focus on scalability, I craft intuitive solutions that merge innovation with functionality.
          </div>

          <div className="flex gap-10 self-start">
            <a href="/resume.pdf" className="custom-button ">
              Download Resume
            </a>

            <a
              href="#contact"
              className="custom-button"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Contact Me
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex-1 flex items-center justify-center"
        initial={{ x: "100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="flex items-center justify-center flex-col h-[25vh] sm:h-[80vh]">
          <div className="relative flex items-center justify-between">
            <motion.div
              className="absolute left-[-2rem] w-[16rem] h-[16rem] sm:w-[20rem] sm:h-[20rem] rounded-[40%] blur-md"
              style={{
                background: "linear-gradient(135deg, #45e7ec, #3b82f6)",
                opacity: 0.7,
              }}
              animate={{
                borderRadius: ["40% 60% 50% 50%", "50% 40% 50% 60%", "40% 50% 60% 50%", "40% 60% 50% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            ></motion.div>

            <div className="relative w-[12rem] h-[12rem] sm:w-[16rem] sm:h-[16rem] overflow-hidden  rounded-b-full">
              <Image src="/profile_bg_removed.png" alt="Profile Picture" layout="fill" objectFit="cover" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
