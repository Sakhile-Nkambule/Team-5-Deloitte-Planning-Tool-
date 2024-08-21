import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddProjectPage = () => {
  const [title, setTitle] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const status = 'pending';
  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    const newProject = {
      title,
      projectCode,
      status,
      description,
      budget,
      Client: {
        companyName,
        companyDescription,
        contactEmail,
        contactPhone,
        companyLocation,
      },
    };
    console.log(newProject);
    navigate("/proposed-resources", { state: { newProject } });
  };

  return (
    <section className="bg-lime-100">
      <div className="container m-auto max-w-4xl py-24">
        <div className="bg-white p-6 shadow-md rounded-md border m-4">
          <h2 className="text-black text-3xl justify-center text-center font-semibold mb-2">
            Add Project
          </h2>
          <form onSubmit={submitForm} className="md:grid md:grid-cols-2 md:gap-4 ">
            <div className="md:col-span-2 ">
            </div>
            <div className="pr-4 border-r-2">
              <div className="mb-4 ">
              <h3 className="text-lime-500 text-2xl mb-5 ">Project Info</h3>
                <label className="block text-gray-700 font-bold mb-2">
                  Project Code
                </label>
                <input
                  type="text"
                  id="ProjectCode"
                  name="ProjectCode"
                  className="border rounded w-full py-2 px-3"
                  required
                  value={projectCode}
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
                  value={title}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Project Budget
                </label>
                <input
                  type="text"
                  id="Budget"
                  name="Budget"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="Enter project budget"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>
            
            <div>
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
                  value={companyName}
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
                  value={companyDescription}
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
                  value={companyLocation}
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
                  value={contactEmail}
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
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
  
            <div className="col-span-2">
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
