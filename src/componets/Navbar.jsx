import logo from '../assets/Images/logo.jpg';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const linkClass = ({isActive})=> isActive? 
    "text-black bg-lime-100 hover:bg-lime-500 hover:text-white rounded-md px-3 py-2" 
    :"text-white hover:bg-lime-500 hover:text-black rounded-md px-3 py-2";

  return (
    <>
    <nav className="bg-black border-b border-lime-500">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
          
              <NavLink 
                className="flex flex-shrink-0 items-center mr-4"
                to="/homepage"
              >
                <img
                  className="h-10 w-auto"
                  src={logo}
                  alt="React Jobs"
                />
                <span className="hidden md:block text-white text-2xl font-bold ml-2">
                Deloitte Planning Suite
                </span>
              </NavLink>
              <div className="md:ml-auto">
                <div className="flex space-x-2">
                  <NavLink
                    to="/homepage"
                    className={linkClass}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/projects"
                    className={linkClass}
                  >
                    Projects
                  </NavLink>
                  <NavLink
                    to="/add-project"
                    className={linkClass}
                  >
                    Add Project
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;