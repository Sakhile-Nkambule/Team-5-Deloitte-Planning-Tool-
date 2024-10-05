import React, { useState, useEffect } from 'react';
import { useUser } from '../componets/UserContext';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const CompetencyKey = () => (
  <div className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
    <h4 className="text-black text-lg font-semibold mb-2">Competency Levels</h4>
    <ul className="list-disc list-inside">
      <li><strong>Not assigned:</strong> When proficiency is 0%</li>
      <li><strong>Beginner:</strong> When proficiency is between 1% and 35%</li>
      <li><strong>Intermediate:</strong> When proficiency is between 36% and 70%</li>
      <li><strong>Advanced:</strong> When proficiency is between 71% and 100%</li>
    </ul>
  </div>
);

const getColorClass = (proficiency) => {
  if (proficiency >= 1 && proficiency <= 30) {
    return 'bg-red-500'; // Red for 1%-30%
  } else if (proficiency >= 40 && proficiency <= 70) {
    return 'bg-orange-500'; // Orange for 40%-70%
  } else if (proficiency >= 80 && proficiency <= 100) {
    return 'bg-lime-500'; // Lime Green for 80%-100%
  } else {
    return 'bg-gray-300'; // Default for 0%
  }
};

const defaultSkills = {
  SAP: 0,
  JDE: 0,
  Oracle: 0,
  "Genric Application": 0,
  "Microsoft SQL": 0,
  "Oracle DB": 0,
  Linux: 0,
  "Microsoft OS": 0,
  "Active Directory": 0,
  "Cyber memo": 0,
  CTRA: 0,
  DCNO: 0,
  "SAP-AUTO": 0,
  AUTO: 0,
  REVIEW: 0,
  "Project Management": 0,
};

const UserProfilePage = () => {
  const { user } = useUser();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [hourlyRate, setHourlyRate] = useState(user?.rate || '');
  const [skills, setSkills] = useState(defaultSkills);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setHourlyRate(user.rate);

      // Fetch user skills from the API
      fetch(`http://localhost:8081/SkillSets/${user.id}`)
      .then(response => {
        if (response.status === 204) {
          // No content, so return an empty object
          return {};
        }
        return response.json();
      })
      .then(data => {
        // Merge fetched skills with default skills
        const updatedSkills = { ...defaultSkills, ...data };
        setSkills(updatedSkills);
      })
      .catch(error => console.error('Error fetching skills:', error));
  } 
}, [user]);

  const handleSkillChange = (skill, value) => {
    setSkills(prevSkills => ({ ...prevSkills, [skill]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update user profile
    console.log('User profile updated:', { name, email, role, hourlyRate, skills });
    toast.success("Profile updated Successfully");
    
    // Send updated skills to the API
    fetch(`http://localhost:8081/Skillsets/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills }),
    })
      .then(response => response.json())
      .then(data => console.log('Skills updated:', data))
      .catch(error => console.error('Error updating skills:', error));
  };
 

  const renderSkillBar = (skill) => {
    const proficiency = skills[skill] || 0;

    return ( 
      <div key={skill} className="mb-4">
        <div className="flex items-center">
          <span className="block text-gray-700 font-bold w-32">{skill}</span>
          <div className="flex gap-1">
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((percent, index) => (
              <div
                key={index}
                className={`w-6 h-6 cursor-pointer ${getColorClass(percent)} ${
                  proficiency >= percent ? 'bg-opacity-100' : 'bg-opacity-5'
                }`}
                onClick={() => {
                  if (role === "Manager" || role === "Director") {
                    handleSkillChange(skill, percent);
                  } else {
                    toast.error("Only Managers or Directors can edit skills.");
                  }
                }}
              />
            ))}
          </div>
          <span className="ml-2">{proficiency}%</span>
        </div>
      </div>
    );
  };

   //BACK BUTTON
   const navigate = useNavigate();
   const handleGoBack = () => {
     navigate(-1);
    } // Goes back to the previous page
  return (
    
    <section className="bg-lime-100">
      <div className="container m-auto py-2 px-2 text-lime-500 hover:text-lime-700 flex items-center">
          <button onClick={handleGoBack}>
            {" "}
            <FaArrowLeft className="mr-1" /> Back
          </button>
        </div>

      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <form onSubmit={handleSubmit}>
            <h2 className="text-black text-3xl text-center font-semibold mb-6">
              User Profile
            </h2>

            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                User Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="border rounded w-full py-2 px-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                User Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="border rounded w-full py-2 px-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700 font-bold mb-2">
                Role
              </label>
              <select
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
              
                <option value="">Select a Role</option>
                <option value="Director">Director</option>
                <option value="Snr Associate Director">Snr AssociateDirector</option>
                <option value="Associate Director">Associate Director</option>
                <option value="Senior Manager">Senior Manager</option>
                <option value="Manager">Manager</option>
                <option value="Snr Consultant">Snr Consultant</option>
                <option value="Consultant">Consultant</option>
                <option value="Jnr Consultant">Jnr Consultant</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="hourlyRate" className="block text-gray-700 font-bold mb-2">
                Hourly Rate
              </label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                className="border rounded w-full py-2 px-3"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>

            <CompetencyKey />
            <div className="mt-6">
              <h3 className="text-black text-xl font-semibold mb-4">
                Skillsets & Proficiency
              </h3>
              {Object.keys(skills).map((skill) => renderSkillBar(skill))}
            </div>

            <div className="mt-6">
              <button
                className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserProfilePage;
