import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProposedResourcespage = ({ addProjectSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { newProject } = location.state;

  const initialResources = [
    { role: "Partner/Director", name: "John Doe", hours: 40, tasks: [""] },
    { role: "Senior Manager", name: "Jane Smith", hours: 35, tasks: [""] },
    {
      role: "Assistant Manager",
      name: "Alice Johnson",
      hours: 30,
      tasks: [""],
    },
    { role: "Associate Director", name: "Bob Brown", hours: 25, tasks: [""] },
    { role: "Senior Assistant", name: "Charlie Green", hours: 20, tasks: [""] },
    { role: "Senior Consultant", name: "Diana White", hours: 15, tasks: [""] },
  ];

  const regenerateResource = [
    { role: "Partner/Director", name: "Tadiwa Mukuvudza", hours: 35, tasks: [""] },
    { role: "Senior Manager", name: "Sakhile Nkambule", hours: 30, tasks: [""] },
    {
      role: "Assistant Manager",
      name: "Hlubi Mavinjelwa",
      hours: 35,
      tasks: [""],
    },
    { role: "Associate Director", name: "Athraa Reynard", hours: 30, tasks: [""] },
    { role: "Junior Assistant", name: "Allen Harper", hours: 15, tasks: [""] },
    { role: " Consultant", name: "Jake Harper", hours: 15, tasks: [""] },
  ];
  const [resources, setResources] = useState(initialResources);
  const [budget, setBudget] = useState(0);
  const [exhaustedBudget, setExhaustedBudget] = useState(0);

  useEffect(() => {
    // Calculate initial budget from newProject's budget
    const parsedSalary = parseFloat(newProject.salary.replace(/[^\d.-]/g, ""));
    setBudget(parsedSalary);

    // Calculate initial exhausted budget
    let totalHours = 0;
    resources.forEach((resource) => {
      totalHours += parseInt(resource.hours);
    });
    const calculatedExhaustedBudget = 300 * totalHours; // Assuming a rate of R300 per hour
    setExhaustedBudget(calculatedExhaustedBudget);
  }, [newProject, resources]);

  const handleResourceChange = (index, field, value) => {
    const newResources = [...resources];
    newResources[index][field] = value;
    setResources(newResources);
  };

  const handleTaskChange = (resourceIndex, taskIndex, value) => {
    const newResources = [...resources];
    newResources[resourceIndex].tasks[taskIndex] = value;
    setResources(newResources);
  };

  const addTaskField = (resourceIndex) => {
    const newResources = [...resources];
    newResources[resourceIndex].tasks.push("");
    setResources(newResources);
  };

  const addNewResource = () => {
    const newResource = {
      role: "Partner/Director",
      name: "",
      hours: 0,
      tasks: [""],
    };
    setResources([...resources, newResource]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectWithResources = {
      ...newProject,
      resources,
    };
    await addProjectSubmit(projectWithResources);
    toast.success("Project Added Successfully");
    return navigate("/projects");
  };

  const regenerateResources = () => {
    setResources(regenerateResource);
  };

  return (
    <section className="bg-indigo-50">
      <div className="container m-auto max-w-2xl py-24 flex">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0 flex-1">
          <h2 className="text-3xl text-center font-semibold mb-6">
            Proposed Resources
          </h2>
          {resources.map((resource, index) => (
            <div key={index} className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Role</label>
              <select
                value={resource.role}
                onChange={(e) =>
                  handleResourceChange(index, "role", e.target.value)
                }
                className="border rounded w-full py-2 px-3 mb-2"
              >
                <option value="Partner/Director">Partner/Director</option>
                <option value="Senior Manager">Senior Manager</option>
                <option value="Assistant Manager">Assistant Manager</option>
                <option value="Associate Director">Associate Director</option>
                <option value="Senior Assistant">Senior Assistant</option>
                <option value="Junior Consultant">Junior Consultant</option>
              </select>
              <label className="block text-gray-700 font-bold mb-2">Name</label>
              <input
                type="text"
                value={resource.name}
                onChange={(e) =>
                  handleResourceChange(index, "name", e.target.value)
                }
                className="border rounded w-full py-2 px-3 mb-2"
              />
              <label className="block text-gray-700 font-bold mb-2">
                Planned Working Hours
              </label>
              <input
                type="number"
                value={resource.hours}
                onChange={(e) =>
                  handleResourceChange(index, "hours", e.target.value)
                }
                className="border rounded w-full py-2 px-3 mb-2"
              />
              <label className="block text-gray-700 font-bold mb-2">
                Tasks
              </label>
              {resource.tasks.map((task, taskIndex) => (
                <div key={taskIndex} className="flex mb-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) =>
                      handleTaskChange(index, taskIndex, e.target.value)
                    }
                    className="border rounded w-full py-2 px-3 mr-2"
                  />
                  {taskIndex === resource.tasks.length - 1 && (
                    <button
                      type="button"
                      onClick={() => addTaskField(index)}
                      className="bg-lime-500 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div className="flex justify-between mt-6">
            <button
              onClick={regenerateResources}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
            >
              Regenerate List
            </button>
            <button
              onClick={handleSubmit}
              className="bg-lime-500 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
            >
              Accept Resources
            </button>
          </div>

          {/* Button to add new resource */}
          <div className="flex justify-end mt-6">
            <button
              onClick={addNewResource}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
            >
              Add New Resource
            </button>
          </div>
        </div>
        {/* budget summary */}
        <div className="bg-white p-6 mb-4 shadow-md rounded-md border m-4 md:m-0 w-64">
          <h2 className="text-2xl font-semibold mb-4">Budget Summary</h2>
          <div className="mb-2">
            <p className="text-gray-700 font-semibold">Total Budget:</p>
            <p className="text-green-500 font-semibold">{newProject.salary}</p>
          </div>
          <div className="mb-2">
            <p className="text-gray-700 font-semibold">Exhausted Budget:</p>
            <p className="text-red-500 font-semibold">{exhaustedBudget}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-700 font-semibold">Profit Margin:</p>
            <p className="font-semibold">
              {budget - exhaustedBudget > 0
                ? `+R${budget - exhaustedBudget}`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProposedResourcespage;
