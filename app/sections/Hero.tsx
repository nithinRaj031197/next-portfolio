import React, { useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/Button";
import { HiMiniArrowDownTray } from "react-icons/hi2";
import Image from "next/image";

function Hero() {
  return (
    <div className="hero_container">
      <div className="hero">
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            delay: 0.6,
          }}
        >
          Hi my name is
        </motion.h1>
        <motion.h2
          className="hero-title-large"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            delay: 0.75,
          }}
        >
          Nithin Raj.
        </motion.h2>
        <motion.h3
          className="hero-title-sub"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            delay: 1.05,
          }}
        >
          I craft things for the web.
        </motion.h3>
        <motion.p
          className="hero-text"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            delay: 1.35,
          }}
        >
          Experienced full-stack developer proficient in building robust web applications, from server-side logic to
          intuitive user interfaces, with a keen eye for creating engaging and responsive user experiences.
        </motion.p>
        <motion.div className="flex gap-5">
          <Button
            text="Download Resume"
            link="https://drive.google.com/file/d/1Y4K4TYFJBee_h0p4ChmdgqUwaa30Yh9N/view"
            icon={<HiMiniArrowDownTray />}
          />
          {/* <Button text="CV" link="https://drive.google.com/file/d/1QY2brFVSx6-x16RuzuceiQZDD4WRwHsj/view?usp=sharing" icon={<HiMiniArrowDownTray/>} /> */}
        </motion.div>
      </div>

      <div className="photo_container">
        <div className="pic_border"></div>
        <img src="/nithin_pic.jpeg" alt="profile" className="profile__pic" />
      </div>
    </div>
  );
}

export default Hero;
