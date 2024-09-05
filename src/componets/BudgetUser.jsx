
import React from "react";
import { useLoaderData } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const BudgetUser = () => {
    // Fetching project data using useLoaderData
    const { project } = useLoaderData();
    const budget = project.Budget;
    console.log(budget);

    // Calculate used and remaining budget
    const used = budget / 2; // Placeholder for actual used budget value
    const total = budget; // Placeholder for actual total budget value
    const remaining = total - used;

    // Pie chart data
    const data = {
        labels: ["Used Budget", "Remaining Budget"],
        datasets: [
            {
                data: [used, remaining],
                backgroundColor: ["black", "green"],
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
        <div className="flex flex-col items-center">
            <h2 className="text-4xl font-bold text-center mb-6 text-black mt-24">
                PROJECT BUDGET
            </h2>
            <ul className="space-y-2">
                <div className="w-80 h-80"> {/* Chart size adjustment */}
                    <Pie data={data} options={options} />
                </div>
                <p className="mt-6 text-xl">Total Budget: R{total}</p> {/* Display total budget in Rands */}
            </ul>
        </div>
    );
};

export default BudgetUser;



