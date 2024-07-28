

import { useParams, useLoaderData } from "react-router-dom";
import { FaArrowLeft, FaMapMarker } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProjectPage = ({ deleteProject }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const project = useLoaderData();
  const onDeleteClick = (projectId) => {
    const confirm = window.confirm("Are you sure you want to delete this project?");
    if (!confirm) return;
    deleteProject(projectId);
    toast.success("Project Deleted Successfully");
    navigate("/projects");
  };

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/projects"
            className="text-lime-500 hover:text-lime-700 flex items-center"
          >
            <FaArrowLeft className=" mr-1" /> Back to projects
          </Link>
        </div>
      </section>
      <section className="bg-lime-100">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                <div className="text-gray-500 mb-4">{project.type}</div>
                <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
                <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                  <FaMapMarker className="text-orange-700 mr-2" />
                  <p className="text-orange-700"> {project.location}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-lime-500 text-lg font-bold mb-6">Project Description</h3>
                <p className="mb-4">{project.description}</p>
                <h3 className="text-lime-500 text-lg font-bold mb-2">Project Budget</h3>
                <p className="mb-4">{project.salary}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left mt-6">
                <h3 className="text-lime-500 text-lg font-bold mb-2">Company Info</h3>
                <div className="text-gray-700 mb-4">{project.company.name}</div>
                <p className="mb-4">{project.company.description}</p>
                <h3 className="text-gray-700 mb-4">Contact Email:</h3>
                <p className="my-2 bg-indigo-100 p-2 font-bold">{project.company.contact_email}</p>
                <h3 className="text-gray-700 mb-4">Contact Phone:</h3>
                <p className="my-2 bg-indigo-100 p-2 font-bold">{project.company.contact_phone}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left mt-6">
                <Link
                  to="/dashboard"
                  className="bg-black hover:bg-lime-500 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                >
                  View Project Dashboard
                </Link>
              </div>
            </main>
            <aside>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className=" text-lime-400 text-xl font-bold mb-6">Project Resources</h3>
                <ul>
                  {project.resources.map((resource, index) => (
                    <li key={resource.resource_id} className="mb-4">
                      <h4 className="font-bold">{resource.role}</h4>
                      <p>Name: {resource.name}</p>
                      <p>Planned Hours: {resource.hours}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {/* <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-bold mb-6">Manage Project</h3>
                <Link
                  to={`/edit-project/${project.id}`}
                  className="bg-lime-500 hover:bg-lime-700 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                >
                  Edit Project
                </Link>
                <button
                  onClick={() => onDeleteClick(project.id)}
                  className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                >
                  Delete Project
                </button>
              </div> */}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};



//iam telling the loader the endpoints to fetch the data from so i can use the data in each component...
const projectLoader = async ({ params }) => {
  const projectId = params.id;
  
  const projectResponse = await fetch(`http://localhost:8081/project/${projectId}`);
  const projectData = await projectResponse.json();
  
  const companyResponse = await fetch(`http://localhost:8081/company/${projectId}`);
  const companyData = await companyResponse.json();
  
  const resourcesResponse = await fetch(`http://localhost:8081/resources/${projectId}`);
  const resourcesData = await resourcesResponse.json();
  
  return {
    ...projectData,
    company: companyData,
    resources: resourcesData,
  };
};

export { ProjectPage as default, projectLoader };

