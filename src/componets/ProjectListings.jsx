import { useState, useEffect } from 'react';
import ProjectListing from './ProjectListing';
import Spinner from './Spinner';
import axios from 'axios';

const ProjectListings = ({ isHome = false }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const apiUrl = isHome 
      
      ? `${import.meta.env.VITE_API_URL}/projects?_limit=3`
      : `${import.meta.env.VITE_API_URL}/projects`;
      try {
        const res = await axios.get(apiUrl);  
        setProjects(res.data);
      } catch (error) {
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isHome]);

  return (
    <section className="bg-lime-100 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">
          {isHome ? 'Recent Projects' : 'Browse Projects'}
        </h2>
        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {projects.map((project) => (
              <ProjectListing key={project.ProjectID} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectListings;
