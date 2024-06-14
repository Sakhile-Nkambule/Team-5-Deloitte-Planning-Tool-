import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Homepage from './pages/Homepage';
import MainLayout from './layouts/MainLayout';
import Projectspage from './pages/Projectspage';
import NotFoundPage from './pages/NotFoundPage';
import ProjectPage, { projectLoader } from './pages/ProjectPage';
import AddProjectPage from './pages/AddProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import ProposedResourcespage from './pages/ProposedResourcespage';
import DashboardPage from './pages/DashboardPage';
import { useState } from 'react';
import LoginScreen from './pages/LoginScreen';

const App = () => {
    const [projects, setProjects] = useState([]);

    const addProjectSubmit = async (newProject) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProject),
        });
        if (res.ok) {
            const addedProject = await res.json();
            setProjects([...projects, { ...addedProject, id: (projects.length + 1).toString() }]);
        }
    };

    const deleteProject = async (id) => {
        await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
        });
        setProjects(projects.filter(project => project.id !== id));
    };

    const updateProject = async (updatedProject) => {
        const res = await fetch(`/api/projects/${updatedProject.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProject),
        });
        if (res.ok) {
            setProjects(projects.map(project => 
                project.id === updatedProject.id ? updatedProject : project
            ));
        }
    };

    const router = createBrowserRouter(createRoutesFromElements(
      <>
        <Route path="/" element={<LoginScreen/>} />
        <Route element={<MainLayout />}>
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/projects" element={<Projectspage />} />
          <Route path="/add-project" element={<AddProjectPage />} />
          <Route path="/proposed-resources" element={<ProposedResourcespage addProjectSubmit={addProjectSubmit} />} />
          <Route path="/edit-project/:id" element={<EditProjectPage updateProjectSubmit={updateProject} />} loader={projectLoader} />
          <Route path="/projects/:id" element={<ProjectPage deleteProject={deleteProject} />} loader={projectLoader} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </>
    ));

    return <RouterProvider router={router} />;
};

export default App;
