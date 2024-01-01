import React from "react";
import "./projects.scss";

const ProjectsPage = () => {
  return (
    <div className="projects_container">
      <div className="projects_title">My Project Works</div>

      <div className="projects_display">
        <ul className="projects_tab">
          <li>React.js</li>
          <li>Next.js</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectsPage;
