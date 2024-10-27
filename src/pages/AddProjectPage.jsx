import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddProjectPage = () => {
  const [Title, setTitle] = useState("");
  const [ProjectCode, setProjectCode] = useState("");
  const [CompanyLocation, setCompanyLocation] = useState("");
  const [Description, setDescription] = useState("");
  const [Budget, setBudget] = useState("");
  const [CompanyName, setCompanyName] = useState("");
  const [CompanyDescription, setCompanyDescription] = useState("");
  const [ContactPhone, setContactPhone] = useState("");
  const [ContactEmail, setContactEmail] = useState("");
  const [complexity, setComplexity] = useState("High");
  const [checkedItems, setCheckedItems] = useState({});
  const [NetRevenue, setNetRevenue] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [errors, setErrors] = useState({});

  const Status = "Pending";

  const items = [
    "SAP",
    "JDE",
    "Oracle",
    "Genric Application",
    "Microsoft SQL",
    "Oracle DB",
    "Linux",
    "Microsoft OS",
    "Active Directory",
    "Cyber memo",
    "CTRA",
    "DCNO",
    "SAP-AUTO",
    "AUTO",
    "REVIEW",
    "Project Management",
  ];

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckedItems((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // DATE (Start and End)
  const isValidDate = (date) => date instanceof Date && !isNaN(date.getTime());

  // Handle Start Date Change
  const handleStartDateChange = (date) => {
    // Get today's date at midnight
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to midnight

    // Optionally log the modified currentDate
    console.log("TODAY IS: ", currentDate);

    if (isValidDate(date)) {
      // Set the selected date to midnight as well
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0); // Set to midnight

      if (selectedDate < currentDate) {
        // Start date is in the past
        setErrors((prevErrors) => ({
          ...prevErrors,
          startDate: "Start date cannot be in the past",
        }));
      } else if (endDate && selectedDate > new Date(endDate)) {
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
        setStartDate(selectedDate); // Set valid start date
      }
    } else {
      setStartDate(null); // Reset if invalid
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

  

  const navigate = useNavigate();

  const validateForm = () => {
    let formErrors = {};

    // Ensure end date is after start date
    if (startDate && endDate && endDate <= startDate) {
      formErrors.endDate = "*End date must be after start date.";
    }

    // Net Revenue validation (must be a number)
    if (!/^\d+(\.\d{1,2})?$/.test(NetRevenue)) {
      formErrors.NetRevenue = "*Net Revenue must be a valid number.";
    }

    // Budget validation (must be a number) 
    if (!/^\d+(\.\d{1,2})?$/.test(Budget)) {
      formErrors.Budget = "*Budget must be a valid number.";
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(ContactEmail)) {
      formErrors.ContactEmail = "*Please enter a valid email.";
    }
    //Contact Phone validation
    if (!/^\+?[0-9\s\-()]{7,15}$/.test(ContactPhone)) {
      formErrors.ContactPhone = "*Please enter a valid phone number.";
    }
    //Required System (Ensure that atleast one is selected)
    const selectedItems = Object.keys(checkedItems).filter(
      (key) => checkedItems[key] === true
    );

    if (selectedItems.length === 0) {
      formErrors.selectedApplications = "*Select at least one application.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const submitForm = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Proceed with form submission (e.g., API call)
      // Get the names of only the checked checkboxes
      const selectedItems = Object.keys(checkedItems).filter(
        (key) => checkedItems[key] === true
      );

      const newProject = {
        Title,
        ProjectCode,
        Status,
        Description,
        NetRevenue,
        Budget,
        StartDate: startDate ? startDate.toISOString() : null,
        EndDate: endDate ? endDate.toISOString() : null,
        complexity,
        selectedApplications: selectedItems, // Pass the names of checked checkboxes
        Client: {
          CompanyName,
          CompanyDescription,
          ContactEmail,
          ContactPhone,
          CompanyLocation,
        },
      };
      console.log("Form submitted successfully!");
      navigate("/proposed-resources", { state: { newProject } });
    }
  };

  return (
    <section className="bg-lime-100">
      <div className="container m-auto w-full py-24">
        <div className="bg-white p-6 shadow-md rounded-md border m-4">
          <h2 className="text-black text-3xl justify-center text-center font-semibold mb-2">
            Add Project
          </h2>
          <form
            onSubmit={submitForm}
            className="md:grid md:grid-cols-3 md:gap-4 "
          >
            <div className="pr-4 border-r-2 col-span-1">
              <div className="mb-4">
                <h3 className="text-lime-500 text-2xl mb-5">Project Info</h3>
                <label className="block text-gray-700 font-bold mb-2">
                  Project Code
                </label>
                <input
                  type="text"
                  id="ProjectCode"
                  name="ProjectCode"
                  className="border rounded w-full py-2 px-3"
                  required
                  value={ProjectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="Title"
                  name="Title"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="e.g., Planning Tool"
                  required
                  value={Title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Description
                </label>
                <textarea
                  id="Description"
                  name="Description"
                  className="border rounded w-full py-2 px-3"
                  rows="4"
                  placeholder="Add any project expectations, requirements, etc."
                  value={Description}
                  onChange={(e) => setDescription(e.target.value)}
                />
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
                <label className="block text-gray-700 font-bold mb-2">
                  Net Revenue
                </label>
                <input
                  type="text"
                  id="NetRevenue"
                  name="NetRevenue"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="Enter Net Revenue"
                  required
                  value={NetRevenue}
                  onChange={(e) => setNetRevenue(e.target.value)}
                />
                {errors.NetRevenue && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.NetRevenue}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Gross Revenue
                </label>
                <input
                  type="text"
                  id="Budget"
                  name="Budget"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="Enter project budget"
                  required
                  value={Budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
                {errors.Budget && (
                  <p className="text-red-500 text-xs mt-1">{errors.Budget}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Project Complexity
                </label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  className="border rounded w-full py-2 px-3 mb-2"
                >
                  <option value="High">High</option>
                  <option value="Mid">Mid</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="col-span-1 border-r-2 pr-4">
              <h3 className="text-lime-500 text-2xl mb-5">Company Info</h3>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="CompanyName"
                  name="CompanyName"
                  className="border rounded w-full py-2 px-3"
                  placeholder="Company Name"
                  required
                  value={CompanyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Company Description
                </label>
                <textarea
                  id="CompanyDescription"
                  name="CompanyDescription"
                  className="border rounded w-full py-2 px-3"
                  rows="4"
                  placeholder="What does the company do?"
                  value={CompanyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                />
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
                <label className="block text-gray-700 font-bold mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  className="border rounded w-full py-2 px-3"
                  placeholder="Email address for client"
                  required
                  value={ContactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  className="border rounded w-full py-2 px-3"
                  placeholder="Optional phone for client"
                  value={ContactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                {errors.ContactPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.ContactPhone}
                  </p>
                )}
              </div>
            </div>

            <div className="col-span-1 ">
              <h3 className="text-lime-500 text-2xl mb-5">Required Skill sets</h3>
              <div className="space-y-2 ">
                {items.map((item, index) => (
                  <label
                    key={index}
                    className="flex justify-items-end space-x-2"
                  >
                    <input
                      type="checkbox"
                      name={item}
                      checked={checkedItems[item] || false}
                      onChange={handleCheckboxChange}
                      className="form-checkbox h-5 w-4"
                    />
                    <span
                      className={`${
                        checkedItems[item]
                          ? "text-lime-500 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
              {errors.selectedApplications && (
                <p className="text-red-500 text-md mt-1">
                  {errors.selectedApplications}
                </p>
              )}
            </div>

            <div className="col-span-3">
              <button
                className="bg-lime-500  hover:bg-lime-700 hover:shadow-lg 
             transform hover:scale-105 transition-all text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Add Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddProjectPage;
