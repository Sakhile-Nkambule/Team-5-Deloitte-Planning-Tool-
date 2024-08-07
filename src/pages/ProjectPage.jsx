import { useParams, useLoaderData } from "react-router-dom";
import { FaArrowLeft, FaMapMarker } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from '../componets/UserContext'; // Import the useUser hook

const ProjectPage = ({ deleteProject }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { project, client, resources } = useLoaderData(); // Destructure data from loader
  const { user } = useUser(); // Get user from context

  const userRole = user?.role; // Get the user's role

  const onDeleteClick = (projectId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this project?"
    );

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
            <FaArrowLeft className="mr-1" /> Back to projects
          </Link>
        </div>
      </section>

      <section className="bg-lime-100">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                <div className="text-gray-500 mb-4">{project.ProjectCode}</div>
                <h1 className="text-3xl font-bold mb-4">{project.Title}</h1>
                <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                  <FaMapMarker className="text-orange-700 mr-2" />
                  <p className="text-orange-700"> {project.Status}</p>
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-lime-500 text-lg font-bold mb-6">
                  Project Description
                </h3>
                <p className="mb-4">{project.Description}</p>
                <h3 className="text-lime-500 text-lg font-bold mb-2">
                  Project Budget
                </h3>
                <p className="mb-4">{project.Budget}</p>
              </div>

              {/* Company Info */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left mt-6">
                <h3 className="text-lime-500 text-lg font-bold mb-2">
                  Company Info
                </h3>
                <div className="text-gray-700 mb-4">{client.CompanyName}</div>
                <p className="mb-4">{client.CompanyDescription}</p>
                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  {client.CompanyLocation}
                </p>
                <h3 className="text-gray-700 mb-4">Contact Email:</h3>
                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  {client.ContactEmail}
                </p>
                <h3 className="text-gray-700 mb-4">Contact Phone:</h3>
                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  {client.ContactPhone}
                </p>
              </div>

              {/* Dashboard */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left mt-6">
                <Link
                  to={`/dashboard/${project.ProjectID}`}
                  className="bg-black hover:bg-lime-500 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                >
                  View Project Dashboard
                </Link>
              </div>
            </main>

            {/* Sidebar */}
            <aside>
              {/* Project Resources */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lime-400 text-xl font-bold mb-6">
                  Project Resources
                </h3>
                <ul>
                  {resources.map((resource) => (
                    <li key={resource.ResourceID} className="mb-4">
                      <h4 className="font-bold">{resource.Role}</h4>
                      <p>Name: {resource.UserName}</p>
                      <p>Planned Hours: {resource.PlannedHours}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Manage */}
              {userRole === 'Planning Team' && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-xl font-bold mb-6">Manage Project</h3>
                  <Link
                    to={`/edit-project/${project.ProjectID}`}
                    className="bg-lime-500 hover:bg-lime-700 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >
                    Edit Project
                  </Link>
                  <button
                    onClick={() => onDeleteClick(project.ProjectID)}
                    className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >
                    Delete Project
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

const projectLoader = async ({ params }) => {
  const projectRes = await fetch(`/api/project/${params.id}`);
  const projectData = await projectRes.json();

  const clientRes = await fetch(`/api/company/${params.id}`);
  const clientData = await clientRes.json();

  const resourcesRes = await fetch(`/api/resources/${params.id}`);
  const resourcesData = await resourcesRes.json();

  // Fetch user details for each resource
  const userPromises = resourcesData.map(async (resource) => {
    const userRes = await fetch(`/api/user/${resource.UserID}`);
    const userData = await userRes.json();
    return { ...resource, UserName: userData.UserName };
  });

  const resourcesWithUserDetails = await Promise.all(userPromises);

  return {
    project: projectData,
    client: clientData,
    resources: resourcesWithUserDetails,
  };
};

export { ProjectPage as default, projectLoader };
