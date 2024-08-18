import React, { useState, useEffect } from 'react';
import { useUser } from '../componets/UserContext';

const UserProfilePage = () => {
  const { user } = useUser();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [hourlyRate, setHourlyRate] = useState(user?.rate || '');
  const [skills, setSkills] = useState({
    'Cloud Migration': 0,
    'SAP': 0,
    'SQL': 0,
    'Great Plains': 0,
    'Sage': 0,
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setHourlyRate(user.rate);
    }
  }, [user]);

  const handleSkillChange = (skill, value) => {
    setSkills({ ...skills, [skill]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission for updating user profile
    console.log('User profile updated:', { name, email, role, hourlyRate, skills });
  };

  const renderSkillBar = (skill) => {
    const proficiency = skills[skill];

    return (
      <div key={skill} className="mb-4">
        <div className="flex items-center">
          <span className="block text-gray-700 font-bold w-32">{skill}</span>
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((percent, index) => (
              <div
                key={index}
                className={`w-6 h-6 cursor-pointer ${
                  proficiency >= percent ? 'bg-lime-500' : 'bg-gray-300'
                }`}
                onClick={() => handleSkillChange(skill, percent)}
              />
            ))}
          </div>
          <span className="ml-2">{proficiency}%</span>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-lime-100">
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
              <input
                type="text"
                id="role"
                name="role"
                className="border rounded w-full py-2 px-3"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
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
