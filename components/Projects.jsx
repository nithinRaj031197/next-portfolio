"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ProjectCard from "./ProjectCard";
import ViewMoreButton from "./ViewMoreButton";
import ParticlesBackground from "./ParticlesBackground";
const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("/projects.json")
      .then((res) => res.json())
      .then((data) => setProjects(data.slice(0, 3)));
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="flex  items-center justify-center w-full py-12  text-white min-h-[100vh] z-50"
    >
      <div className="flex flex-col items-center">
        <motion.h2
          className="text-4xl font-bold mb-10 text-cyan-400 self-start uppercase px-6 " // shimmer
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Projects
        </motion.h2>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-6 max-w-6xl">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <ViewMoreButton />
      </div>
    </motion.section>
  );
};

export default Projects;
