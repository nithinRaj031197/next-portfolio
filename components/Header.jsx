"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import Navigation from "./Navigation";
import { IoMenu } from "react-icons/io5";
import { RiCloseLargeFill } from "react-icons/ri";
import { LuGithub } from "react-icons/lu";
import { SlSocialLinkedin } from "react-icons/sl";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={`fixed ${
        !isOpen && " backdrop-blur-lg"
      }  w-[100vw] top-0 left-0 bg-transparent flex items-center justify-between py-4 z-50 header px-4`}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Logo className="w-12 h-12" />
      </motion.div>

      <nav className="hidden md:flex">
        <Navigation />
      </nav>

      <button className="sm:hidden" onClick={() => setIsOpen(true)} aria-label="Open Menu">
        <IoMenu className="w-8 h-8 text-white" />
      </button>

      <MobileNav isOpen={isOpen} closeMenu={() => setIsOpen(false)} />
    </header>
  );
};

export default Header;

const MobileNav = ({ isOpen, closeMenu }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[#0b192e] z-50 flex flex-col items-center justify-start"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
        >
          <header className="flex justify-between items-center w-[100vw] px-8 py-5">
            <div className="flex gap-10">
              <a href="https://github.com/nithinRaj031197/" className="text-[#45e7ec]" target="_blank" rel="noopener noreferrer">
                <LuGithub size={30} />
              </a>
              <a href="https://www.linkedin.com/in/nithin-raj-831108214/" className="text-[#45e7ec]" target="_blank" rel="noopener noreferrer">
                <SlSocialLinkedin size={28} />
              </a>
            </div>
            <div>
              {" "}
              <button className=" top-6 right-6 text-white" onClick={closeMenu} aria-label="Close Menu">
                <RiCloseLargeFill className="w-8 h-8" />
              </button>
            </div>
          </header>

          <nav style={{ paddingTop: "10rem" }}>
            <ul className="flex flex-col gap-6 text-white text-lg">
              <li>
                <a
                  href="#about"
                  style={{ color: "#45e7ec", textTransform: "uppercase", fontSize: "14px", fontWeight: 600, letterSpacing: "1px" }}
                  onClick={closeMenu}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  style={{ color: "#45e7ec", textTransform: "uppercase", fontSize: "14px", fontWeight: 600, letterSpacing: "1px" }}
                  onClick={closeMenu}
                >
                  Experience
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  style={{ color: "#45e7ec", textTransform: "uppercase", fontSize: "14px", fontWeight: 600, letterSpacing: "1px" }}
                  onClick={closeMenu}
                >
                  Projects
                </a>
              </li>
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
