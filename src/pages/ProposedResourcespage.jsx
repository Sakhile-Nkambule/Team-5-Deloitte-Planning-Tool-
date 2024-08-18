import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProposedResourcespage = ({ addProjectSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { newProject } = location.state;

  const initialResources = [
    { UserID: 1, role: "Partner/Director", name: "Tadiwa Mukuvudza", hours: 40 },
    { UserID: 2, role: "Senior Manager", name: "Hlubi Mavinjelwa", hours: 30 },
    { UserID: 3, role: "Assistant Manager", name: "Athraa Reynard", hours: 30 },
    { UserID: 4, role: "Associate Director", name: "Sakhile Nkambule", hours: 25 },
    { UserID: 5, role: "Senior Assistant", name: "Mega Gama", hours: 20 },
    { UserID: 6, role: "Junior Consultant", name: "Saneliso Surtee", hours: 15 },
  ];

  const regenerateResource = [
    { role: "Partner/Director", name: "Tadiwa Mukuvudza", hours: 35 },
    { role: "Senior Manager", name: "Sakhile Nkambule", hours: 30 },
    { role: "Assistant Manager", name: "Hlubi Mavinjelwa", hours: 35 },
    { role: "Associate Director", name: "Athraa Reynard", hours: 30 },
    { role: "Junior Assistant", name: "Allen Harper", hours: 15 },
    { role: "Consultant", name: "Jake Harper", hours: 15 },
  ];

  const [resources, setResources] = useState(initialResources);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [exhaustedBudget, setExhaustedBudget] = useState(0);

  useEffect(() => {
    // Fetch users from the database
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users'); //
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const allUsers = await response.json();
        console.log(allUsers);

        // Filter out users who are already proposed
        const proposedUserIDs = resources.map((resource) => resource.UserID);
        const filteredUsers = allUsers.filter((user) => !proposedUserIDs.includes(user.UserID));

        setAvailableUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [resources]);

  useEffect(() => {
    // Calculate initial exhausted budget
    let totalHours = 0;
    resources.forEach((resource) => {
      totalHours += parseInt(resource.hours);
    });
    const calculatedExhaustedBudget = 300 * totalHours; // Assuming a rate of R300 per hour
    setExhaustedBudget(calculatedExhaustedBudget);
  }, [resources]);

  const handleResourceChange = (index, field, value) => {
    const newResources = [...resources];
    newResources[index][field] = value;
    setResources(newResources);
  };

  const addNewResource = (userID) => {
    const selectedUser = availableUsers.find(user => user.UserID === userID);
    if (selectedUser) {
      const newResource = {
        UserID: selectedUser.UserID,
        role: selectedUser.Role,
        name: selectedUser.UserName,
        hours: 0,
      };
      setResources([...resources, newResource]);
    }
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
                disabled
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

          {/* Dropdown to add new resource */}
          <div className="flex flex-col mt-6">
            <label className="block text-gray-700 font-bold mb-2">Add a Resorce</label>
            <select
              onChange={(e) => addNewResource(parseInt(e.target.value))}
              className="border rounded w-full py-2 px-3 mb-2"
            >
              <option value="">Select a Resource</option>
              {availableUsers.map((user) => (
                <option key={user.UserID} value={user.UserID}>
                  {user.UserName} ({user.Role})
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Budget summary */}
        <div className="bg-white p-6 mb-4 shadow-md rounded-md border m-4 md:m-0 w-64">
          <h2 className="text-2xl font-semibold mb-4">Budget Summary</h2>
          <div className="mb-2">
            <p className="text-gray-700 font-semibold">Total Budget:</p>
            <p className="text-green-500 font-semibold">{newProject.Budget}</p>
          </div>
          <div className="mb-2">
            <p className="text-gray-700 font-semibold">Exhausted Budget:</p>
            <p className="text-red-500 font-semibold">{exhaustedBudget}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-700 font-semibold">Profit Margin:</p>
            <p className="font-semibold">
              {newProject.Budget - exhaustedBudget > 0
                ? `R${newProject.Budget - exhaustedBudget}`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProposedResourcespage;
