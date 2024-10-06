import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Calendar from "./Calendar";
import Modal from "./modal";
import Spinner from "./Spinner";

const AvailableResources = ({ resources, project }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dateTasks, setDateTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Director"); // Default to Director

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
  ];

  // Fetch users on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8081/users");
        const usersData = await response.json();

        const filteredUsers = usersData.filter(
          (user) =>
            !resources.some((resource) => resource.UserID === user.UserID)
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, [resources]);

  // Handle calendar click to open modal
  const handleCalendarClick = (resource) => {
    setSelectedUser(resource);
    setIsCalendarModalOpen(true); // Open the calendar modal
    fetchUserTasks(user.UserID);
  };

  // Fetch user tasks
  const fetchUserTasks = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8081/tasks/user/${userId}`
      );
      const data = await response.json();
      setDateTasks(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      setIsLoading(false);
    }
  };

  // Handle add to project click
  const handleAddToProjectClick = (user) => {
    setSelectedUser(user);
    setIsAddModalOpen(true); // Open the add to project modal
  };

  // Confirm adding user to project
  const confirmAddToProject = async () => {
    if (selectedUser) {
      try {
        const response = await fetch(
          "http://localhost:8081/projects/addResource",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              UserID: selectedUser.UserID,
              ProjectID: project.ProjectID, // Access ProjectID from project prop
              Role: selectedUser.Role,
              PlannedHours: 0,
              WorkedHours: 0,
            }),
          }
        );

        if (response.ok) {
          toast.success(
            `${selectedUser.UserName} has been successfully added to project ${project.ProjectCode}`
          );
        } else {
          const result = await response.json();
          toast.error(`Failed to add resource: ${result.message}`);
        }
      } catch (error) {
        console.error("Error adding resource:", error);
        toast.error("An error occurred while adding the resource.");
      }
    }
    setIsAddModalOpen(false);
  };

  // Filter users by selected role
  const filteredUsers =
    selectedRole === "All"
      ? users
      : users.filter((user) => user.Role === selectedRole);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        AVAILABLE RESOURCES
      </h2>

      {/* Role Filtering */}
      <div className="mb-4">
        <label className="mr-2">Filter by Role:</label>
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
                <span className="block font-bold text-sm">{user.UserName}</span>
                <span className="block text-xs text-gray-500">{user.Role}</span>
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

      {/* Modal for Calendar */}
      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      >
        <h3 className="text-xl font-bold text-center mb-4">
          Calendar for {selectedUser?.UserName}
        </h3>
        {isLoading ? <Spinner /> : <Calendar tasks={dateTasks} />}
      </Modal>

      {/* Modal for Add to Project Confirmation */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <h3 className="text-xl font-bold text-center mb-4">
          Confirm Addition of {selectedUser?.UserName} to Project{" "}
          {project.ProjectCode}?
        </h3>
        <div className="flex justify-center space-x-4">
          <button
            onClick={confirmAddToProject}
            className="bg-green-500 text-white px-4 py-2 rounded-full"
          >
            Confirm
          </button>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="bg-red-500 text-white px-4 py-2 rounded-full"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AvailableResources;
