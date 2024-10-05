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
import ManageTasksPage from './pages/ManageTasksPage';
import UserHomepage from "./pages/UserHomePage";
import { UserProvider } from './componets/UserContext';
import TaskBoard from "./pages/TaskBoard";
import NotificationsPage from "./pages/NotificationsPage";
import CreateUserAccount from "./pages/CreateUserAccount";
import UserProfile from "./pages/UserProfilePage";
//import VerifyEmail from "./pages/VerificationPage";
const App = () => {



    const [projects, setProjects] = useState([]);
//Create A new Project
  const addNewProject = async (projectWithResources) => {
    const res = await fetch("http://localhost:8081/newprojects", {
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
    const response = await fetch(`http://localhost:8081/projects/${id}`, {
      method: "DELETE",
    });
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
    const res = await fetch(`http://localhost:8081/projects/${updatedProject.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProject),
    });
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
        {/* <Route path="/verify-email" element={<VerifyEmail />} /> */}
        
        <Route path="/auth/sign-up" element={<CreateUserAccount />} />
        <Route element={<MainLayout />}>
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/Userhomepage" element={<UserHomepage />} />
          <Route path="/projects" element={<Projectspage />} />
          <Route path="/user-projects/:id" element={<Projectspage />} />
          <Route path="/taskboard/:resourceId" element={<TaskBoard/>}/>
          <Route path="/userProfile" element={<UserProfile/>}/>
          <Route path="/notifications" element={<NotificationsPage/>}/>
          <Route
            path="/add-project"
            element={<AddProjectPage /*planA={addNew}*/ />}
          />
          <Route
            path="/proposed-resources"
            element={
              <ProposedResourcespage addProjectSubmit={addNewProject} />
            }
          />
          <Route
            path="/edit-project/:id"
            element={<EditProjectPage updateProjectSubmit={updateProject} />}
            loader={projectLoader}
          />
          <Route path="/manage-tasks/:resourceId" element={<ManageTasksPage />} />
          <Route
            path="/project/:id"
            element={<ProjectPage deleteProject={deleteProject} />}
            loader={projectLoader}
          />
          <Route 
          path="/dashboard/:id" 
          element={<DashboardPage />} 
          loader={projectLoader}
          />
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