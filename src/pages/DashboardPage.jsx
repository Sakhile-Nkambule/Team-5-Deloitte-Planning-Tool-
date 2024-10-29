import React from "react";
import AvailableResources from "../componets/AvailableResources";
import BudgetUser from "../componets/BudgetUser";
import { useLoaderData } from "react-router-dom";
import { useUser } from "../componets/UserContext";
import DashboardHearder from "../componets/DashboardHearder";

const DashboardPage = () => {
  const { project, client, resources } = useLoaderData();
  const { user } = useUser(); // Get the logged-in user

  return (
    <div>
      <DashboardHearder resources={resources} project={project} />
      <div className=" bg-gray-100 shadow-xl p-4 grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl p-4">
          <AvailableResources resources={resources} project={project} />
        </div>
        <div className="col-span-1 bg-white rounded-xl p-4">
          <BudgetUser project={project} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
