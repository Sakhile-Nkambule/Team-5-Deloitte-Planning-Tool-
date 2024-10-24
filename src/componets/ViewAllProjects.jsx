import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust the import path according to your file structure

const ViewAllProjects = () => {
  const navigate = useNavigate();
  const { user } = useUser(); // Get user from context
  const userRole = user?.role; // Get the user's role

  const handleClick = () => {
    // Define roles that should be directed to /projects
    const allowedRoles = [
      'Planning Team',
      'Director',
      'Senior Manager',
      'Associate Director',
      'Snr Associate Director',
      'Manager',
      'Assistant Manager'
    ];

    // Navigate based on user role
    if (userRole && allowedRoles.includes(userRole)) {
      navigate('/projects');
    } else {
      navigate(`/user-projects/${user?.id}`); // Ensure user?.id is available
    }
  };
  
  return (
    <section className="m-auto max-w-xl my-10 px-6">
      <button
        onClick={handleClick}
        className="block bg-black text-white text-center py-4 px-6 w-full rounded-xl hover:bg-lime-500 hover:shadow-lg 
             transform hover:scale-105 transition-all"
      >
        View All Projects
      </button>
    </section>
  );
};

export default ViewAllProjects;
