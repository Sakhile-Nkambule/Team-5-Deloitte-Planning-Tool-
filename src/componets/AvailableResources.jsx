import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const AvailableResources = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users'); // Adjust API endpoint as needed
        const usersData = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {/* Increase margin-top to bring the heading further down */}
      <h2 className="text-2xl font-bold text-center mb-6 text-black">AVAILABLE RESOURCES</h2>
      <ul className="space-y-2">
        {users.map((user) => (
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
  
            {/* Buttons Aligned to the Right */}
            <div className="flex space-x-2">
              <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-full">
                Calendar
              </button>
              <button class="bg-transparent hover:bg-lime-500 text-lime-500 font-semibold hover:text-white py-2 px-4 border border-lime-500 hover:border-transparent rounded-full">
                Add to Project
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
  
};

export default AvailableResources;


