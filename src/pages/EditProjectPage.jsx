import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const EditProjectPage = ({ updateProjectSubmit }) => {
  const project = useLoaderData();
  const [title, setTitle] = useState(project.title);
  const [type, setType] = useState(project.type);
  const [location, setLocation] = useState(project.location);
  const [description, setDescription] = useState(project.description);
  const [salary, setSalary] = useState(project.salary);
  const [companyName, setCompanyName] = useState(project.company.name);
  const [companyDescription, setCompanyDescription] = useState(
    project.company.description
  );
  const [contactPhone, setContactPhone] = useState(
    project.company.contactPhone
  );
  const [contactEmail, setContactEmail] = useState(
    project.company.contactEmail
  );
  const [resources, setResources] = useState(project.resources || []);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleResourceChange = (index, field, value) => {
    const newResources = [...resources];
    newResources[index][field] = value;
    setResources(newResources);
  };

  const handleTaskChange = (resourceIndex, taskIndex, value) => {
    const newResources = [...resources];
    newResources[resourceIndex].tasks[taskIndex] = value;
    setResources(newResources);
  };

  const addResource = () => {
    setResources([
      ...resources,
      { role: "", name: "", hours: "", tasks: [""] },
    ]);
  };

  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const addTask = (resourceIndex) => {
    const newResources = [...resources];
    newResources[resourceIndex].tasks.push("");
    setResources(newResources);
  };

  const removeTask = (resourceIndex, taskIndex) => {
    const newResources = [...resources];
    newResources[resourceIndex].tasks.splice(taskIndex, 1);
    setResources(newResources);
  };

  const submitForm = (e) => {
    e.preventDefault();
    const updatedProject = {
      id,
      title,
      type,
      location,
      description,
      salary,
      company: {
        name: companyName,
        description: companyDescription,
        contactEmail,
        contactPhone,
      },
      resources,
    };
    updateProjectSubmit(updatedProject);

    toast.success("Project updated successfully");
    return navigate(`/projects`);
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
        <div className="container m-auto max-w-2xl py-24">
          <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
            <form onSubmit={submitForm}>
              <h2 className=" text-black text-3xl text-center font-semibold mb-6">
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
                  value={type}
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
                  value={title}
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
                  id="description"
                  name="description"
                  className="border rounded w-full py-2 px-3"
                  rows="4"
                  placeholder="Add any Project expectations, requirements, etc"
                  value={description}
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
                <select
                  id="salary"
                  name="salary"
                  className="border rounded w-full py-2 px-3"
                  required
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                >
                  <option value="Under R50K">Under R50K</option>
                  <option value="R50K - 60K">R50K - R60K</option>
                  <option value="R60K - 70K">R60K - R70K</option>
                  <option value="R70K - 80K">R70K - R80K</option>
                  <option value="R80K - 90K">R80K - R90K</option>
                  <option value="R90K - R100K">R90K - R100K</option>
                  <option value="R100K - 125K">R100K - R125K</option>
                  <option value="R125K - R150K">R125K - R150K</option>
                  <option value="R150K - 175K">R150K - R175K</option>
                  <option value="R175K - R200K">R175K - R200K</option>
                  <option value="Over R200K">Over R200K</option>
                </select>
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
                  value={companyName}
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
                  value={companyDescription}
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="contact_phone"
                  className="block  font-bold mb-2"
                >
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  className="border rounded w-full py-2 px-3"
                  placeholder="Optional phone for applicants"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <h3 className="text-lime-500 text-2xl mb-5">
                Allocated Resources
              </h3>
              {resources.map((resource, resourceIndex) => (
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
                  <div className="mb-2">
                    <label
                      htmlFor={`role-${resourceIndex}`}
                      className="block text-gray-700 font-bold mb-2"
                    >
                      Role
                    </label>
                    <input
                      type="text"
                      id={`role-${resourceIndex}`}
                      name={`role-${resourceIndex}`}
                      className="border rounded w-full py-2 px-3"
                      placeholder="Role"
                      value={resource.role}
                      onChange={(e) =>
                        handleResourceChange(
                          resourceIndex,
                          "role",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label
                      htmlFor={`name-${resourceIndex}`}
                      className="block text-gray-700 font-bold mb-2"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id={`name-${resourceIndex}`}
                      name={`name-${resourceIndex}`}
                      className="border rounded w-full py-2 px-3"
                      placeholder="Name"
                      value={resource.name}
                      onChange={(e) =>
                        handleResourceChange(
                          resourceIndex,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label
                      htmlFor={`hours-${resourceIndex}`}
                      className="block text-gray-700 font-bold mb-2"
                    >
                      Hours
                    </label>
                    <input
                      type="text"
                      id={`hours-${resourceIndex}`}
                      name={`hours-${resourceIndex}`}
                      className="border rounded w-full py-2 px-3"
                      placeholder="Hours"
                      value={resource.hours}
                      onChange={(e) =>
                        handleResourceChange(
                          resourceIndex,
                          "hours",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  {/* Tasks */}
                  <div className="mb-4">
                    <h5 className="text-gray-700 font-bold mb-2">Tasks</h5>
                    {resource.tasks.slice(0, 1).map((task, taskIndex) => (
                      <div key={taskIndex} className="mb-2 flex items-center">
                        <input
                          type="text"
                          className="border rounded w-full py-2 px-3"
                          placeholder="Task"
                          value={task}
                          onChange={(e) =>
                            handleTaskChange(
                              resourceIndex,
                              taskIndex,
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          className="ml-2 bg-red-500 text-white rounded px-2 py-1  hover:text-red-700"
                          onClick={() => removeTask(resourceIndex, taskIndex)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {resource.tasks.length > 1 && (
                      <button
                        type="button"
                        className="text-lime-600 hover:text-lime-700"
                        onClick={() =>
                          setResources(
                            resources.map((res, idx) =>
                              idx === resourceIndex
                                ? { ...res, showMore: !res.showMore }
                                : res
                            )
                          )
                        }
                      >
                        {resource.showMore ? "Show Less" : "Show More"}
                      </button>
                    )}
                    {resource.showMore &&
                      resource.tasks.slice(1).map((task, taskIndex) => (
                        <div key={taskIndex} className="mb-2 flex items-center">
                          <input
                            type="text"
                            className="border rounded w-full py-2 px-3"
                            placeholder="Task"
                            value={task}
                            onChange={(e) =>
                              handleTaskChange(
                                resourceIndex,
                                taskIndex + 1,
                                e.target.value
                              )
                            }
                          />
                          <button
                            type="button"
                            className="bg-red-500 text-white rounded px-2 py-1 hover:text-red-700 ml-2"
                            onClick={() =>
                              removeTask(resourceIndex, taskIndex + 1)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => addTask(resourceIndex)}
                  >
                    Add Task
                  </button>
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
