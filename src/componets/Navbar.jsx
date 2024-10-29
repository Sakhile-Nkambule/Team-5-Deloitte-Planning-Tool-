import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBell } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/Images/logo.jpg";
import { useUser } from "../componets/UserContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      navigate("/"); // Redirect if user is not logged in
    }
  }, [user, navigate]);

  const userName = user?.name || "Guest";
  const userRole = user?.role;

  const handleLogout = () => {
    console.log("Logged out");
    const confirm = window.confirm("Are you sure you want to log Out?");
    if (!confirm) return;

    toast.success("Successfully Logged Out");
    navigate("/");
  };

  const handleUserProfile = () => {
    navigate("/userProfile");
  };

  const handleAllUsers = () => {
    navigate("/all-Users");
  };

  const handleMyCalender = () => {
    navigate(`/myCalendar/${user?.id}`);
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-black bg-lime-100 hover:bg-lime-500 hover:text-white rounded-md px-3 py-2"
      : "text-white hover:bg-lime-500 hover:text-black rounded-md px-3 py-2";

  const rolesWithAdminAccess = ["Planning Team", "Director", "Senior Manager"];
  const homeLink = rolesWithAdminAccess.includes(userRole)
    ? "/homepage"
    : "/Userhomepage";

  const projectsLink = rolesWithAdminAccess.includes(userRole)
    ? "/projects"
    : `/user-projects/${user?.id}`;

  const unreadNotificationsCount =
    user?.notifications?.filter((notification) => notification.Read_ === 0)
      .length || 0;

  return (
    <nav className="bg-black border-b border-lime-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            <NavLink
              className="flex flex-shrink-0 items-center mr-4"
              to={homeLink}
            >
              <img className="h-10 w-auto" src={logo} alt="React Jobs" />
              <span className="hidden md:block text-white text-2xl font-bold ml-2">
                Deloitte Planning Suite
              </span>
            </NavLink>
            <div className="md:ml-auto flex items-center space-x-2">
              <NavLink to={homeLink} className={linkClass}>
                Home
              </NavLink>
              <NavLink to={projectsLink} className={linkClass}>
                Projects
              </NavLink>
              {[
                "Associate Director",
                "Director",
                "Snr Associate Director",
                "Senior Manager",
                "Assistant Manager",
                "Manager",
              ].includes(userRole) && (
                <NavLink to="/add-project" className={linkClass}>
                  Add Project
                </NavLink>
              )}
              <NavLink to="/notifications" className={linkClass}>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBell} className="mr-1" />
                  Notifications
                  {unreadNotificationsCount > 0 && (
                    <span className="bg-red-500 h-2 w-2 rounded-full ml-1"></span>
                  )}
                </div>
              </NavLink>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-white hover:bg-lime-500 hover:text-black rounded-md px-3 py-2"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  <span>{userName}</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                    <button
                      onClick={handleUserProfile}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleMyCalender}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Calendar
                    </button>

                    {[
                      "Associate Director",
                      "Director",
                      "Snr Associate Director",
                      "Senior Manager",
                      "Assistant Manager",
                      "Manager",
                    ].includes(userRole) && (
                      <button
                        onClick={handleAllUsers}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Users
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
