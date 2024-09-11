import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../componets/Spinner";

const ProposedResourcesPage = ({ addProjectSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { newProject } = location.state;

  const [resources, setResources] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [Budget, setBudget] = useState(newProject.Budget);
  const [exhaustedBudget, setExhaustedBudget] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [netRevenue, setNetRevenue] = useState(0);
  const [recoveryRate, setRecoveryRate] = useState(0);
  const [loading, setLoading] = useState(true);

  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Fetch users from the backend
    const fetchUsers = async () => {
      setLoading(true); // Set loading to true when the fetch starts
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const allUsers = await response.json();

        // Fetch skills proficiency for each user
        const usersWithSkills = await Promise.all(
          allUsers.map(async (user) => {
            try {
              const skillsResponse = await fetch(
                `/api/skillsets/${user.UserID}`
              );
              if (!skillsResponse.ok) {
                throw new Error(
                  `Failed to fetch skills for user ${user.UserID}`
                );
              }
              const skillsProficiency = await skillsResponse.json();
              return { ...user, SkillsProficiency: skillsProficiency };
            } catch (error) {
              console.error(
                `Error fetching skills for user ${user.UserID}:`,
                error
              );
              return { ...user, SkillsProficiency: {} }; // Handle error by setting empty skills
            }
          })
        );

        console.log("Fetched Users with Skills:", usersWithSkills); // Debug fetched users with skills
        setAvailableUsers(usersWithSkills);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false); // Set loading to false when the fetch completes, whether successful or failed
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (availableUsers.length > 0) {
      // Prepare the payload for the ML API
      const mlPayload = {
        ProjectComplexity: newProject.complexity,
        SystemRequirement: newProject.selectedApplications,
        Users: availableUsers.map((user) => ({
          UserID: user.UserID,
          UserRole: user.Role,
          UserSkillsProficiency: user.SkillsProficiency, // Adjust based on your backend data structure
        })),
      };

      console.log("ML Payload:", mlPayload); // Debug ML payload

      // Send the payload to the ML API
      const fetchMLPredictions = async () => {
        try {
          const response = await fetch("http://localhost:5051/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(mlPayload),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch predictions from the ML API");
          }

          const predictionResult = await response.json();
          console.log("ML Predictions:", predictionResult); // Debug ML predictions

          const selectedUsers = predictionResult.predictions
            .filter((prediction) => prediction.prediction === 1)
            .slice(0, 6);

          // Map the selected users to the format needed for display
          const selectedResources = selectedUsers.map((prediction) => {
            const user = availableUsers.find(
              (u) => u.UserID === prediction.UserID
            );
            return {
              UserID: user.UserID,
              role: user.Role,
              name: user.UserName,
              hours: 20, // Default planned hours
            };
          });

          setResources(selectedResources);
          console.log("Selected Resources:", selectedResources); // Debug selected resources
        } catch (error) {
          console.error("Error fetching ML predictions:", error);
        }
      };

      fetchMLPredictions();
    }
  }, [availableUsers, newProject.complexity, newProject.requiredApplications]);

  useEffect(() => {
    // Calculate the financials
    const calculateFinancials = () => {
      let totalHours = resources.reduce(
        (acc, resource) => acc + parseInt(resource.hours),
        0
      );
      const calculatedExhaustedBudget = 300 * totalHours; // Assuming a rate of R300 per hour
      setExhaustedBudget(calculatedExhaustedBudget);

      const calculatedNetRevenue =
        newProject.Budget - calculatedExhaustedBudget;
      setNetRevenue(calculatedNetRevenue);

      const calculatedProfitMargin =
        (calculatedNetRevenue / newProject.Budget) * 100;
      setProfitMargin(calculatedProfitMargin);

      const calculatedRecoveryRate = calculatedProfitMargin; // Assuming recovery rate = profit margin
      setRecoveryRate(calculatedRecoveryRate);
    };

    calculateFinancials();
  }, [resources, newProject.Budget]);

  const handleResourceChange = (index, field, value) => {
    const newResources = [...resources];
    newResources[index][field] = value;
    setResources(newResources);
  };

  const addNewResource = (userID) => {
    const selectedUser = availableUsers.find((user) => user.UserID === userID);
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
      financials: {
        Budget,
        exhaustedBudget,
        profitMargin,
        netRevenue,
        recoveryRate,
      },
    };
    console.log("Project with Resources Payload:", projectWithResources); // Debug project with resources payload
    await addProjectSubmit(projectWithResources);
    toast.success("Project Added Successfully");
    navigate("/projects");
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
    <section className="bg-lime-100">
      <div className="container m-auto py-24 relative">
        <h1 className="text-4xl text-center font-semibold mb-6">
          Proposed Resources
        </h1>
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          {/* Budget summary in the top right corner */}
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Budget Summary
          </h2>
          <div className="flex justify-center items-center space-x-40 bg-white h-120 p-6 shadow-md  rounded-full boarder w-100 ">
            <div className="mb-2 ">
              <p className="text-gray-700 font-semibold">Gross Revenue:</p>
              <p className="text-green-500 font-semibold">{`R${newProject.Budget}`}</p>
            </div>

            <div className="mb-2 ">
              <p className="text-gray-700 font-semibold">Total Costs:</p>
              <p className="text-red-500 font-semibold">{`R${exhaustedBudget}`}</p>
            </div>
            <div className="mb-2 ">
              <p className="text-gray-700 font-semibold">Net Revenue:</p>
              <p className="font-semibold">{`R${netRevenue}`}</p>
            </div>
            <div className="mb-2 ">
              <p className="text-gray-700 font-semibold">Profit Margin:</p>
              <p className="font-semibold">{`${profitMargin}%`}</p>
            </div>
            <div className="mb-2">
              <p className="text-gray-700 font-semibold">Recovery Rate:</p>
              <p className="text-red-500 font-semibold">{`${recoveryRate}%`}</p>
            </div>
          </div>
          <div>
            {loading ? (
              <Spinner />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className="relative mb-4 shadow-lg p-4 border rounded-md"
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="cursor-pointer text-gray-500 absolute top-2 right-2"
                      onClick={() => removeResource(index)}
                    />
                    <label className="block text-gray-700 font-bold mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={resource.role}
                      onChange={(e) =>
                        handleResourceChange(index, "role", e.target.value)
                      }
                      className="border rounded w-full py-2 px-3 mb-2"
                      readOnly
                    />
                    <label className="block text-gray-700 font-bold mb-2">
                      Name
                    </label>
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
                      className="border rounded w-full py-2 px-3"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
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

export default ProposedResourcesPage;
