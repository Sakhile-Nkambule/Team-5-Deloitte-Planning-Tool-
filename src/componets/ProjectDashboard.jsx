import React from 'react'
import { NavLink } from 'react-router-dom';
const linkClass = ({isActive})=> isActive? 
    "text-black bg-lime-100 hover:bg-lime-500 hover:text-black rounded-md px-3 py-2" 
    :"text-black hover:bg-lime-500 hover:text-black rounded-md px-3 py-2";
const ProjectDashboard = () => {
  return (
    <div>
      <h2 className="text-green-500 text-3xl text-center font-semibold mb-25">Project Dashboard Currently Not Available</h2>
    <NavLink
      to={`/taskboard/${1}`}
      className={linkClass}
    >
      Task board
    </NavLink>
    </div>
  );
};

export default ProjectDashboard;