import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useInView, motion } from "framer-motion";

function About() {
  const ref = useRef(null);
  const isInView = useInView(ref);
  useEffect(() => {
    console.log("Element is in view: ", isInView);
  }, [isInView]);
  return (
    <motion.section
      className="about"
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
        <h2>About Me</h2>
      </div>
      <div className="about-grid">
        <div className="about-grid-info">
          <p className="about-grid-info-text">
            Hello! My name is Nithin Raj, and I am passionate about creating digital content for the web. My interest in
            web development was sparked in 2020 when I created my first project, a Ecommerce app built using React and
            Node.js.
          </p>
          <p className="about-grid-info-text">
            I'm a skilled software developer with experience in TypeScript and JavaScript, and expertise in frameworks
            like React.js, Node.js, Nest.js and Next.js.
          </p>

          <p className="about-grid-info-text">
            I'm a quick learner and collaborate closely with clients to create efficient, scalable, and user-friendly
            solutions that solve real-world problems. Let's work together to bring your ideas to life!
          </p>

          {/* <p className="about-grid-info-text">
            Additionally, I share my knowledge and passion with the world through my YouTube channel, where I
            demonstrate how to build full-stack applications.
          </p> */}

          <p className="about-grid-info-text">Here are a few technologies I’ve been working with recently:</p>
          <ul className="about-grid-info-list">
            <li className="about-grid-info-list-item">HTML & CSS</li>
            <li className="about-grid-info-list-item">JavaScript</li>
            <li className="about-grid-info-list-item">React.js</li>
            <li className="about-grid-info-list-item">Next.js</li>
            <li className="about-grid-info-list-item">Typescript</li>
            <li className="about-grid-info-list-item">Redux Toolkit</li>
            <li className="about-grid-info-list-item">Node.js</li>
            <li className="about-grid-info-list-item">Docker</li>
            <li className="about-grid-info-list-item">MySQL and MongoDB</li>
          </ul>
        </div>
        {/* <div className="about-grid-photo">
          <div className="overlay"></div>
          <div className="overlay-border"></div>
          <div className="about-grid-photo-container">
            <Image src="/nithin_pic.jpeg" alt="profile" fill style={{ borderRadius: "50%" }} className="profile__pic" />
          </div>
        </div> */}
      </div>
    </motion.section>
  );
}

export default About;
