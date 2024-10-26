import { NavLink } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { useUser } from "./UserContext";
import React, { useState, useEffect } from "react";

const linkClass = ({ isActive }) => isActive ? 
    "text-black bg-lime-100 hover:bg-lime-500 hover:text-black rounded-md px-3 py-2" 
    : "text-black hover:bg-lime-500 hover:text-black rounded-md px-3 py-2";

const ProjectDashboard = () => {
  const { id } = useParams();
  const { user } = useUser(); // Get the logged-in user's information
  const [resourceId, setResourceId] = useState(null);

  useEffect(() => {
    if (user && id) {
      console.log(`Fetching resourceId for userId: ${user.id} and projectId: ${id}`);
      fetch(`${import.meta.env.VITE_API_URL}/resource-id/${user.id}/${id}`)
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
      console.log('User or ProjectId is missing:', { user, id });
    }
  }, [user, id]);

  return (
    <div>
        {resourceId ? (
        <div className="flex space-x-4"> {/* Container for links with space between them */}
          <NavLink
            to={`/taskboard/${resourceId}`}
            className={linkClass}
          >
            View  Task board
          </NavLink>
        
        </div>
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default ProjectDashboard;
