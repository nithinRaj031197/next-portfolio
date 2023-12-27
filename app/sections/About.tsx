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
            I&apos;m a skilled software developer with experience in TypeScript and JavaScript, and expertise in
            frameworks like React.js, Node.js, Nest.js and Next.js.
          </p>

          <p className="about-grid-info-text">
            I&apos;m a quick learner and collaborate closely with clients to create efficient, scalable, and
            user-friendly solutions that solve real-world problems. Let&apos;s work together to bring your ideas to
            life!
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
        <div className="about-skills">
          <div className="about-skill" title="HTML-5">
            <Image width={70} height={70} src="/html.svg" alt="HTML-5" />
          </div>
          <div className="about-skill" title="CSS">
            <Image width={70} height={70} src="/css.png" alt="CSS" />
          </div>
          <div className="about-skill" title="JavaScript">
            <Image width={70} height={70} src="/js.svg" alt="JavaScript" />
          </div>
          <div className="about-skill" title="React.js">
            <Image width={70} height={70} src="/reactjs.png" alt="React.js" />
          </div>
          <div className="about-skill" title="Node.js">
            <Image width={70} height={70} src="/nodejs.png" alt="Node.js" />
          </div>
          <div className="about-skill" title="Next.js">
            <Image width={70} height={70} src="/nextjs.svg" alt="Next.js" />
          </div>
          <div className="about-skill" title="Nest.js">
            <Image width={70} height={70} src="/nestjs.svg" alt="Nest.js" />
          </div>
          <div className="about-skill" title="Tailwind CSS">
            <Image width={70} height={70} src="/tailwindcss.svg" alt="Tailwind CSS" />
          </div>
          <div className="about-skill" title="GitHub">
            <Image width={70} height={70} src="/github.png" alt="GitHub" />
          </div>
          <div className="about-skill" title="Typescript">
            <Image width={70} height={70} src="/typescript.png" alt="Typescript" />
          </div>
          <div className="about-skill" title="Redux">
            <Image width={70} height={70} src="/redux.svg" alt="Redux" />
          </div>
          <div className="about-skill" title="Docker">
            <Image width={70} height={70} src="/docker.png" alt="Docker" />
          </div>
          <div className="about-skill" title="MongoDB">
            <Image width={70} height={70} src="/mongodb.png" alt="MongoDB" />
          </div>
          <div className="about-skill" title="MySQL">
            <Image width={70} height={70} src="/mysql.svg" alt="MySQL" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default About;
