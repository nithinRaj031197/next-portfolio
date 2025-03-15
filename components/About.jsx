"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

const skills = [
  { title: "HTML-5", src: "/html.svg" },
  { title: "CSS", src: "/css.png" },
  { title: "JavaScript", src: "/js.svg" },
  { title: "React.js", src: "/reactjs.png" },
  { title: "Next.js", src: "/nextjs.svg" },
  { title: "TypeScript", src: "/typescript.png" },
  { title: "Redux", src: "/redux.svg" },
  { title: "Tailwind CSS", src: "/tailwindcss.svg" },
  { title: "Node.js", src: "/nodejs.png" },
  { title: "Nest.js", src: "/nestjs.svg" },
  { title: "GitHub", src: "/github.png" },
  { title: "Docker", src: "/docker.png" },
  { title: "MongoDB", src: "/mongodb.png" },
  { title: "MySQL", src: "/mysql.svg" },
];

const About = () => {
  const [hoveredSkill, setHoveredSkill] = useState(null);
  return (
    <motion.div
      className="w-full px-6 sm:px-12  flex flex-col items-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      variants={{
        visible: { opacity: 1, y: -50 },
        hidden: { opacity: 0, y: 0 },
      }}
    >
      <div className="flex flex-col gap-10">
        <h2 className="text-4xl font-bold text-cyan-400 relative before:content-['*'] before:mr-2 before:text-cyan-400">About Me</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10 w-full max-w-6xl">
          <div className="flex flex-col gap-6">
            <p className="text-gray-300 text-lg leading-relaxed">
              Hello! My name is <span className="text-cyan-400 font-semibold">Nithin Raj</span>, and I am passionate about creating digital content
              for the web. My interest in web development was sparked in 2020 when I created my first project, an Ecommerce app built using React and
              Node.js.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              I&apos;m a skilled software developer with experience in TypeScript and JavaScript, and expertise in frameworks like React.js, Node.js,
              Nest.js, and Next.js.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              I&apos;m a quick learner and collaborate closely with clients to create efficient, scalable, and user-friendly solutions that solve
              real-world problems. Let&apos;s work together to bring your ideas to life!
            </p>

            <p className="text-gray-300 text-lg font-semibold">Here are a few technologies I’ve been working with recently:</p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 list-none">
              {["HTML & CSS", "JavaScript", "React.js", "Next.js", "TypeScript", "Redux Toolkit", "Node.js", "Docker", "MongoDB", "MySQL"].map(
                (tech, index) => (
                  <li key={index} className="text-gray-300 text-base flex items-center gap-2">
                    <span className="text-cyan-400">▹</span> {tech}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="w-full max-w-6xl">
            <div className="flex flex-wrap justify-center gap-8 sm:gap-10">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredSkill(index)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 flex justify-center items-center rounded-full border border-[#45e7ec] bg-white 
                shadow-[0px_0px_15px_#45e7ec] hover:shadow-[0px_0px_25px_#45e7ec] transition duration-300 cursor-pointer"
                >
                  <Image width={50} height={50} src={skill.src} alt={skill.title} />

                  {hoveredSkill === index && (
                    <div className="absolute bottom-[-35px] sm:bottom-[-25px] text-[#45e7ec] text-xs font-semibold py-1 rounded-md shadow-lg transition duration-300">
                      {skill.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
