import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../componets/Spinner";
import Calendar from "../componets/Calendar";
import Modal from "../componets/modal";

const ProposedResourcesPage = ({ addProjectSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { newProject } = location.state;
  console.log(newProject);

  const [resources, setResources] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [Budget, setBudget] = useState(newProject.Budget);
  const [exhaustedBudget, setExhaustedBudget] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [netRevenue, setNetRevenue] = useState(0);
  const [recoveryRate, setRecoveryRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateTasks, setDateTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Suggested Resources");
  const [users, setUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [permissionreason, setpermissionreason] = useState(null);
  


  useEffect(() => {
  //Fetching all users from the backend
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8081/users");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const allUsers = await response.json();

        // Fetch tasks and skills proficiency for each user
        const usersWithTasksAndSkills = await Promise.all(
          allUsers.map(async (user) => {
            try {
              // Fetch skills
              const skillsResponse = await fetch(
                `http://localhost:8081/skillsets/${user.UserID}`
              );
              const skillsProficiency = skillsResponse.ok
                ? await skillsResponse.json()
                : {};

              // Fetch tasks
              const tasksResponse = await fetch(
                `http://localhost:8081/tasks/user/${user.UserID}`
              );
              const tasks = tasksResponse.ok ? await tasksResponse.json() : [];

              // Filter tasks based on project StartDate and EndDate
              const filteredTasks = tasks.filter((task) => {
                const dueDate = new Date(task.DueDate);
                const projectStartDate = new Date(newProject.StartDate);
                const projectEndDate = new Date(newProject.EndDate);

                // Include only tasks with due dates inside the project range
                return dueDate >= projectStartDate && dueDate <= projectEndDate;
              });

              return {
                ...user,
                SkillsProficiency: skillsProficiency,
                TaskCount: filteredTasks.length, // Count tasks inside project range
              };
            } catch (error) {
              console.error(
                `Error fetching data for user ${user.UserID}:`,
                error
              );
              return { ...user, SkillsProficiency: {}, TaskCount: 0 };
            }
          })
        );

        console.log(
          "Fetched Users with Skills and Tasks:",
          usersWithTasksAndSkills
        );
        //AvaileUsers is equal to users with tasks and skills
        setAvailableUsers(usersWithTasksAndSkills);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [newProject.StartDate, newProject.EndDate]);

  //Filtering availableUsers and set them to Users
  useEffect(() => {
    const filteredUsers = availableUsers.filter(
      (user) => !resources.some((resource) => resource.UserID === user.UserID)
    );
    setUsers(filteredUsers);

    console.log("CHECKKK :", availableUsers);
      //Creating ML payload
    if (availableUsers.length > 0) {
      const mlPayload = {
        ProjectComplexity: newProject.complexity,
        SystemRequirement: newProject.selectedApplications,
        Users: availableUsers.map((user) => ({
          UserID: user.UserID,
          UserRole: user.Role,
          UserSkillsProficiency: user.SkillsProficiency,
          TaskCount: user.TaskCount, // Pass task count to ML model if needed
        })),
      };

      console.log("ML Payload:", mlPayload);

      //Making a call to the ML model

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
          console.log("ML Predictions:", predictionResult);

          // Sort users with prediction 1 by fewer tasks and then by probability
          const usersWithPrediction1 = predictionResult.predictions
            .filter((prediction) => prediction.prediction === 1)
            .map((prediction) => ({
              ...availableUsers.find((u) => u.UserID === prediction.UserID),
              probability: prediction.prediction_probability,
            }))
            .sort(
              (a, b) =>
                a.TaskCount - b.TaskCount ||
                b.prediction_probability - a.prediction_probability
            ); // Prioritize by task count, then probability

          console.log("CHECK: ", usersWithPrediction1);
          const roleMap = new Map();
          usersWithPrediction1.forEach((user) => {
            if (!roleMap.has(user.Role)) {
              roleMap.set(user.Role, user);
            }
          });

          // Ensure roles are filled
          const missingRoles = new Set([
            "Director",
            "Associate Director",
            "Snr Associate Director",
            "Senior Manager",
            "Manager",
            "Assistant Manager",
            "Snr Consultant",
            "Consult",
            "Jnr Consultant",
          ]);

          availableUsers.forEach((user) => {
            if (!roleMap.has(user.Role) && missingRoles.has(user.Role)) {
              roleMap.set(user.Role, user);
              missingRoles.delete(user.Role);
            }
          });
          //Array of selected resources to be proposed( Users with predictions of 1 and mostly available)
          const selectedResources = Array.from(roleMap.values())
            .slice(0, 9)
            .map((user) => ({
              UserID: user.UserID,
              Role: user.Role,
              UserName: user.UserName,
              HourlyRate: user.HourlyRate,
              hours: 20, // Default planned hours
              TaskCount: user.TaskCount,
            }));

          setResources(selectedResources);
          console.log("Selected Resources:", selectedResources);

          // Create array of unselected resources from the ordered list in roleMap to create suggested list
          const unselectedResources = Array.from(roleMap.values())
            .slice(9) // Get users from index 6 onwards (those not selected)
            .map((user) => ({
              UserID: user.UserID,
              Role: user.Role,
              UserName: user.UserName,
              HourlyRate: user.HourlyRate,
              TaskCount: user.TaskCount, 
            }));
          setSuggestedUsers(unselectedResources);

          console.log("Unselected Resources:", unselectedResources);
        } catch (error) {
          console.error("Error fetching ML predictions:", error);
        }
      };

      fetchMLPredictions();
    }
  }, [availableUsers, newProject.complexity, newProject.selectedApplications]);

  useEffect(() => {
    const calculateFinancials = () => {
      let totalHours = 0;
      let totalCost = 0;

      resources.forEach((resource) => {
        const hours = parseInt(resource.hours, 10);
        const rate = resource.HourlyRate || 300; // Use the hourly rate from the user or a default
        totalHours += hours;
        totalCost += hours * rate;
      });

      setExhaustedBudget(totalCost); // Set the total cost instead of using a fixed rate

      setNetRevenue(newProject.NetRevenue);

      const calculatedProfitMargin =
        ((newProject.NetRevenue - totalCost) / newProject.NetRevenue) * 100;
      setProfitMargin(calculatedProfitMargin.toFixed(2));

      const calculatedRecoveryRate = (newProject.NetRevenue / newProject.Budget)* 100; // Assuming recovery rate = profit margin
      setRecoveryRate(calculatedRecoveryRate.toFixed(2));
    };

    calculateFinancials();
  }, [resources, newProject.Budget]);

  const handleResourceChange = (index, field, value) => {
    const newResources = [...resources];
    newResources[index][field] = value;
    setResources(newResources);
  };

  //function to add a new resource
  const addNewResource = (userID) => {
    const selectedUser = availableUsers.find((user) => user.UserID === userID);
    if (selectedUser) {
      const newResource = {
        UserID: selectedUser.UserID,
        Role: selectedUser.Role,
        UserName: selectedUser.UserName,
        HourlyRate: selectedUser.HourlyRate,
        hours: 0,
        TaskCount: selectedUser.TaskCount,
      };
      setResources([...resources, newResource]);

      // Remove the user from unselectedResources
      setSuggestedUsers(
        suggestedUsers.filter((user) => user.UserID !== userID)
      );
    }
  };
//Handle Add to project click event
  const handleAddToProjectClick = (user) => {
    addNewResource(user.UserID);
    console.log("Final Check: ", resources);
  };

  //Function to Remove resources

  const removeResource = (index) => {
    // Get the resource being removed
    const removedResource = resources[index];

    // Update the selected resources by removing the selected resource
    setResources(resources.filter((_, i) => i !== index));

    // Add the removed resource back to unselected resources
    setSuggestedUsers((prevUnselected) => [...prevUnselected, removedResource]);
  };


  



const handleSubmit = async (e) => {
  e.preventDefault();

  // If conditions for showing the modal are met
  if (profitMargin < 57 || recoveryRate < 50) {
    if (profitMargin < 57) {
      setpermissionreason("*Profit margin is below 57%");
    }
    if (recoveryRate < 50) {
      setpermissionreason("*Recovery rate is below 50%");
    }
    setNotificationModalOpen(true);
    return; // Stop further submission until notification is handled
  }

  // If no permission is required, proceed with form submission
  await submitProject();
};

const handleNotificationSubmit = async () => {
  if (!notificationMessage.trim()) {
    toast.error("Notification message cannot be empty.");
    return;
  }

  // Send the notification
  await sendNotification(notificationMessage);

  // Close the notification modal
  setNotificationModalOpen(false);

  // Proceed with form submission after notification is sent
  await submitProject();
};

const submitProject = async () => {
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

  console.log("Project with Resources Payload:", projectWithResources); // Debugging
  await addProjectSubmit(projectWithResources);
  toast.success("Project Added Successfully");
  navigate("/projects");
};



  // Function to send a notification to the Associate Director
  const sendNotification = async (message) => { // Accept the message as a parameter
    console.log("Sending notification with message:", message); 
    const associateDirector = resources.find(
      (resource) => resource.Role === "Director"
    );
    if (associateDirector) {
      try {
        const notificationData = {
          UserID: associateDirector.UserID,
          Message: `Permission requested for project "${newProject.Title}" involving you.Reason ${message}`, // Use the passed message here
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
  
  
//Fetching all user tasks
  const fetchUserTasks = async (userId) => {
    setIsLoading(true);//Spinner
    try {
      const response = await fetch(`http://localhost:8081/tasks/user/${userId}`);
      const data = await response.json();
      setDateTasks(data);//Set dateTasks to feed into calender component
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      setIsLoading(false);
    }
  };

  const handleCalendarClick = (resource) => {
    setSelectedUser(resource);
    setIsCalendarModalOpen(true); // Open the calendar modal
    fetchUserTasks(resource.UserID);
  };
//preparing date range to pass into calender
  const projectStartDate = newProject.StartDate; 
  const projectEndDate = newProject.EndDate; 

  const projectDateRange = {
    start: projectStartDate,
    end: projectEndDate,
  };

  //Function for filter roles
  const roles = [
    "Director",
    "Snr Associate Director",
    "Associate Director",
    "Senior Manager",
    "Manager",
    "Assistant Manager",
    "Snr Consultant",
    "Consultant",
    "Jnr Consultant",
    "Suggested Resources", // Added to handle suggested resources
  ];

  // Filter users based on selectedRole
  const filteredUsers =
    selectedRole === "All"
      ? users
      : selectedRole === "Suggested Resources"
      ? suggestedUsers // Use unselectedResources directly
      : users.filter((user) => user.Role === selectedRole);

  console.log("Filtered Users:", filteredUsers);

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

          <div className="flex justify-center items-center space-x-40 bg-white h-120 p-6 shadow-md rounded-full  w-100">
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
              <p className="font-semibold">{`R${newProject.NetRevenue}`}</p>
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

                    {/* Calendar Icon */}
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="cursor-pointer text-gray-500 absolute top-2 left-10"
                      onClick={() => handleCalendarClick(resource)}
                    />
                    {/* Add Task Count */}
                    <p className="mt-2 text-gray-600 font-semibold">
                      Engagements:{" "}
                      {resource.TaskCount !== undefined
                        ? resource.TaskCount
                        : ""}
                    </p>

                    <label className="block text-gray-700 font-bold mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={resource.Role}
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
                      value={resource.UserName}
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
            {/* <button
              onClick={sendNotification}
              className="bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
            >
              Request Permission
            </button> */}
          </div>

          <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-black">
              Add Resources
            </h2>

            {/* Role Filtering */}
            <div className="mb-4">
              <label className="mr-2">Filter by:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border rounded p-2"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <ul className="space-y-2">
              {filteredUsers.map((user) => (
                <li
                  key={user.UserID}
                  className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg"
                >
                  {/* User Info */}
                  <div className="flex items-center w-1/2">
                    <div className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full mr-4">
                      <span role="img" aria-label="face-icon">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                    </div>
                    <div>
                      <span className="block font-bold text-sm">
                        {user.UserName}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {user.Role}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCalendarClick(user)} // Open modal with calendar
                      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-full"
                    >
                      Calendar
                    </button>
                    <button
                      onClick={() => handleAddToProjectClick(user)} // Open add to project modal
                      className="bg-transparent hover:bg-lime-500 text-lime-500 font-semibold hover:text-white py-2 px-4 border border-lime-500 hover:border-transparent rounded-full"
                    >
                      Add to Project
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal for Calendar */}
      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      >
        <h3 className="text-xl font-bold text-center mb-4">
          Calendar for {selectedUser?.UserName}
        </h3>
        {isLoading ? (
          <Spinner />
        ) : (
          <Calendar tasks={dateTasks} projectDateRange={projectDateRange} />
        )}
      </Modal>

      {/* Modal for Notification */}
      <Modal
  isOpen={isNotificationModalOpen}
  onClose={() => setNotificationModalOpen(false)}
 
>
  <h3 className="text-xl font-bold text-center mb-4">Permission Request</h3>
  <div className="mb-4">
    <p className="text-center text-red-500 ">
      {`${permissionreason} . The project's financials are not within the acceptable range.`}
    </p>
    <label className="block text-gray-700 font-bold mb-2">
      Permission Message
    </label>
    <textarea
      id="NotificationMessage"
      name="NotificationMessage"
      className="border rounded w-full py-2 px-3"
      rows="4"
      placeholder="What is the reason for this permission request?"
      value={notificationMessage}
      onChange={(e) => setNotificationMessage(e.target.value)}
    />
    <button
      onClick={handleNotificationSubmit}
      className="bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
    >
      Request Permission
    </button>
  </div>
</Modal>

    </section>
  );
};

export default ProposedResourcesPage;
