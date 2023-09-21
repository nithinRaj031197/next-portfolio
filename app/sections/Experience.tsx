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
      name: "Kenpath Technologies Pvt Ltd.",
      role: "Software Engineer",
      shortName: "Kenpath",
      start: "Mar 2023",
      end: "July 2023",
      shortDescription: [
        `Collaborated with cross-functional teams to develop and maintain web applications using ReactJS,
        NodeJs, AngularJS, Python, MySQL, AWS and Keycloak technolgies resulting in improved
        user experience and increased customer satisfaction.`,
        `Implemented RESTful APIs and Integrated them with frontend components mainly focusing on
        accessibility part,`,
        `Features I have worked upon: Keycloak Integration, Chatbot UI with API integration,
        Multi-step Form and Dynamic Forms and Data Migration to marqo-ai`,
      ],
    },
    {
      name: "Ecorework",
      shortName: "Ecorework",
      role: "Freelancer",
      start: "Jan 2023",
      end: "Jan 2023",
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
        "Collaboratively working with the team on respective projects to develop web applications using ReactJs, NestJS, PostgreSQL, MongoDB, Docker technologies.",
        `In my past experience, I’ve Implemented more than 50+ APIs utilizing NestJS, and I’ve subse-
        quently integrated these REST APIs into the frontend.`,
        `Features I have worked upon: Tree File Structure component, Hazelcast caching,
        RBAC controllers, Email templates, API Implementation.`,
      ],
    },
    {
      name: "Pixbit Solutions",
      shortName: "Pixbit",
      role: "ReactJs Developer (Trainee)",
      start: "Aug 2021",
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
