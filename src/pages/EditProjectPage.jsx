import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Spinner from "../componets/Spinner";

const EditProjectPage = ({ updateProjectSubmit }) => {
  const [loading, setLoading] = useState(true);
  const { project, client, resources, financials } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();

  const [Title, setTitle] = useState(project.Title);
  const [ProjectCode, setProjectCode] = useState(project.ProjectCode);
  const [CompanyLocation, setCompanyLocation] = useState(
    client.CompanyLocation
  );
  const [Description, setDescription] = useState(project.Description);
  const [Budget, setBudget] = useState(project.Budget);
  const [Status, setStatus] = useState(project.Status || "Pending");
  const [startDate, setStartDate] = useState(
    project.StartDate ? new Date(project.StartDate) : null
  );
  const [endDate, setEndDate] = useState(
    project.EndDate ? new Date(project.EndDate) : null
  );

  const [CompanyName, setCompanyName] = useState(client.CompanyName);
  const [CompanyDescription, setCompanyDescription] = useState(
    client.CompanyDescription
  );
  const [ContactPhone, setContactPhone] = useState(client.ContactPhone);
  const [ContactEmail, setContactEmail] = useState(client.ContactEmail);
  const [exhaustedBudget, setExhaustedBudget] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [netRevenue, setNetRevenue] = useState(0);
  const [recoveryRate, setRecoveryRate] = useState(0);

  const [projectResources, setProjectResources] = useState(resources || []);
  const [userMap, setUserMap] = useState({});
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetching user data to get name of resource using UserID

  useEffect(() => {
    // Fetch user data when the component mounts
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const usersData = await response.json();
        const userMapping = usersData.reduce((acc, user) => {
          acc[user.UserID] = { UserName: user.UserName, Role: user.Role };
          return acc;
        }, {});
        setUserMap(userMapping);
        setUsers(usersData);
      } catch (error) {
        toast.error("Failed to fetch user data");
        console.error(error);
      }finally{
        setLoading(false);
      }
    };

    fetchUserData();
    
  }, []);

  useEffect(() => {
    // Calculate financial metrics whenever resources or budget changes
    const calculateFinancials = () => {
      let totalHours = resources.reduce(
        (acc, resource) => acc + parseInt(resource.PlannedHours || 0),
        0
      );
      const calculatedExhaustedBudget = 300 * totalHours; // Adjust the rate if necessary
      setExhaustedBudget(calculatedExhaustedBudget);

      const formattedBudget = Math.round(Budget);
      const calculatedNetRevenue = formattedBudget - calculatedExhaustedBudget;
      setNetRevenue(calculatedNetRevenue);

      const calculatedProfitMargin = formattedBudget
        ? (calculatedNetRevenue / formattedBudget) * 100
        : 0;
      const formattedProfitMargin = Math.round(calculatedProfitMargin);
      setProfitMargin(formattedProfitMargin);

      const calculatedRecoveryRate = calculatedProfitMargin;
      const formattedRecoveryRate = Math.round(calculatedRecoveryRate);
      setRecoveryRate(formattedRecoveryRate);
    };

    calculateFinancials();


  }, [resources, Budget]);

  const handleResourceChange = (index, field, value) => {
    const newResources = [...projectResources];
    newResources[index][field] = value;
    setProjectResources(newResources);
  };

  const removeResource = async (resourceId) => {
    try {
      if (
        window.confirm(
          "Are you sure you want to remove this resource from Project?"
        )
      ) {
        // Send a DELETE request to the server to remove the resource
        await fetch(`/api/resources/${resourceId}`, {
          method: "DELETE",
        });
      }
      // Update the local state after removing the resource from the database
      setProjectResources(
        projectResources.filter(
          (resource) => resource.ResourceID !== resourceId
        )
      );
    } catch (error) {
      console.error("Failed to remove resource", error);
    }
  };
  // DATE (Start and End)
  const isValidDate = (date) => date instanceof Date && !isNaN(date.getTime());

  // Handle Start Date Change
  const handleStartDateChange = (date) => {
    const currentDate = new Date(); // Today's date

    if (isValidDate(date)) {
      if (date < currentDate) {
        // Start date is in the past
        setErrors((prevErrors) => ({
          ...prevErrors,
          startDate: "Start date cannot be in the past",
        }));
      } else if (endDate && date > endDate) {
        // Start date is after end date
        setErrors((prevErrors) => ({
          ...prevErrors,
          startDate: "Start date cannot be after the end date",
        }));
      } else {
        // Clear any previous errors
        setErrors((prevErrors) => ({
          ...prevErrors,
          startDate: null,
        }));
        setStartDate(date); // Set valid start date
      }
    } else {
      setStartDate(null); // Reset if invalid
    }
  };

  //Handle budget for validation
  const handleBudgetChange = (e) => {
    const value = e.target.value;

    // Allow empty string to enable clearing the input
    if (value === "") {
      setBudget("");
      setErrors({});
      return;
    }

    // Check if the input contains only digits and optional decimal
    const regex = /^[0-9]*\.?[0-9]*$/;

    if (regex.test(value)) {
      const budgetValue = parseFloat(value);

      // Check if the budget is a positive number
      if (budgetValue > 0 || value === "0") {
        setBudget(value);
        setErrors({});
      } else {
        setErrors({ budget: "Budget must be a positive number" });
      }
    } else {
      setErrors({ budget: "Only numeric values are allowed" });
    }
  };
  // Handle End Date Change
  const handleEndDateChange = (date) => {
    const currentDate = new Date(); // Today's date

    if (isValidDate(date)) {
      if (date < currentDate) {
        // End date is in the past
        setErrors((prevErrors) => ({
          ...prevErrors,
          endDate: "End date cannot be in the past",
        }));
      } else if (startDate && date < startDate) {
        // End date is before start date
        setErrors((prevErrors) => ({
          ...prevErrors,
          endDate: "End date cannot be before the start date",
        }));
      } else {
        // Clear any previous errors
        setErrors((prevErrors) => ({
          ...prevErrors,
          endDate: null,
        }));
        setEndDate(date); // Set valid end date
      }
    } else {
      setEndDate(null); // Reset if invalid
    }
  };

  // Task management
  const handleManageTasks = (resourceId) => {
    navigate(`/manage-tasks/${resourceId}`);
  };

  const addTask = (resourceIndex) => {
    const resourceId = projectResources[resourceIndex].ResourceID;
    handleManageTasks(resourceId);
  };

  const submitForm = (e) => {
    e.preventDefault();
    const updatedProject = {
      id,
      Title,
      ProjectCode,
      Description,
      Budget,
      Status, // Include status in the updated project
      StartDate: startDate ? startDate.toISOString() : null,
      EndDate: endDate ? endDate.toISOString() : null,
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
  console.log(project.startDate);

  // Map resources to include user names
  const mappedResources = projectResources.map((resource) => ({
    ...resource,
    name:
      (userMap[resource.UserID] && userMap[resource.UserID].UserName) ||
      "Unknown User",
  }));

  // Filter users to exclude those already assigned
  const unassignedUsers = users.filter(
    (user) =>
      !projectResources.some((resource) => resource.UserID === user.UserID)
  );
  const handleSelectChange = (e) => {
    const selectedUserID = e.target.value;
    if (selectedUserID) {
      const selectedUser = userMap[selectedUserID];
      setProjectResources([
        ...projectResources,
        {
          UserID: selectedUserID,
          Role: selectedUser.Role || "", // Use role from user data
          name: selectedUser.UserName || "Unknown User", // Use name from user data
          PlannedHours: "0", // Set initial planned hours to 0
          tasks: [""],
        },
      ]);
    }
  };

  //BACK BUTTON

  const handleGoBack = () => {
    navigate(-1); // Goes back to the previous page
  };

  return (
    <>
      <section>
        <div className="container m-auto py-2 px-2 text-lime-500 hover:text-lime-700 flex items-center">
          <button onClick={handleGoBack}>
            {" "}
            <FaArrowLeft className="mr-1" /> Back
          </button>
        </div>
      </section>

      <section className="bg-lime-100">
        <div className="container m-auto py-24 relative">
          <div className="bg-white px-6 py-8 mb-10 shadow-md rounded-md border m-2 md:m-0">
            <h2 className="text-black text-3xl text-center font-semibold mb-6">
              Edit Project
            </h2>
            

            {/* Budget summary in the top right corner */}

            <h2 className="text-2xl font-semibold mb-4 text-center">
              Budget Summary
            </h2>

            <div className="flex justify-center items-center space-x-40 bg-white h-100 p-8 shadow-md rounded-full  w-100 ">
              <div className="mb-2">
                <p className="text-gray-700 font-semibold">Gross Revenue:</p>
                <p className="text-green-500 font-semibold">{`R${project.Budget}`}</p>
              </div>

              <div className="mb-2">
                <p className="text-gray-700 font-semibold">Total Costs:</p>
                <p className="text-red-500 font-semibold">{`R${exhaustedBudget}`}</p>
              </div>
              <div className="mt-4">
                <p className="text-gray-700 font-semibold">Net Revenue:</p>
                <p className="font-semibold">{`R${netRevenue}`}</p>
              </div>
              <div className="mt-4">
                <p className="text-gray-700 font-semibold">Profit Margin:</p>
                <p className="font-semibold">{`${profitMargin}%`}</p>
              </div>
              <div className="mb-2">
                <p className="text-gray-700 font-semibold">Recovery Rate:</p>
                <p className="text-red-500 font-semibold">{`${recoveryRate}%`}</p>
              </div>
            </div>

            <form onSubmit={submitForm}>
            {loading ? (
          <Spinner />
        ) : (
              <div className="grid grid-cols-2 gap-2 col-span-1 py-4 ">
                {/* Project details section */}
                <div className="pr-6 border-r-1">
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
                      htmlFor="budget"
                      className="block text-gray-700 font-bold mb-2"
                    >
                      Budget
                    </label>
                    <textarea
                      id="budget"
                      name="budget"
                      className="border rounded w-full py-2 px-3"
                      required
                      value={Budget}
                      onChange={(e) => handleBudgetChange(e)}
                    ></textarea>
                    {errors.budget && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.budget}
                      </p>
                    )}
                  </div>

                  {/* Start & End Date */}
                  <div className="flex space-x-4 mb-4">
                    <div className="w-1/2">
                      <label
                        htmlFor="startDate"
                        className="block text-gray-700 font-bold mb-2"
                      >
                        Start Date
                      </label>
                      <DatePicker
                        selected={isValidDate(startDate) ? startDate : null}
                        onChange={handleStartDateChange}
                        dateFormat="yyyy/MM/dd"
                        className="border rounded w-full py-2 px-3"
                        placeholderText="Select Project Start Date"
                      />
                      {errors.startDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    <div className="w-1/2">
                      <label
                        htmlFor="endDate"
                        className="block text-gray-700 font-bold mb-2"
                      >
                        End Date
                      </label>
                      <DatePicker
                        selected={isValidDate(endDate) ? endDate : null}
                        onChange={handleEndDateChange}
                        dateFormat="yyyy/MM/dd"
                        className="border rounded w-full py-2 px-3"
                        placeholderText="Select Project End Date"
                      />
                      {errors.endDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.endDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="status"
                      className="block text-gray-700 font-bold mb-2"
                    >
                      Project Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="border rounded w-full py-2 px-3"
                      value={Status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Complete">Complete</option>
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
                </div>

                {/* Project Resources Section */}
                <div className="border-l-10 pl-2">
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
                          onClick={() => removeResource(resource.ResourceID)}
                        >
                          Remove Resource
                        </button>
                      </div>
                      <div className="flex mb-2 items-center">
                        <input
                          type="text"
                          name="Role"
                          className="border rounded py-2 px-3 w-1/4 mr-2"
                          value={resource.Role}
                          readOnly
                        />
                        <input
                          type="text"
                          name="name"
                          className="border rounded py-2 px-3 w-1/4 mr-2"
                          value={resource.name}
                          readOnly
                        />
                        <input
                          type="number"
                          name="Planned Hours"
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

                  <div className="mb-4">
                    <label htmlFor="UserID" className="block font-bold mb-2">
                      Add Resource
                    </label>
                    <select
                      id="UserID"
                      name="UserID"
                      className="border rounded w-full py-2 px-3 mb-2"
                      onChange={handleSelectChange}
                    >
                      <option value="">Select a Resource</option>
                      {unassignedUsers.map((user) => (
                        <option key={user.UserID} value={user.UserID}>
                          {user.UserName} ({user.Role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-lime-500 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded"
                >
                  Update Project
                </button>
              </div>
                 )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditProjectPage;
