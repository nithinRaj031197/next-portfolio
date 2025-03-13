"use client";

import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaBriefcase } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";

const experiences = [
  {
    name: "Groyyo (Intent 360)",
    role: "React Developer",
    start: "Jan 2024",
    end: "Mar 2025",
    shortDescription: [
      "Developed a scalable React component library.",
      "Built an AI-powered dashboard with role-based access and analytics.",
      "Created a smart order management system using Redux.",
    ],
    techStack: ["React.js", "Redux Toolkit", "AWS", "React Query"],
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
    <div className="bg-gray-900 text-white py-16 px-4">
      <h2 className="text-4xl font-bold text-center mb-12 text-blue-400">Experience</h2>

      <VerticalTimeline animate={true} layout="1-column" lineColor="#3b82f6">
        {experiences.map((exp, index) => (
          <VerticalTimelineElement
            key={index}
            className="vertical-timeline-element--work"
            contentStyle={{
              background: "#1f2937", // Tailwind Gray-800
              color: "#fff",
              borderRadius: "10px",
            }}
            contentArrowStyle={{ borderRight: "7px solid #1f2937" }}
            date={`${exp.start} - ${exp.end}`}
            iconStyle={{ background: "#3b82f6", color: "#fff" }}
            icon={<FaBriefcase />}
          >
            <h3 className="text-2xl font-semibold">{exp.name}</h3>
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
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </div>
  );
};

export default Experience;
