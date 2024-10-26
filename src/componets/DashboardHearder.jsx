import React, { useState, useEffect } from "react";
import ProjectMetricsCard from "../componets/ProjectMetricsCard";
import {
  faClock,
  faTasks,
  faCheck,
  faPercent,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./modal";
import ProjectKanbanBoard from "./ProjectKanbanBoard";

const DashboardHeader = ({ resources, project }) => {
  const [tasksData, setTasksData] = useState([]);
  const [tasksOutstanding, setTasksOutstanding] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [projectedProfitMargin, setProjectedProfitMargin] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]); // To hold user details

  const totalWorkedHours = resources.reduce(
    (total, resource) => total + Number(resource.WorkedHours || 0),
    0
  );
  const totalPlannedHours = resources.reduce(
    (total, resource) => total + Number(resource.PlannedHours || 0),
    0
  );
  const workedHoursPercent =
    totalPlannedHours > 0
      ? ((totalWorkedHours / totalPlannedHours) * 100).toFixed(2)
      : 0;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/project/${project.ProjectID}`);
        const data = await response.json();
        setTasksData(data);

        const completedTasks = data.filter(
          (task) => task.completed === 1
        ).length;
        const outstandingTasks = data.filter(
          (task) => task.completed === 0
        ).length;

        setTasksCompleted(completedTasks);
        setTasksOutstanding(outstandingTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [project.ProjectID]);

  useEffect(() => {
    const fetchFinancialsAndUsers = async () => {
      try {
        const financialResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/financials/${project.ProjectID}`
        );
        const financialData = await financialResponse.json();
        const netRevenue = financialData.NetRevenue || 0;
        const projectedProfitMargin = financialData.ProfitMargin || 0;
        setProjectedProfitMargin(projectedProfitMargin);

        const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/users`);
        const usersData = await usersResponse.json();
        setUsers(usersData); // Save the users data

        let totalCosts = 0;
        resources.forEach((resource) => {
          const user = usersData.find(
            (user) => user.UserID === resource.UserID
          );
          const hourlyRate = user ? user.HourlyRate : 0;
          totalCosts += hourlyRate * Number(resource.WorkedHours || 0);
        });

        const calculatedProfitMargin =
          netRevenue > 0 ? ((netRevenue - totalCosts) / netRevenue) * 100 : 0;
        setProfitMargin(calculatedProfitMargin.toFixed(2));
      } catch (error) {
        console.error("Error fetching financials or users:", error);
      }
    };

    fetchFinancialsAndUsers();
  }, [resources, project.ProjectID]);

  const handleTasksClick = () => {
    setShowModal(true); // Show both outstanding and completed tasks in the modal
  };

  const outstandingTasks = tasksData.filter((task) => task.completed === 0);
  const completedTasks = tasksData.filter((task) => task.completed === 1);

  return (
    <>
      <div className="relative bg-lime-400 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <ProjectMetricsCard
                  statSubtitle="Total Hours"
                  statTitle={totalWorkedHours.toString()}
                  statArrow="up"
                  statPercent={workedHoursPercent.toString()}
                  statPercentColor="text-emerald-500"
                  statDescription={`Of Total ${totalPlannedHours} Planned Hours`}
                  statIconName={faClock}
                  statIconColor="bg-red-500"
                />
              </div>
              <div
                className="w-full lg:w-6/12 xl:w-3/12 px-4"
                onClick={handleTasksClick}
              >
                <ProjectMetricsCard
                  statSubtitle="Tasks Outstanding"
                  statTitle={tasksOutstanding.toString()}
                  statArrow="down"
                  statPercent={(totalWorkedHours > 0
                    ? (
                        (tasksOutstanding /
                          (tasksOutstanding + tasksCompleted)) *
                        100
                      ).toFixed(2)
                    : 0
                  ).toString()}
                  statPercentColor="text-red-500"
                  statDescription={`Of Total ${
                    tasksOutstanding + tasksCompleted
                  } Tasks`}
                  statIconName={faTasks}
                  statIconColor="bg-orange-500 hover:bg-orange-800 cursor-pointer hover:bg-opacity-75" // Darken on hover
                />
              </div>
              <div
                className="w-full lg:w-6/12 xl:w-3/12 px-4"
                onClick={handleTasksClick}
              >
                <ProjectMetricsCard
                  statSubtitle="Tasks Completed"
                  statTitle={tasksCompleted.toString()}
                  statArrow="up"
                  statPercent={(totalWorkedHours > 0
                    ? (
                        (tasksCompleted / (tasksOutstanding + tasksCompleted)) *
                        100
                      ).toFixed(2)
                    : 0
                  ).toString()}
                  statPercentColor="text-orange-500"
                  statDescription={`Of Total ${
                    tasksOutstanding + tasksCompleted
                  } Tasks`}
                  statIconName={faCheck}
                  statIconColor="bg-lime-500 hover:bg-lime-800 cursor-pointer hover:bg-opacity-75" // Darken on hover
                />
              </div>

              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <ProjectMetricsCard
                  statSubtitle="Profit Margin"
                  statTitle={`${profitMargin}%`}
                  statArrow={profitMargin >= 0 ? "up" : "down"}
                  statPercent={`${projectedProfitMargin}`}
                  statPercentColor={
                    profitMargin >= 0 ? "text-emerald-500" : "text-red-500"
                  }
                  statDescription="Projected Profit Margin"
                  statIconName={faPercent}
                  statIconColor="bg-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Kanban Board */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ProjectKanbanBoard
          outstandingTasks={outstandingTasks}
          completedTasks={completedTasks}
          users={users}
        />
      </Modal>
    </>
  );
};

export default DashboardHeader;
