import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Experience = () => {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const transformSelected = () => {
      const underline = document.querySelector<HTMLElement>(".underline");
      underline!.style.top = `${selected * 3.5}rem`;
    };
    transformSelected();
  }, [selected]);

  const expereinces = [
    {
      name: "Groyyo (Intent 360)",
      role: "React Developer",
      shortName: "Groyyo",
      start: "Jan 2024",
      end: "Present",
      shortDescription: [
        `Intent 360 is a pioneering apparel-tech organization that provides
        advanced digital solutions and cloud-based hyper-automation
        technology, specifically tailored for B2B supply chain management in
        the manufacturing industry.`,
        ` Developed and implemented a comprehensive React component
        library to ensure consistency across all web applications, streamlining
        the front-end architecture and improving scalability. Collaborated
        with cross-functional teams to translate business and user
        requirements into high-quality, functional, and aesthetic components.`,
        `management system using React and Redux, which efficiently
        allocated orders and tracked fabric usage across multiple factories,
        enhancing production management and maximizing resource
        utilization.`,
        `Led the development of an AI-powered solution in React,
        implementing role-based access and dynamic dashboards to enhance
        user experience and operational efficiency. We conducted
        performance analysis and refactored components to continuously
        improve module accuracy and efficiency within the Intent 360
        platform`,
        `TechStack: React.js, GitHub,Redux Toolkit, AWS, React Query`,
      ],
    },
    {
      name: "Kenpath Technologies Pvt Ltd.",
      role: "Software Engineer",
      shortName: "Kenpath",
      start: "Mar 2023",
      end: "July 2023",
      shortDescription: [
        ` Developed and designed an innovative chatbot integrated into a learning application, facilitating independent access to educational resources for visually impaired individuals, resulting in a user base exceeding 20,000.`,
        `Created and maintained reusable software components that were leveraged across various projects, reducing development efforts by 50`,
        `Implemented accessibility enhancements that significantly enhanced the user experience for visually impaired individuals.`,
        `TechStack: React.js,Node.js,GitHub,MySQL,AWS.`,
      ],
    },
    {
      name: "Ecorework",
      shortName: "Ecorework",
      role: "Freelancer",
      start: "Jan 2023",
      end: "Feb 2023",
      shortDescription: [
        `Assetze is a cloud-based IT asset management solution that helps businesses generate
        reports, manage IT expenses, and assign tickets on a unified platform.`,
        `Developed APIs, integrated a vendor registration form, incorporated
        a Donut Cart for scheduling employee shifts, and enhanced the frontend to ensure a responsive and
        user-friendly interface.`,
      ],
    },
    {
      name: "Exzatech Consulting Services Pvt Ltd.",
      shortName: "Exzatech",
      role: "Associate Software Developer",
      start: "Nov 2021",
      end: "Dec 2022",
      shortDescription: [
        `Developed and integrated two projects: Health Vault, where I organized patient, doctor, and hospital record components, and the Civil Registration System (CRS), a unified system for recording vital events for socio-economic planning.`,
        `Implemented over 50+ APIs using NestJS and seamlessly integrated these REST APIs into the front end.`,
        `Re-engineered critical modules within a sprint to optimize performance by relying on a centralized library.`,
        `Delivered stable and timely product releases using an agile development approach.`,
        `Identified and resolved bugs, resulting in a reduced number of findings during development and rolled out fixes to production within 24 hours
`,
        `TechStack: React.js,Node.js,Nest.js,Angular,GitHub,PostgreSQL, Redux, MongoDB, MySQL`,
      ],
    },
    {
      name: "Pixbit Solutions",
      shortName: "Pixbit",
      role: "ReactJs Developer (Trainee)",
      start: "July 2021",
      end: "Oct 2021",
      shortDescription: [
        "I received comprehensive training in ReactJs, Typescript, Material-UI 5, ReduxToolkit, and RTK Query.",
        "I had the opportunity to contribute to a project named ”Infulls,”",
        " I developed reusable Form Components, Autocomplete functionality, customized Accordion Components, and implemented Infinite Scrolling",
      ],
    },
  ];
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
        <h2>Where I&apos;ve Worked</h2>
      </div>
      <div className="container">
        <ul className="exp-slider">
          <div className="underline"></div>
          {expereinces.map((expereince, index) => {
            return (
              <li
                className={`exp-slider-item ${index === selected && "exp-slider-item-selected"}`}
                onClick={() => setSelected(index)}
                key={expereince.name}
              >
                <span>{expereince.shortName}</span>
              </li>
            );
          })}
        </ul>
        <div className="exp-details">
          <div className="exp-details-position">
            <h3>
              <span>{expereinces[selected].role}</span>
              <span className="exp-details-position-company">
                &nbsp;@&nbsp;
                {/* <Link href={expereinces[selected].url} className="link"> */}
                {expereinces[selected].name}
                {/* </Link> */}
              </span>
            </h3>
            <p className="exp-details-range">
              {expereinces[selected].start} - {expereinces[selected].end}
            </p>
            <ul className="exp-details-list">
              {expereinces[selected].shortDescription.map((description, index) => (
                <li key={index} className="exp-details-list-item">
                  {description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div id="work"></div>
    </motion.section>
  );
};

export default Experience;
