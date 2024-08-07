import React from 'react';
import ProjectListings from "../componets/ProjectListings";
import UserProjectListings from "../componets/userProjectListings"; // Assuming this is the alternative component
import { useUser } from '../componets/UserContext'; // Import the useUser hook

const Projectspage = () => {
  const { user } = useUser(); // Get user from context
  const userRole = user?.Role; // Get the user's role

  return (
    <section className='bg-white px-4 py-6'>
      {userRole === 'Planning Team' ? (
        <ProjectListings />
      ) : (
        <UserProjectListings userId={user.id} isUserHome={true} /> // Render this if role is not Planning Team
      )}
    </section>
  );
};

export default Projectspage;
