import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { FaArrowLeft} from "react-icons/fa";
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

  const addResource = () => {
    setResources([...resources, { role: "", name: "", hours: "" }]);
  };

  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
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
    return navigate(`/projects/${id}`);
  };

  return (
    <>
     <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/projects"
            className="text-green-400 hover:text-green-700 flex items-center"
          >
            <FaArrowLeft className=" mr-1" /> Back to projects
          </Link>
        </div>
      </section>
      <section className="bg-green-100">
        <div className="container m-auto max-w-2xl py-24">
          <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
            <form onSubmit={submitForm}>
              <h2 className=" text-green-500 text-3xl text-center font-semibold mb-6">
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

              

              <h3 className="text-green-400 text-2xl mb-5">Company Info</h3>

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

              <h3 className="text-green-400 text-2xl mb-5">Allocated Resources</h3>
              {resources.length > 0 ? (
                <ul>
                  {resources.map((resource, index) => (
                    <li key={index} className="mb-4">
                      <div className="mb-2">
                        <label
                          htmlFor={`role-R{index}`}
                          className="block text-gray-700 font-bold mb-1"
                        >
                          Role
                        </label>
                        <input
                          type="text"
                          id={`role-R{index}`}
                          name={`role-R{index}`}
                          className="border rounded w-full py-2 px-3"
                          value={resource.role}
                          onChange={(e) =>
                            handleResourceChange(index, "role", e.target.value)
                          }
                        />
                      </div>
                      <div className="mb-2">
                        <label
                          htmlFor={`name-R{index}`}
                          className="block text-gray-700 font-bold mb-1"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id={`name-R{index}`}
                          name={`name-R{index}`}
                          className="border rounded w-full py-2 px-3"
                          value={resource.name}
                          onChange={(e) =>
                            handleResourceChange(index, "name", e.target.value)
                          }
                        />
                      </div>
                      <div className="mb-2">
                        <label
                          htmlFor={`hours-R{index}`}
                          className="block text-gray-700 font-bold mb-1"
                        >
                          Hours
                        </label>
                        <input
                          type="number"
                          id={`hours-R{index}`}
                          name={`hours-R{index}`}
                          className="border rounded w-full py-2 px-3"
                          value={resource.hours}
                          onChange={(e) =>
                            handleResourceChange(index, "hours", e.target.value)
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() => removeResource(index)}
                      >
                        Remove Resource
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No proposed resources found.</p>
              )}
              <button
                type="button"
                className="text-green-400"
                onClick={addResource}
              >
                Add Resource
              </button>

              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
                >
                  Save Changes
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
