"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import Card from "./Card";

const ProjectCard = ({ project }) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
      <Card color="#45e7ec">
        <div className="flex flex-col items-center  text-center">
          <div className="relative w-full h-40">
            <Image src={project.imagePath} alt={project.title} layout="fill" objectFit="fill" className="rounded-lg" />
          </div>

          <h3 className="text-xl font-semibold mt-4 text-cyan-300">{project.title}</h3>
          <p className="text-gray-300 text-sm mt-2 px-2">{project.description}</p>

          <div className="flex gap-4 mt-4">
            <a
              href={project.githubPath}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-1 text-[#45e7ec] p-2 transition-all duration-300 ease-in-out border border-transparent hover:border-[#45e7ec] hover:bg-[#45e7ec20] hover:rounded-lg hover:scale-105"
            >
              <FaGithub className="transition-transform duration-300 group-hover:rotate-[15deg]" /> GitHub
            </a>
            <a
              href={project.projectPath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#45e7ec] hover:border-[#45e7ec] hover:border-1 hover p-2 hover:rounded-lg transition"
            >
              <FaExternalLinkAlt /> Live Demo
            </a>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
