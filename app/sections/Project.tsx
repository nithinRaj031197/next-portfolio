import React from "react";
import { motion } from "framer-motion";

const Project = () => {
  return (
    <motion.section
      className="experience"
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
        <div className="card">1</div>
        <div className="card">1</div>
        <div className="card">1</div>
      </div>
    </motion.section>
  );
};

export default Project;
