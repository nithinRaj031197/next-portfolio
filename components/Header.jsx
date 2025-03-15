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
    <>
      <header
        className={`fixed ${
          !isOpen && " backdrop-blur-lg"
        }  w-[100vw] top-0 left-0 bg-transparent flex items-center justify-between py-4 z-50 header px-4`}
      >
        <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} href="#home">
          <Logo className="w-12 h-12" />
        </motion.a>

        <nav className="hidden md:flex">
          <Navigation />
        </nav>

        <button className="sm:hidden" onClick={() => setIsOpen(true)} aria-label="Open Menu">
          <IoMenu className="w-8 h-8 text-[#45e7ec]" />
        </button>
      </header>
      <MobileNav isOpen={isOpen} closeMenu={() => setIsOpen(false)} />
    </>
  );
};

export default Header;

const MobileNav = ({ isOpen, closeMenu }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[#0b192e] bg-opacity-95 z-[100] flex flex-col items-center w-full"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
        >
          <header className="w-full flex justify-between items-center px-6 py-5">
            <button className="text-white focus:outline-none" onClick={closeMenu} aria-label="Close Menu">
              <RiCloseLargeFill className="w-8 h-8" />
            </button>

            <div className="flex gap-6">
              <a href="https://github.com/nithinRaj031197/" className="text-[#45e7ec]" target="_blank" rel="noopener noreferrer">
                <LuGithub size={30} />
              </a>
              <a href="https://www.linkedin.com/in/nithin-raj-831108214/" className="text-[#45e7ec]" target="_blank" rel="noopener noreferrer">
                <SlSocialLinkedin size={28} />
              </a>
            </div>

            <div></div>
          </header>

          <nav className="mt-16 w-full">
            <ul className="flex flex-col gap-6 text-white text-lg items-center">
              <li>
                <a href="#about" className="text-[#45e7ec] uppercase text-sm font-semibold tracking-wider" onClick={closeMenu}>
                  About
                </a>
              </li>
              <li>
                <a href="#experience" className="text-[#45e7ec] uppercase text-sm font-semibold tracking-wider" onClick={closeMenu}>
                  Experience
                </a>
              </li>
              <li>
                <a href="#projects" className="text-[#45e7ec] uppercase text-sm font-semibold tracking-wider" onClick={closeMenu}>
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
