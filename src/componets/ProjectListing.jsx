import {useState} from 'react';
import {FaMapMarker} from 'react-icons/fa'
import { Link } from 'react-router-dom';
const ProjectListing = ({project}) => {
    const[showFullDescription, setShowFullDescription]= useState(false);
    let description = project.description;
    if(!showFullDescription){
        description = description.substring(0,90)+ '...';
    }
  return (
    <div className="bg-white rounded-xl shadow-md relative">
            <div className="p-4">
              <div className="mb-6">
                <div className="text-gray-600 my-2">{project.type}</div>
                <h3 className="text-xl font-bold">{project.title}</h3>
              </div>

              <div className="mb-5">
                {description}
              </div>
              <button onClick={()=>setShowFullDescription((prevState)=>(!prevState))} className="text-green-400 mb-5 hover:text-green-600">
                {showFullDescription? 'Less': 'More'}
              </button>

              <h3 className="text-green-500 mb-2">{project.salary}</h3>

              <div className="border border-gray-100 mb-5"></div>

              <div className="flex flex-col lg:flex-row justify-between mb-4">
                <div className="text-orange-700 mb-3">
                  <FaMapMarker className= 'inline text-lg mb-1 mr-1'/>
                  {project.location}
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  className="h-[36px] bg-green-400 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-center text-sm"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
  );
};

export default ProjectListing;