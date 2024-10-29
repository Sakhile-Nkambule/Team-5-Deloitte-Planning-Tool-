import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Homepage from "./pages/Homepage";
import MainLayout from "./layouts/MainLayout";
import Projectspage from "./pages/Projectspage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectPage, { projectLoader } from "./pages/ProjectPage";
import AddProjectPage from "./pages/AddProjectPage";
import EditProjectPage from "./pages/EditProjectPage";
import ProposedResourcespage from "./pages/ProposedResourcespage";
import DashboardPage from "./pages/DashboardPage";
import { useState } from "react";
import LoginScreen from "./pages/LoginScreen";
import ManageTasksPage from "./pages/ManageTasksPage";
import UserHomepage from "./pages/UserHomePage";
import { UserProvider } from "./componets/UserContext";
import TaskBoard from "./pages/TaskBoard";
import NotificationsPage from "./pages/NotificationsPage";
import CreateUserAccount from "./pages/CreateUserAccount";
import UserProfile from "./pages/UserProfilePage";
import ProfilePage from "./pages/ProfilePage";
import AllUsersPage from "./pages/AllUsersPage";
import MyCalendar from "./pages/MyCalendar";
import ProtectedRoute from "./componets/ProtectnRoutes";

const App = () => {
  const [projects, setProjects] = useState([]);
  //Create A new Project
  const addNewProject = async (projectWithResources) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/newprojects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectWithResources),
    });
    if (res.ok) {
      const addedProject = await res.json();
      setProjects([
        ...projects,
        { ...addedProject, id: (projects.length + 1).toString() },
      ]);
    }
  };
  //Delete a project
  const deleteProject = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setProjects(projects.filter((project) => project.ProjectID !== id));
      } else {
        console.error("Failed to delete the project");
      }
    } catch (error) {
      console.error("Error deleting the project:", error);
    }
  };

  //Update a project
  const updateProject = async (updatedProject) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/projects/${updatedProject.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProject),
      }
    );
    if (res.ok) {
      setProjects(
        projects.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      );
    }
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/auth/sign-up" element={<CreateUserAccount />} />
        <Route element={<MainLayout />}>
          <Route path="/homepage" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
          <Route path="/Userhomepage" element={<ProtectedRoute><UserHomepage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projectspage /></ProtectedRoute>} />
          <Route path="/user-projects/:id" element={<ProtectedRoute><Projectspage /></ProtectedRoute>} />
          <Route path="/myCalendar/:id" element={<ProtectedRoute><MyCalendar /></ProtectedRoute>} />
          <Route path="/taskboard/:resourceId" element={<ProtectedRoute><TaskBoard /></ProtectedRoute>} />
          <Route path="/userProfile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/Profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/all-Users" element={<ProtectedRoute><AllUsersPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/add-project" element={<ProtectedRoute><AddProjectPage /></ProtectedRoute>} />
          <Route path="/proposed-resources" element={<ProtectedRoute><ProposedResourcespage addProjectSubmit={addNewProject} /></ProtectedRoute>} />
          <Route path="/edit-project/:id" element={<ProtectedRoute><EditProjectPage updateProjectSubmit={updateProject} /></ProtectedRoute>} loader={projectLoader} />
          <Route path="/manage-tasks/:resourceId" element={<ProtectedRoute><ManageTasksPage /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectPage deleteProject={deleteProject} /></ProtectedRoute>} loader={projectLoader} />
          <Route path="/dashboard/:id" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} loader={projectLoader} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </>
    )
  );

  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
};
export default App;
