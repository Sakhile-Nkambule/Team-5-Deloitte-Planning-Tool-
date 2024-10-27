import { useState } from 'react';
import { FaMapMarker, FaAngleDown, FaCog, FaCogs, FaCubes, FaServer, FaChartLine } from 'react-icons/fa'; // Import dropdown arrow icon
import { FaSignal } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const ProjectListing = ({ project }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Ensure description is a string and provide a default value if undefined
  let description = project.Description ? project.Description : 'No description available';
  if (!showFullDescription && description.length > 0) {
    description = description.substring(0, 0) + '';
  }

  return (
    <div
      className="bg-white rounded-xl shadow-md transition-transform transform hover:scale-105 hover:border-lime-500 hover:shadow-lg relative border-2 border-transparent"
    >
      <div className="p-4">
        <div className="mb-6">
          <div className="text-gray-600 my-2">{project.ProjectCode}</div>
          <h3 className="text-xl font-bold">{project.Title}</h3>
        </div>

        <div className="mb-5">
          {description}
        </div>
        <button
          onClick={() => setShowFullDescription((prevState) => !prevState)}
          className="text-lime-500 mb-5 hover:text-lime-700 flex gap-2 items-center"
        >
          {showFullDescription ? 'Less' : 'Description'}
          <FaAngleDown className={`transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
        </button>

        <h3 className="text-lime-500 mb-2">
        {`R${new Intl.NumberFormat('en-ZA', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(project.Budget)}`}
          </h3>

        

        <div className="border border-gray-100 mb-5"></div>

        <div className="flex flex-col lg:flex-row justify-between mb-4">
          <div className="text-orange-700 mb-3">
            <FaChartLine className="inline text-lg mb-1 mr-1" />
            {project.Status}
          </div>
          <Link
            to={`/project/${project.ProjectID}`}
            className="h-[36px] bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg text-center text-sm"
          >
            Select
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectListing;
