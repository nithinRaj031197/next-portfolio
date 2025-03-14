"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/projects.json")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full py-12 bg-gray-900 text-white"
    >
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full backdrop-blur-2xl px-6 py-4 z-50 shadow-md">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#45e7ec] gap-2 cursor-pointer border border-[#45e7ec] py-1 px-4 rounded-xl hover:shadow-md hover:shadow-[#45e7ec] transition-all duration-300"
          >
            <IoMdArrowRoundBack size={20} />
            <span>Back</span>
          </button>
          <p className="text-3xl font-bold text-[#45e7ec]">All Projects</p>
        </div>
      </div>

      {/* Content - Added Margin Top to Avoid Overlap */}
      <div className="w-full max-w-6xl px-6 mt-[80px] grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </motion.section>
  );
};

export default ProjectsPage;
