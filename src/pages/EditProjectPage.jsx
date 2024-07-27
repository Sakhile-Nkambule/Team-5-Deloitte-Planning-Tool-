import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const EditProjectPage = ({ updateProjectSubmit }) => {
  const { project, client, resources } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();

  const [Title, setTitle] = useState(project.Title);
  const [ProjectCode, setProjectCode] = useState(project.ProjectCode);
  const [CompanyLocation, setCompanyLocation] = useState(client.CompanyLocation);
  const [Description, setDescription] = useState(project.Description);
  const [Budget, setBudget] = useState(project.Budget);
  const [CompanyName, setCompanyName] = useState(client.CompanyName);
  const [CompanyDescription, setCompanyDescription] = useState(client.CompanyDescription);
  const [ContactPhone, setContactPhone] = useState(client.ContactPhone);
  const [ContactEmail, setContactEmail] = useState(client.ContactEmail);
  const [projectResources, setProjectResources] = useState(resources || []);
  const [userMap, setUserMap] = useState({});
//fetching user data to get name of resource using UserID
  useEffect(() => {
    // Fetch user data when the component mounts
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users'); 
        const users = await response.json();
        const userMapping = users.reduce((acc, user) => {
          acc[user.UserID] = user.UserName; 
         // console.log(acc);
          return acc;
        }, {});
        setUserMap(userMapping);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, []);

  const handleResourceChange = (index, field, value) => {
    const newResources = [...projectResources];
    newResources[index][field] = value;
    setProjectResources(newResources);
  };

  // const handleTaskChange = (resourceIndex, taskIndex, value) => {
  //   const newResources = [...projectResources];
  //   newResources[resourceIndex].tasks[taskIndex] = value;
  //   setProjectResources(newResources);
  // };

  const addResource = () => {
    setProjectResources([
      ...projectResources,
      { Role: "", name: "", PlannedHours: "", tasks: [""] },
    ]);
  };

  const removeResource = (index) => {
    setProjectResources(projectResources.filter((_, i) => i !== index));
  };
//TASKS
  const handleManageTasks = (resourceId) => {
    navigate(`/manage-tasks/${resourceId}`);
  };
  
//Manage Tasks
  const addTask = (resourceIndex) => {
    // Add a task and redirect to ManageTasksPage
    const resourceId = projectResources[resourceIndex].ResourceID;
    handleManageTasks(resourceId);
  };

  // const removeTask = (resourceIndex, taskIndex) => {
  //   const newResources = [...projectResources];
  //   newResources[resourceIndex].tasks.splice(taskIndex, 1);
  //   setProjectResources(newResources);
  // };

  const submitForm = (e) => {
    e.preventDefault();
    const updatedProject = {
      id,
      Title,
      ProjectCode,
      Description,
      Budget,
        Client: {
        CompanyName,
        CompanyDescription,
        ContactEmail,
        ContactPhone,
        CompanyLocation,
      },
      resources: projectResources,
    };
    updateProjectSubmit(updatedProject);

    toast.success("Project updated successfully");
    return navigate(`/project/${updatedProject.id}`);
  };

  // Map resources to include user names
  const mappedResources = projectResources.map(resource => ({
    ...resource,
    name: userMap[resource.UserID] || "Unknown User", // Map UserID to user name
  }));

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to={`/edit-project/${project.ProjectID}`}
            className="text-lime-500 hover:text-lime-700 flex items-center"
          >
            <FaArrowLeft className="mr-1" /> Back to projects
          </Link>
        </div>
      </section>
      <section className="bg-lime-100">
        <div className="container m-auto max-w-2xl py-24">
          <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
            <form onSubmit={submitForm}>
              <h2 className="text-black text-3xl text-center font-semibold mb-6">
                Edit Project
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Project
                </label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  className="border rounded w-full py-2 px-3"
                  readOnly
                  value={ProjectCode}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="eg. Planning Tool"
                  required
                  value={Title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Description
                </label>
                <textarea
                  id="Description"
                  name="Description"
                  className="border rounded w-full py-2 px-3"
                  rows="4"
                  placeholder="Add any Project expectations, requirements, etc"
                  value={Description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="salary"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Budget
                </label>
                <textarea
                  id="Budget"
                  name="Budget"
                  className="border rounded w-full py-2 px-3"
                  required
                  value={Budget}
                  onChange={(e) => setBudget(e.target.value)}
                ></textarea>
              </div>

              <h3 className="text-lime-500 text-2xl mb-5">Company Info</h3>

              <div className="mb-4">
                <label
                  htmlFor="company"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="border rounded w-full py-2 px-3"
                  placeholder="Company Name"
                  value={CompanyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="company_description"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Company Description
                </label>
                <textarea
                  id="company_description"
                  name="company_description"
                  className="border rounded w-full py-2 px-3"
                  rows="4"
                  placeholder="What does the company do?"
                  value={CompanyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="Company Location"
                  required
                  value={CompanyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="contact_email"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  className="border rounded w-full py-2 px-3"
                  placeholder="Email address for applicants"
                  required
                  value={ContactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="contact_phone"
                  className="block font-bold mb-2"
                >
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  className="border rounded w-full py-2 px-3"
                  placeholder="Optional phone for applicants"
                  value={ContactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <h3 className="text-lime-500 text-2xl mb-5">
                Allocated Resources
              </h3>
              {mappedResources.map((resource, resourceIndex) => (
                <div key={resourceIndex} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lime-500 font-bold">
                      Resource #{resourceIndex + 1}
                    </h4>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => removeResource(resourceIndex)}
                    >
                      Remove Resource
                    </button>
                  </div>
                  <div className="flex mb-2 items-center">
                    <input
                      type="text"
                      id={`role-${resourceIndex}`}
                      name={`role-${resourceIndex}`}
                      className="border rounded py-2 px-3 w-1/4 mr-2"
                      value={resource.Role}
                      readOnly
                    />
                    <input
                      type="text"
                      id={`name-${resourceIndex}`}
                      name={`name-${resourceIndex}`}
                      className="border rounded py-2 px-3 w-1/4 mr-2"
                      value={resource.name}
                      readOnly
                    />
                    <input
                      type="number"
                      id={`hours-${resourceIndex}`}
                      name={`hours-${resourceIndex}`}
                      className="border rounded py-2 px-3 w-1/4 mr-2"
                      value={resource.PlannedHours}
                      onChange={(e) =>
                        handleResourceChange(
                          resourceIndex,
                          "PlannedHours",
                          e.target.value
                        )
                      }
                    />
                    <button
                      type="button"
                      className="bg-blue-600 text-white rounded px-2 py-1"
                      onClick={() => addTask(resourceIndex)}
                    >
                      Manage Tasks
                    </button>
                  </div>
                  {/* {DELETED} */}
                </div>
              ))}
              <div className="flex justify-center">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-2"
                  onClick={addResource}
                >
                  Add Resource
                </button>
                <button
                  type="submit"
                  className="bg-lime-500 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditProjectPage;
