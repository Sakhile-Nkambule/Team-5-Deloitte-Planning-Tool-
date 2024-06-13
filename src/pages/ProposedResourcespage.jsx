import React from 'react'
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ProposedResourcespage = ({addProjectSubmit}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { newProject } = location.state;

    const initialResources = [
        { role: 'Partner/Director', name: 'John Doe', hours: 40 },
        { role: 'Senior Manager', name: 'Jane Smith', hours: 35 },
        { role: 'Assistant Manager', name: 'Alice Johnson', hours: 30 },
        { role: 'Associate Director', name: 'Bob Brown', hours: 25 },
        { role: 'Senior Assistant', name: 'Charlie Green', hours: 20 },
        { role: 'Junior Consultant', name: 'Diana White', hours: 15 },
    ];

    const [resources, setResources] = useState(initialResources);

    const handleResourceChange = (index, field, value) => {
        const newResources = [...resources];
        newResources[index][field] = value;
        setResources(newResources);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const projectWithResources = {
            ...newProject,
            resources
        };
        await addProjectSubmit(projectWithResources);
        return navigate('/projects');
    };

    const regenerateResources = () => {
        // Here you could add logic to regenerate the list of resources
        // For simplicity, we just reset to the initial list
        setResources(initialResources);
    };
  return (
    <section className="bg-indigo-50">
            <div className="container m-auto max-w-2xl py-24">
                <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                    <h2 className="text-3xl text-center font-semibold mb-6">Proposed Resources</h2>
                    {resources.map((resource, index) => (
                        <div key={index} className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Role</label>
                            <select
                                value={resource.role}
                                onChange={(e) => handleResourceChange(index, 'role', e.target.value)}
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
                                onChange={(e) => handleResourceChange(index, 'name', e.target.value)}
                                className="border rounded w-full py-2 px-3 mb-2"
                            />
                            <label className="block text-gray-700 font-bold mb-2">Planned Working Hours</label>
                            <input
                                type="number"
                                value={resource.hours}
                                onChange={(e) => handleResourceChange(index, 'hours', e.target.value)}
                                className="border rounded w-full py-2 px-3"
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
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
                        >   
                            Accept Resources
                        </button>
                    </div>
                </div>
            </div>
        </section>
  );
};

export default ProposedResourcespage;