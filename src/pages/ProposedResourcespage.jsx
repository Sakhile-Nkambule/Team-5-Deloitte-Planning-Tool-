  import React, { useState, useEffect } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  import { toast } from "react-toastify";

  const ProposedResourcespage = ({ addProjectSubmit }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { newProject } = location.state;

    const initialResources = [
      { UserID: 1, role: "Director", name: "Tadiwa Mukuvudza", hours: 40 },
      { UserID: 2, role: "Senior Manager", name: "Hlubi Mavinjelwa", hours: 30 },
      { UserID: 3, role: "Assistant Manager", name: "Athraa Reynard", hours: 30 },
      { UserID: 4, role: "Associate Director", name: "Sakhile Nkambule", hours: 25 },
      { UserID: 5, role: "Senior Assistant", name: "Mega Gama", hours: 20 },
      { UserID: 6, role: "Junior Consultant", name: "Saneliso Surtee", hours: 15 },
    ];

    const regenerateResource = [
      { role: "Director", name: "Tadiwa Mukuvudza", hours: 35 },
      { role: "Senior Manager", name: "Sakhile Nkambule", hours: 30 },
      { role: "Assistant Manager", name: "Hlubi Mavinjelwa", hours: 35 },
      { role: "Associate Director", name: "Athraa Reynard", hours: 30 },
      { role: "Jnr Assistant", name: "Allen Harper", hours: 15 },
      { role: "Consultant", name: "Jake Harper", hours: 15 },
    ];

    const [resources, setResources] = useState(initialResources);

    const [availableUsers, setAvailableUsers] = useState([]);
    const [Budget, setBudget] = useState(newProject.Budget);
    const [exhaustedBudget, setExhaustedBudget] = useState(0);
    const [profitMargin, setProfitMargin] = useState(0);
    const [netRevenue, setNetRevenue] = useState(0);
    const [recoveryRate, setRecoveryRate] = useState(0);

    const financials = {
      Budget,
      exhaustedBudget,
      profitMargin,
      netRevenue,
      recoveryRate

    }
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

      //THE FINANCIALS
      // Calculate initial exhausted budget
      let totalHours = 0;
      resources.forEach((resource) => {
        totalHours += parseInt(resource.hours);
      });
      const calculatedExhaustedBudget = 300 * totalHours; // Assuming a rate of R300 per hour//NEED TO FIX--Fetch user rates
      setExhaustedBudget(calculatedExhaustedBudget);
      //Net Revenue
      const calculateNetRevenue = (newProject.Budget - exhaustedBudget); 
      setNetRevenue(calculateNetRevenue);
      //profit margin
      const calculateProfitMargin = (netRevenue / newProject.Budget) *100; 
      setProfitMargin(calculateProfitMargin);
      //Recovery rate
      const calculateRecoveryRate = (profitMargin); 
      setRecoveryRate(calculateRecoveryRate);
      
    }
  
    , [resources]);

  


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
        financials,
      };
      await addProjectSubmit(projectWithResources);
      toast.success("Project Added Successfully");
      return navigate("/projects");
    };

    const regenerateResources = () => {
      setResources(regenerateResource);
    };

    // Function to send a notification to the Associate Director
    const sendNotification = async () => {
      // Find the Director from the resources array
      const associateDirector = resources.find(
        (resource) => resource.role === "Director"
      );
    
      if (associateDirector) {
        try {
          const notificationData = {
            UserID: associateDirector.UserID,
            Message: "Permission requested for a project involving you.",
            Type: "In-App",
            Priority: "High",
          };
    
          const response = await fetch("http://localhost:8081/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(notificationData),
          });
    
          if (response.ok) {
            toast.success("Permission request sent successfully");
          } else {
            toast.error("Failed to send permission request");
          }
        } catch (error) {
          console.error("Error sending notification:", error);
          toast.error("An error occurred while sending the permission request");
        }
      } else {
        toast.error("No Director found in the resources");
      }
    };
    
    


    return (
  <section className="bg-lime-50">
    <div className="container m-auto py-24 relative">
      <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
        <h2 className="text-3xl text-center font-semibold mb-6">
          Proposed Resources
        </h2>

        {/* Budget summary in the top right corner */}
        <div className="absolute top-40 right-20 transform translate-x-1/2 -translate-y-1/2 bg-white h-120 p-6 shadow-md rounded-md border w-100">
          <h2 className="text-2xl font-semibold mb-4 text-center">Budget Summary</h2>
          <div className="mb-2">
            <p className="text-gray-700 font-semibold">Gross Revenue:</p>
            <p className="text-green-500 font-semibold">{`R${newProject.Budget}`}</p>
          </div>
          
          <div className="mb-2">
            <p className="text-gray-700 font-semibold">Total Costs:</p>
          <p className="text-red-500 font-semibold">{`R${exhaustedBudget}`}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-700 font-semibold">Net Revenue:</p>
            <p className="font-semibold">
              {`R${netRevenue}`}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-gray-700 font-semibold">Profit Margin:</p>
            <p className="font-semibold">
              {`${profitMargin}%`
                }
            </p>
          </div>
          <div className="mb-2">
            <p className="text-gray-700 font-semibold">Recovery Rate:</p>
          <p className="text-red-500 font-semibold">{`${recoveryRate}%`}</p>
          </div>

        </div>

        {/* Container for resource items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-40">
          {resources.map((resource, index) => (
            <div key={index} className="mb-4 shadow-lg p-4 border rounded-md">
              <label className="block text-gray-700 font-bold mb-2">Role</label>
              <select
                value={resource.role}
                onChange={(e) =>
                  handleResourceChange(index, "role", e.target.value)
                }
                className="border rounded w-full py-2 px-3 mb-2"
              >
                <option value="Partner/Director">Director</option>
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
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={regenerateResources}
            className="bg-blue-600 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
          >
            Regenerate List
          </button>
          <button
            onClick={handleSubmit}
            className="bg-lime-500 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
          >
            Accept Resources
          </button>
          <button
            onClick={sendNotification}
            className="bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
          >
            Request Permission
          </button>
        </div>

        {/* Dropdown to add new resource */}
        <div className="flex flex-col mt-6">
          <label className="block text-gray-700 font-bold mb-2">
            Add a Resource
          </label>
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
    </div>
  </section>


    );
  };

  export default ProposedResourcespage;
