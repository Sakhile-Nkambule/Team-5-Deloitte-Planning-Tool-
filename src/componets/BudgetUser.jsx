import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const BudgetUser = () => {
    // Fetching project data using useLoaderData
    const { project } = useLoaderData();
    const [netRevenue, setNetRevenue] = useState(0);
    const [totalCosts, setTotalCosts] = useState(0);
    const [resources, setResources] = useState([]);

    // Fetch resources data (assuming you have an endpoint for this)
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/resources/${project.ProjectID}`); // Adjust the endpoint accordingly
                const data = await response.json();
                setResources(data);
            } catch (error) {
                console.error("Error fetching resources:", error);
            }
        };

        fetchResources();
    }, [project.ProjectID]);

    useEffect(() => {
        const fetchFinancialsAndCalculateCosts = async () => {
            try {
                // Fetch project financials
                const financialResponse = await fetch(`${import.meta.env.VITE_API_URL}/financials/${project.ProjectID}`);
                const financialData = await financialResponse.json();
                const netRevenue = financialData.NetRevenue || 0; // Get Net Revenue

                // Fetch users to get their hourly rates
                const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/users`);
                const usersData = await usersResponse.json();

                // Create a map for hourly rates by UserID
                const hourlyRatesMap = {};
                usersData.forEach(user => {
                    hourlyRatesMap[user.UserID] = user.HourlyRate; // Assuming User model has UserID and HourlyRate
                });

                // Calculate total costs based on resources' worked hours and their corresponding hourly rates
                let totalCosts = 0;
                resources.forEach(resource => {
                    const userHourlyRate = hourlyRatesMap[resource.UserID] || 0; // Get the hourly rate from the map
                    totalCosts += userHourlyRate * Number(resource.WorkedHours || 0); // Calculate costs for this resource
                });

                setNetRevenue(netRevenue);
                setTotalCosts(totalCosts);
            } catch (error) {
                console.error("Error fetching financials or users:", error);
            }
        };

        fetchFinancialsAndCalculateCosts();
    }, [resources, project.ProjectID]);

    // Calculate remaining budget
    const used = totalCosts; // Total costs represent the used budget
    const remaining = netRevenue - used; // Remaining budget calculation

    // Pie chart data
    const data = {
        labels: ["Used Budget", "Remaining Budget"],
        datasets: [
            {
                data: [used, remaining],
                backgroundColor: ["black", "#9AD62A"],
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || "";
                        const value = context.raw;
                        return `${label}: R${value}`; // Display in Rands
                    },
                },
            },
        },
    };

    return (
        <div className="flex flex-col p-5 items-center">
            <h2 className="text-2xl font-bold text-center mb-6 text-black">
                PROJECT BUDGET
            </h2>
            <ul className="space-y-2">
                <div className="h-80"> {/* Chart size adjustment */}
                    <Pie data={data} options={options} />
                </div>
                <p className="mt-6 ">Total Net Revenue: R{netRevenue}</p> {/* Display total net revenue in Rands */}
                <p className="mt-2 ">Total Costs: R{totalCosts}</p> {/* Display total costs in Rands */}
            </ul>
        </div>
    );
};

export default BudgetUser;
