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
  {
    id: 4,
    title: "Kanban Board",
    imagePath: "/kanban_board.png",
    description:
      "Kanban boards aid agile teams by visualizing tasks in columns, enabling easy tracking and streamlining workflows for efficient task management and collaboration.",
    githubPath: "https://github.com/nithinRaj031197/kanban_task_tracker",
    projectPath: "https://kanban-task-tracker.vercel.app/",
  },
  {
    id: 4,
    title: "tic Tac Toe",
    imagePath: "/tic_tac_toe.png",
    description:
      "Classic grid-based game challenging two players to strategically place their marks in a 3x3 grid, aiming to achieve a row, column, or diagonal of their symbol before the opponent does.",
    githubPath: "https://github.com/nithinRaj031197/Tic_Tac_Toe",
    projectPath: "https://tic-tac-toe-rosy-alpha.vercel.app/",
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
