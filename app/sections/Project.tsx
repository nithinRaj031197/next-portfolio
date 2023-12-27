import React from "react";
import { motion } from "framer-motion";
import IndividualProject from "../components/IndividualProject";
import { Project } from "@/global";

const projects: Project[] = [
  {
    id: 1,
    title: "Dynamic Form Generator",
    imagePath: "/dynamic_form_generator_pic.png",
    description:
      "A software tool or application that allows users to create, customize, and manage dynamic, interactive forms for various purposes without the need for extensive programming knowledge.",
  },
  {
    id: 2,
    title: "Task Organizer",
    imagePath: "/task_organizer_pic.png",
    description:
      "A task organizing application designed to help individuals and teams efficiently manage their tasks, prioritize work, and increase productivity.",
  },
];

const Project = () => {
  return (
    <motion.section
      className="projects"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      variants={{
        visible: { opacity: 1, y: -50 },
        hidden: { opacity: 0, y: 0 },
      }}
    >
      <div className="title">
        <h2>Projects</h2>
      </div>
      <div className="cards">
        {projects?.map((project: Project, index: number) => {
          return <IndividualProject key={project.id} project={project} index={index} />;
        })}
      </div>
    </motion.section>
  );
};

export default Project;
