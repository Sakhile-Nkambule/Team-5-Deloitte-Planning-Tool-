
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const Status = 'pending';
  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    const newProject = {
      Title,
      ProjectCode,
      Status,
      Description,
      Budget,
    
  Client: {
        CompanyName,
        CompanyDescription,
        ContactEmail,
        ContactPhone,
        CompanyLocation,},
      };
 console.log(newProject);
navigate("/proposed-resources", { state: { newProject } });
  };

  return (
    <section className="bg-lime-100">
      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <form onSubmit={submitForm}>
            <h2 className="text-black text-3xl text-center font-semibold mb-6">
              Add Project
            </h2>

            <div className="mb-4">
              <label
                htmlFor="type"
                className="block text-gray-700 font-bold mb-2"
              >
                Project Code
              </label>
              <input
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
                htmlFor="Budget"
                className="block text-gray-700 font-bold mb-2"
              >
                Project Budget
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
                id="CompanyName"
                name="CompanyName"
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
                id="Company_description"
                name="Company_description"
                className="border rounded w-full py-2 px-3"
                rows="4"
                placeholder="What does the company do?"
                value={CompanyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label
                htmlFor="location"
                className="block text-gray-700 font-bold mb-2"
              >
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
                placeholder="Email address for client"
                required
                value={ContactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="contact_phone"
                className="block text-gray-700 font-bold mb-2"
              >
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
            </div>

            <div>
              <button
                className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
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