"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

const experiences = [
  {
    name: "Groyyo (Intent 360)",
    role: "React Developer",
    shortName: "Groyyo",
    start: "Jan 2024",
    end: "Mar 2025",
    shortDescription: [
      `Developed and implemented a React component library to improve scalability.`,
      `Built an AI-powered dashboard with role-based access and analytics.`,
      `Created a smart order management system using React and Redux.`,
    ],
    techStack: ["React.js", "Redux Toolkit", "AWS", "React Query"],
  },
  {
    name: "Kenpath Technologies Pvt Ltd.",
    role: "Software Engineer",
    shortName: "Kenpath",
    start: "Mar 2023",
    end: "July 2023",
    shortDescription: [
      `Developed an AI chatbot for visually impaired users, benefiting 20,000+ people.`,
      `Built reusable components, reducing development time by 50%.`,
      `Improved accessibility features for a better user experience.`,
    ],
    techStack: ["React.js", "Next.js", "Node.js", "MySQL", "AWS"],
  },
  {
    name: "Ecorework",
    role: "Freelancer",
    start: "Jan 2023",
    end: "Feb 2023",
    shortDescription: [
      `Developed APIs and integrated a vendor registration form.`,
      `Enhanced frontend UI for responsiveness and a smooth user experience.`,
    ],
  },
  {
    name: "Exzatech Consulting Services Pvt Ltd.",
    role: "Associate Software Developer",
    start: "Nov 2021",
    end: "Dec 2022",
    shortDescription: [
      `Developed Health Vault and Civil Registration System projects.`,
      `Built 50+ APIs using NestJS and integrated them into the frontend.`,
      `Re-engineered modules to optimize performance.`,
    ],
    techStack: ["React.js", "Node.js", "Nest.js", "Angular", "PostgreSQL"],
  },
  {
    name: "Pixbit Solutions",
    role: "ReactJs Developer (Trainee)",
    start: "July 2021",
    end: "Oct 2021",
    shortDescription: [
      `Trained in React.js, TypeScript, ReduxToolkit, and Material-UI 5.`,
      `Developed reusable form components, autocomplete, and infinite scrolling.`,
    ],
  },
];

const Experience = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className=" flex justify-center items-center bg-gray-900 text-white py-10">
      <div className="w-full max-w-4xl px-4 sm:px-8">
        <h2 className="text-4xl font-bold text-center mb-10 text-blue-400">Experience</h2>

        <div className="overflow-auto max-h-[70vh] space-y-10">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              className="relative flex gap-6 items-start group"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Timeline Dot */}
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                {index !== experiences.length - 1 && <div className="w-1 h-full bg-blue-400 opacity-50 mt-2"></div>}
              </div>

              {/* Experience Card */}
              <div className="p-6 bg-gray-800 rounded-lg shadow-lg w-full cursor-pointer">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold">{exp.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaCalendarAlt />{" "}
                    <span>
                      {exp.start} - {exp.end}
                    </span>
                  </div>
                </div>

                <p className="text-lg text-blue-300">{exp.role}</p>

                <ul className="mt-3 list-disc pl-5 space-y-2 text-gray-300">
                  {exp.shortDescription.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>

                {exp.techStack && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exp.techStack.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-600 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experience;
