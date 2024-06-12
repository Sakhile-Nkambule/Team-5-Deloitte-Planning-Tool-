import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddProjectPage = () => {
    const[title, setTitle]= useState('');
    const[type, setType]= useState('');
    const[location, setLocation]= useState('');
    const[description, setDescription]= useState('');
    const[salary, setSalary]= useState('Under R50K');
    const[companyName, setCompanyName]= useState('');
    const[companyDescription, setCompanyDescription]= useState('');
    const[contactPhone, setContactPhone]= useState('');
    const[contactEmail, setContactEmail]= useState('');
    const navigate = useNavigate();
    const submitForm = (e)=>{
        e.preventDefault();
        const newProject={
            title,
            type,
            location,
            description,
            salary,
            company:{
                name: companyName,
                description: companyDescription,
                contactEmail,
                contactPhone,
            },

        };
        navigate('/proposed-resources', { state: { newProject } });
        // addProjectSubmit(newProject); 
        
        // toast.success('Project Added Successfully');
        // return navigate('/projects');
    };
  return (

    <>
    <section className="bg-green-100">
      <div className="container m-auto max-w-2xl py-24">
        <div
          className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0"
        >
          <form onSubmit ={submitForm}>
            <h2 className="text-green-500 text-3xl text-center font-semibold mb-6">Add Project</h2>

            <div className="mb-4">
              <label htmlFor="type" className="block text-gray-700 font-bold mb-2"
                >Project Code

                </label>
              <input
                id="type"
                name="type"
                className="border rounded w-full py-2 px-3"
                required
                value= {type}
                onChange={(e)=>setType(e.target.value)}
              />
                
              
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2"
                >Project Name
                </label >
              <input
                type="text"
                id="title"
                name="title"
                className="border rounded w-full py-2 px-3 mb-2"
                placeholder="eg. Planning Tool"
                required
                value= {title}
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-gray-700 font-bold mb-2"
                >Description
                </label>
              <textarea
                id="description"
                name="description"
                className="border rounded w-full py-2 px-3"
                rows="4"
                placeholder="Add any Project expectations, requirements, etc"
                value= {description}
                onChange={(e)=>setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="type" className="block text-gray-700 font-bold mb-2"
                >Project Budget
                </label>
              <select
                id="salary"
                name="salary"
                className="border rounded w-full py-2 px-3"
                required
                value= {salary}
                onChange={(e)=>setSalary(e.target.value)}
              >
                <option value="Under R50K">Under R50K</option>
                <option value="R50K - 60K">R50K - R60K</option>
                <option value="R60K - 70K">R60K - R70K</option>
                <option value="R70K - 80K">R70K - R80K</option>
                <option value="R80K - 90K">R80K - R90K</option>
                <option value="R90K - 100K">R90K - R100K</option>
                <option value="R100K - 125K">R100K - R125K</option>
                <option value="R125K - 150K">R125K - R150K</option>
                <option value="R150K - 175K">R150K - R175K</option>
                <option value="R175K - 200K">R175K - R200K</option>
                <option value="Over R200K">Over R200K</option>
              </select>
            </div>

            

            <h3 className="text-green-400 text-2xl mb-5">Company Info</h3>

            <div className="mb-4">
              <label htmlFor="company" className="block text-gray-700 font-bold mb-2"
                >Company Name
                </label>
              <input
                type="text"
                id="company"
                name="company"
                className="border rounded w-full py-2 px-3"
                placeholder="Company Name"
                value= {companyName}
                onChange={(e)=>setCompanyName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="company_description"
                className="block text-gray-700 font-bold mb-2"
                >Company Description
                </label>
              <textarea
                id="company_description"
                name="company_description"
                className="border rounded w-full py-2 px-3"
                rows="4"
                placeholder="What does the company do?"
                value= {companyDescription}
                onChange={(e)=>setCompanyDescription(e.target.value)}
              ></textarea>
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Location
              </label>
              <input
                type='text'
                id='location'
                name='location'
                className='border rounded w-full py-2 px-3 mb-2'
                placeholder='Company Location'
                required
                value= {location}
                onChange={(e)=>setLocation(e.target.value)}            
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="contact_email"
                className="block text-gray-700 font-bold mb-2"
                >Contact Email
                </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                className="border rounded w-full py-2 px-3"
                placeholder="Email address for client"
                required
                value= {contactEmail}
                onChange={(e)=>setContactEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="contact_phone"
                className="block text-gray-700 font-bold mb-2"
                >Contact Phone
                </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                className="border rounded w-full py-2 px-3"
                placeholder="Optional phone for client"
                value= {contactPhone}
                onChange={(e)=>setContactPhone(e.target.value)}
              />
            </div>

            <div>
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Add Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
    </>
    );
};

export default AddProjectPage;