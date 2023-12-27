import { Project } from "@/global";
import React from "react";
import { FiGithub } from "react-icons/fi";
import { HiMiniArrowTopRightOnSquare } from "react-icons/hi2";

type ProjectProps = {
  project: Project;
  index: number;
};

const IndividualProject = ({ project, index }: ProjectProps) => {
  return (
    <div className="card">
      {index % 2 === 0 ? (
        <>
          <div className="thumbnail">
            <img src={project.imagePath} alt={project.title} />
          </div>
          <div className="project_info">
            <p className="project_title">{project.title}</p>
            <p className="project_desc">{project.description}</p>
            <div className="project_buttons">
              <a href={project.githubPath} target="_blank" className="github_code">
                <span>View Code</span>
                <FiGithub />
              </a>
              <a href={project.projectPath} target="_blank" className="view_project">
                <span> View project</span>
                <HiMiniArrowTopRightOnSquare />
              </a>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="project_info">
            <p className="project_title">{project.title}</p>
            <p className="project_desc">{project.description}</p>
            <div className="project_buttons">
              <a href={project.githubPath} target="_blank" className="github_code">
                <span>View Code</span>
                <FiGithub />
              </a>
              <a href={project.projectPath} target="_blank" className="view_project">
                <span> View project</span>
                <HiMiniArrowTopRightOnSquare />
              </a>
            </div>
          </div>
          <div className="thumbnail">
            <img src={project.imagePath} alt={project.title} />
          </div>
        </>
      )}
    </div>
  );
};

export default IndividualProject;
