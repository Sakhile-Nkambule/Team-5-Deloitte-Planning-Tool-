
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import ProjectListing from './ProjectListing';

const UserProjectListings = ({ userId, isUserHome = false }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const apiUrl = isUserHome ? `/api/user-projects/${userId}?_limit=3` : `/api/user-projects/${userId}`;
      try {
        const res = await axios.get(apiUrl);
        console.log('API response:', res.data); // Debugging line
        setProjects(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log('Error fetching data', error);
        setProjects([]); // Handle error by setting an empty array
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isUserHome, userId]);

  return (
    <section className="bg-lime-100 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">
          {isUserHome ? 'Recent Projects' : 'Browse Projects'}
        </h2>
        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectListing key={project.ProjectID} project={project} />
              ))
            ) : (
              <p>No projects found</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserProjectListings;
