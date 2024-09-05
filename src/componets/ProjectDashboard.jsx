import { NavLink } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { useUser } from "./UserContext";
import React, { useState, useEffect } from "react";

const linkClass = ({ isActive }) => isActive ? 
    "text-black bg-lime-100 hover:bg-lime-500 hover:text-black rounded-md px-3 py-2" 
    : "text-black hover:bg-lime-500 hover:text-black rounded-md px-3 py-2";

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const { user } = useUser(); // Get the logged-in user's information
  const [resourceId, setResourceId] = useState(null);

  useEffect(() => {
    if (user && projectId) {
      console.log(`Fetching resourceId for userId: ${user.id} and projectId: ${projectId}`);
      fetch(`/api/resource-id/${user.id}/${projectId}`)
        .then((response) => {
          console.log('Fetch response:', response);
          return response.json();
        })
        .then((data) => {
          console.log('Fetch data:', data);
          setResourceId(data.resourceId);
        })
        .catch((error) => {
          console.error('Error fetching resourceId:', error);
        });
    } else {
      console.log('User or ProjectId is missing:', { user, projectId });
    }
  }, [user, projectId]);

  return (
    <div>
      <h2 className="text-green-500 text-3xl text-center font-semibold mb-25">Project Dashboard Currently Not Available</h2>
      {resourceId ? (
        <div className="flex space-x-4"> {/* Container for links with space between them */}
          <NavLink
            to={`/taskboard/${resourceId}`}
            className={linkClass}
          >
            Task board
          </NavLink>
          <NavLink
            to={`/resources/${resourceId}`} // Route for Available Resources
            className={linkClass}
          >
            Available Resources
          </NavLink>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProjectDashboard;
