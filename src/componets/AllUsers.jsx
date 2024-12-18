import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Calendar from "./Calendar";
import Modal from "./modal";
import Spinner from "./Spinner";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("All"); // Default to Director
  const navigate = useNavigate(); // Initialize the navigate function

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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users`);
        const usersData = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Filter users by selected role
  const filteredUsers =
    selectedRole === "All"
      ? users
      : users.filter((user) => user.Role === selectedRole);

  // Handle profile button click
  const handleProfileClick = (user) => {
    navigate(`/Profile/${user.UserID}`); // Navigate to the user profile page
  };

  const handleRemoveClick = async (user) => {
    try {
      // Confirm with the user before removing the user
      if (
        window.confirm(
          "Are you sure you want to delete this User from the planning Tool?"
        )
      ) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/user/${user.UserID}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          // Remove the user from the state if the request was successful
          setUsers(users.filter((u) => u.UserID !== user.UserID));
          toast.success("User removed successfully.");
        } else {
          toast.error("Failed to remove user.");
        }
      }
    } catch (error) {
      console.error("Failed to remove user", error);
      toast.error("An error occurred while removing the user.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        ALL USERS
      </h2>
      {loading ? (
        <Spinner loading={loading} />
      ) : (
        <>
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
                    onClick={() => handleProfileClick(user)} // Go to user profile
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-full"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => handleRemoveClick(user)} // Go to user profile
                    className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-full"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AllUsers;
