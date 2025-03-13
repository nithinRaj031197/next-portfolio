"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import Navigation from "./Navigation";
import { IoMenu } from "react-icons/io5";
import { RiCloseLargeFill } from "react-icons/ri";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sm:backdrop-blur-lg fixed w-full top-0 left-0 bg-transparent flex items-center justify-between px-6 py-4 z-50 header">
      {/* Logo */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Logo className="w-12 h-12" />
      </motion.div>

      {/* Navigation (Hidden on small screens) */}
      <nav className="hidden md:flex">
        <Navigation />
      </nav>

      {/* Hamburger Menu Button (Only visible on mobile) */}
      <button className="md:hidden" onClick={() => setIsOpen(true)} aria-label="Open Menu">
        <IoMenu className="w-8 h-8 text-white" />
      </button>

      {/* Mobile Navigation Drawer */}
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
          {/* Close Button */}
          <button className="absolute top-6 right-6 text-white" onClick={closeMenu} aria-label="Close Menu">
            <RiCloseLargeFill className="w-8 h-8" />
          </button>

          {/* Mobile Navigation Links */}
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
                  href="#projects"
                  style={{ color: "#45e7ec", textTransform: "uppercase", fontSize: "14px", fontWeight: 600, letterSpacing: "1px" }}
                  onClick={closeMenu}
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  style={{ color: "#45e7ec", textTransform: "uppercase", fontSize: "14px", fontWeight: 600, letterSpacing: "1px" }}
                  onClick={closeMenu}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
