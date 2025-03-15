"use client";

import { motion } from "framer-motion";

const experiences = [
  {
    name: "Groyyo (Intent 360)",
    role: "Frontend React.js Developer",
    start: "Jan 2024",
    end: "Mar 2025",
    shortDescription: [
      "Developed a scalable React component library.",
      "Built an AI-powered dashboard with role-based access and analytics.",
      "Created a smart order management system using Redux.",
    ],
    techStack: ["React.js", "Next.js", "Redux Toolkit", "AWS", "React Query"],
  },
  {
    name: "Kenpath Technologies Pvt Ltd.",
    role: "Software Engineer",
    start: "Mar 2023",
    end: "July 2023",
    shortDescription: [
      "Developed an AI chatbot for visually impaired users.",
      "Built reusable components, reducing development time by 50%.",
      "Improved accessibility features for a better UX.",
    ],
    techStack: ["React.js", "Next.js", "Node.js", "MySQL", "AWS"],
  },
  {
    name: "Exzatech Consulting Services Pvt Ltd.",
    role: "Associate Software Developer",
    start: "Nov 2021",
    end: "Dec 2022",
    shortDescription: [
      "Developed Health Vault and Civil Registration System projects.",
      "Built 50+ APIs using NestJS and integrated them into the frontend.",
      "Re-engineered modules to optimize performance.",
    ],
    techStack: ["React.js", "Node.js", "Nest.js", "Angular", "PostgreSQL"],
  },
];

const Experience = () => {
  return (
    <div className="flex flex-col items-center w-full py-12 bg-gray-900 text-white relative animated-dotted-background">
      {/* Background Glow Effect */}
      <div className="absolute  blur-[100px] opacity-70 pointer-events-none"></div>

      <h2 className="text-4xl font-bold mb-10 text-cyan-400 uppercase  before:content-['*'] before:mr-2 sm:tracking-[2rem]">WORK Experience</h2>

      <div className="relative w-full max-w-4xl px-4">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="mb-10 relative"
          >
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-cyan-300">{exp.name}</h3>
              <p className="text-lg text-gray-300">
                {exp.role} ({exp.start} - {exp.end})
              </p>
              <ul className="list-disc list-inside text-gray-400 mt-2">
                {exp.shortDescription.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-4">
                {exp.techStack.map((tech, i) => (
                  <span key={i} className="border border-[#45e7ec] text-[#45e7ec] text-sm px-3 py-1 rounded-lg shadow-md">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Experience;
