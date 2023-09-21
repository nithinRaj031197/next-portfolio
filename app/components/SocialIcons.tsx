import React from "react";
import { motion } from "framer-motion";
import {
  FiGithub,
  // FiInstagram,
  // FiYoutube,
  FiLinkedin,
  // FiTwitter,
} from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";
import Link from "next/link";

const SocialIcons = () => {
  const socialLinks = [
    { name: "Github", icon: <FiGithub />, link: "https://github.com/nithinRaj031197" },
    // {
    //   name: "Youtube",
    //   icon: <FiYoutube />,
    //   link: "https://www.youtube.com/KishanSheth21/",
    // },
    {
      name: "LinkedIn",
      icon: <FiLinkedin />,
      link: "https://www.linkedin.com/in/nithin-raj-831108214/",
    },
    // {
    //   name: "Instagram",
    //   icon: <FiInstagram />,
    //   link: "https://instagram.com/koolkishansheth",
    // },
    // {
    //   name: "Twitter",
    //   icon: <FiTwitter />,
    //   link: "https://twitter.com/koolkishansheth",
    // },
    {
      name: "Leetcode",
      icon: <SiLeetcode />,
      link: "https://leetcode.com/nithinraj03/",
    },
  ];
  return (
    <motion.div
      className="social-icons"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
        delay: 1.95,
      }}
    >
      <ul className="social-icons-list">
        {socialLinks.map(({ name, icon, link }) => (
          <li key={name} title={name} className="social-icons-list-item">
            <Link href={link} className="social-icons-list-item-link" target="_blank">
              {icon}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default SocialIcons;
