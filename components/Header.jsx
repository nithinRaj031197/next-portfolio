"use client";

import { motion } from "framer-motion";
import Logo from "./Logo";
// import ThemeSwitcher from "./ThemeSwitcher";
import Navigation from "./Navigation";

const Header = () => {
  return (
    <header className="fixed w-full top-0 left-0 bg-transparent flex items-center justify-between px-10 py-5 z-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, padding: "3rem" }} transition={{ duration: 1 }} className="flex-shrink-0">
        <Logo className="w-[4rem] h-[4rem]" />
      </motion.div>

      <div className="flex">
        <Navigation />
        {/* <ThemeSwitcher /> */}
      </div>
    </header>
  );
};

export default Header;
