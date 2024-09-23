import React from 'react';
import ProjectDashboard from '../componets/ProjectDashboard';
import AvailableResources from '../componets/AvailableResources';
import BudgetUser from '../componets/BudgetUser';
import { useLoaderData } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useUser } from '../componets/UserContext'; // Assuming you're using a UserContext to manage user state
import Calendar from '../componets/Calendar';
import DashboardHearder from '../componets/DashboardHearder';

const DashboardPage = () => {
  const { project, client, resources } = useLoaderData();
  const { user } = useUser(); // Get the logged-in user
  const userRole = user?.role; // Get the user's role


  return (
    <div>
       {/* <Calendar/> */}
      <DashboardHearder />
      {/* <ProjectDashboard /> */}
      <div className="flex bg-gray-100 shadow-xl p-4  grid grid-cols-3 gap-4">
      
      <div class="col-span-2 bg-white rounded-xl p-4">
       <AvailableResources /> 
      </div>
      <div class="col-span-1 bg-white rounded-xl p-4">
      <BudgetUser project={project} />
      </div>
      </div>
    </div>
  );
};

export default DashboardPage;
