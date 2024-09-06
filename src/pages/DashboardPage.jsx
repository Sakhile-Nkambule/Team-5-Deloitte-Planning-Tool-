import React from 'react';
import ProjectDashboard from '../componets/ProjectDashboard';
import AvailableResources from '../componets/AvailableResources';
import BudgetUser from '../componets/BudgetUser';
import { useLoaderData } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useUser } from '../componets/UserContext'; // Assuming you're using a UserContext to manage user state

const DashboardPage = () => {
  const { project, client, resources } = useLoaderData();
  const { user } = useUser(); // Get the logged-in user
  const userRole = user?.role; // Get the user's role


  return (
    <>
      <ProjectDashboard />
      <AvailableResources />
      <BudgetUser project={project} />
    </>
  );
};

export default DashboardPage;
