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
    githubPath: "https://github.com/nithinRaj031197/Dynamic_form_generator",
    projectPath: "https://nimble-kelpie-974a6c.netlify.app/",
  },
  {
    id: 2,
    title: "Task Organizer",
    imagePath: "/task_organizer_pic.png",
    description:
      "A task organizing application designed to help individuals and teams efficiently manage their tasks, prioritize work, and increase productivity.",
    githubPath: "https://github.com/nithinRaj031197/task-organizer",
    projectPath: "https://main--meek-granita-b92b03.netlify.app/",
  },
  {
    id: 3,
    title: "Ecommerce Application",
    imagePath: "/ecommerce_app.png",
    description:
      "Developed and maintained core features for an e-commerce platform. Enhanced user experience, implemented secure payment  gateways, and optimized product search functionalities.",
    githubPath: "https://github.com/nithinRaj031197/ecommerce-app",
    projectPath: "https://ecommerce-app-gfdg.vercel.app/",
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
