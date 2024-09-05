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
      <h2 className="text-4xl font-bold text-center mb-6 text-black mt-24">AVAILABLE RESOURCES</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.UserID} className="flex items-center p-2 bg-white shadow-md rounded-lg">
            <div className="flex items-center w-1/6">
              {/* Placeholder for face icon */}
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

            {/* Start Date */}
            <div className="w-1/6 text-sm text-gray-600">{user.projectStartDate}</div>

            {/* Progress Bar */}
            <div className="w-3/6 flex items-center">
              <div className="relative flex-grow h-6 bg-white border border-black rounded-full overflow-hidden">
                <div
                  className={`absolute h-full ${
                    user.hoursOver ? 'bg-black' : 'bg-green-600'
                  } text-white text-center flex items-center justify-center`}
                  style={{ width: `${(user.hoursWorked / user.totalHours) * 100}%` }}
                >
                  {user.hoursWorked > user.totalHours
                    ? `${user.hoursWorked - user.totalHours}h over`
                    : 'Full'}
                </div>
                <div
                  className="absolute right-0 h-full bg-green-300 text-black text-center flex items-center justify-center"
                  style={{ width: `${(user.hoursAvailable / user.totalHours) * 100}%` }}
                >
                  {user.hoursAvailable}h free
                </div>
              </div>
            </div>

            {/* End Date */}
            <div className="w-1/6 text-sm text-gray-600 text-right">{user.projectDueDate}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AvailableResources;


