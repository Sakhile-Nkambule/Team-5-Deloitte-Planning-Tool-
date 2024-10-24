import { useParams, useLoaderData } from "react-router-dom";
import { FaArrowLeft, FaMapMarker } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../componets/UserContext"; 
import { useEffect, useState } from "react";
import Spinner from "../componets/Spinner";

const ProjectPage = ({ deleteProject }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id: projectId } = useParams(); // Use projectId for clarity
  const { project, client, resources, financials } = useLoaderData(); // Destructure data from loader
  const { user } = useUser(); // Get user from context
  const userRole = user?.role; // Get the user's role

  const [resourceId, setResourceId] = useState(null);
  const [userMap, setUserMap] = useState({});
  useEffect(() => {
    if (user && projectId) {
      // Check if the user has an allowed role
      const allowedRoles = ['consultant', 'Jnr Consultant', 'Snr Consultant'];
      if (allowedRoles.includes(userRole)) { 
        fetch(`http://localhost:8081/resource-id/${user.id}/${projectId}`)
          .then(async (response) => {
            if (!response.ok) {
              // If response status is not OK, handle it without throwing an error
              const errorText = await response.text(); // Get the text of the response (could be non-JSON)
              if (response.status === 404) {
                console.log("No resource found for this user in this project.");
                return; // Exit the .then block if it's a normal case (resource not found)
              }
              throw new Error(`Unexpected response: ${errorText}`);
            }
            return response.json(); // Parse the JSON if the response is okay
          })
          .then((data) => {
            if (data && data.resourceId) {
              setResourceId(data.resourceId); // Only set resourceId if it exists
            } else {
              console.log("No resourceId in response data");
            }
          })
          .catch((error) => {
            console.error("Error fetching resourceId:", error); // Handle unexpected errors only
          });
      } else {
        console.log("User does not have access to this resource.");
      }
    }
  }, [user, projectId]);
  
  // Fetch user data to create a map of UserID to UserName
  useEffect(() => {
   
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8081/users");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const usersData = await response.json();
        const userMapping = usersData.reduce((acc, user) => {
          acc[user.UserID] = { UserName: user.UserName, Role: user.Role };
          return acc;
        }, {});
        setUserMap(userMapping);
      } catch (error) {
        toast.error("Failed to fetch user data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const onDeleteClick = (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(projectId);
      toast.success("Project Deleted Successfully");
      navigate("/projects");
    }
  };

  const formattedStartDate = project.StartDate
    ? new Date(project.StartDate).toLocaleDateString()
    : "_";
  const formattedEndDate = project.EndDate
    ? new Date(project.EndDate).toLocaleDateString()
    : "_";

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
          {loading ? (
            <Spinner loading = {loading} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
              <main>
                <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                  <div className="text-gray-500 mb-4">
                    {project.ProjectCode}
                  </div>
                  <h1 className="text-3xl font-bold mb-4">{project.Title}</h1>
                  <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                    <p className="text-orange-700">{`Start Date: ${formattedStartDate}`}</p>
                  </div>
                  <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                    <p className="text-orange-700">{`End Date: ${formattedEndDate}`}</p>
                  </div>
                  <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                    <FaMapMarker className="text-orange-700 mr-2" />
                    <p className="text-orange-700">{project.Status}</p>
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

                {/* Dashboard Link */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left mt-6">
                  {["Associate Director", "Director","Snr Associate Director","Senior Manager", "Assistant Manager", "Manager"].includes(
                    userRole
                  ) ? (
                    <Link
                      to={`/dashboard/${project.ProjectID}`}
                      className="bg-black  hover:bg-lime-500 hover:shadow-lg 
             transform hover:scale-105 transition-all text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                    >
                      View Project Dashboard
                    </Link>
                  ) : (
                    <Link
                      to={`/taskboard/${resourceId}`}
                      className="bg-black  hover:bg-lime-500 hover:shadow-lg 
             transform hover:scale-105 transition-all text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                    >
                      View Taskboard
                    </Link>
                  )}
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
                        <p>
                          Name:{" "}
                          {userMap[resource.UserID]?.UserName || "Unknown User"}
                        </p>
                        <p>Planned Hours: {resource.PlannedHours}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Manage */}
                {["Associate Director", "Director","Snr Associate Director","Senior Manager", "Assistant Manager", "Manager"].includes(
                  userRole
                ) && (
                  <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                    <h3 className="text-xl font-bold mb-6">Manage Project</h3>
                    <Link
                      to={`/edit-project/${project.ProjectID}`}
                      className="bg-lime-500  hover:bg-lime-700 hover:shadow-lg 
             transform hover:scale-105 transition-all text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                    >
                      Edit Project
                    </Link>
                    <button
                      onClick={() => onDeleteClick(project.ProjectID)}
                      className="bg-red-600 hover:bg-red-800 hover:shadow-lg 
             transform hover:scale-105 transition-all text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                    >
                      Delete Project
                    </button>
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

const projectLoader = async ({ params }) => {
  const projectRes = await fetch(`http://localhost:8081/project/${params.id}`);
  const projectData = await projectRes.json();

  const clientRes = await fetch(`http://localhost:8081/company/${params.id}`);
  const clientData = await clientRes.json();

  const financialsRes = await fetch(`http://localhost:8081/financials/${params.id}`);
  const financialsData = await financialsRes.json();

  const resourcesRes = await fetch(`http://localhost:8081/resources/${params.id}`);
  const resourcesData = await resourcesRes.json();

  // Fetch user details for each resource
  const userPromises = resourcesData.map(async (resource) => {
    const userRes = await fetch(`http://localhost:8081/user/${resource.UserID}`);
    const userData = await userRes.json();
    return { ...resource, UserName: userData.name };
  });

  const resourcesWithUserData = await Promise.all(userPromises);

  return {
    project: projectData,
    client: clientData,
    resources: resourcesWithUserData,
    financials: financialsData,
  };
};

export { ProjectPage as default, projectLoader };
