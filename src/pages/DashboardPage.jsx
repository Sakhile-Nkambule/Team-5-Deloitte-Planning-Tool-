
import React from 'react';
import ProjectDashboard from '../componets/ProjectDashboard';
import AvailableResources from '../componets/AvailableResources';
import KanbanBoard from '../componets/KanbanBoard';
import BudgetUser from '../componets/BudgetUser';
import { useLoaderData } from 'react-router-dom';
import { useParams } from 'react-router-dom';
const DashboardPage = () => {
  const { project, client, resources } = useLoaderData();
  console.log(project);

  return (
    <>
      <ProjectDashboard />
      <KanbanBoard/>
      <AvailableResources />
      <BudgetUser project={project}/>
    </>
  );
};

export default DashboardPage;
