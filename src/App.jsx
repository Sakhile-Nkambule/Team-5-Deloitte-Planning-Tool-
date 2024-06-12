
import {Route,createBrowserRouter,createRoutesFromElements,RouterProvider,} from 'react-router-dom';
import Homepage from './pages/Homepage';
import MainLayout from './layouts/MainLayout';
import Projectspage from './pages/Projectspage';
import NotFoundPage from './pages/NotFoundPage';
import ProjectPage, {projectLoader} from './pages/ProjectPage';
import AddProjectPage from './pages/AddProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import ProposedResourcespage from './pages/ProposedResourcespage';
import DashboardPage from './pages/DashboardPage';
import { useState } from 'react';
const App = () => {
   const [projects, setProjects] = useState([]);
//   const addProjectSubmit = (newProject) => {
//    setProjects([...projects, { ...newProject, id: (projects.length + 1).toString() }]);
//  };
  //ADD PROJECT
  const addProjectSubmit = async (newProject)=>{
    const res =await fetch ('/api/projects' , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProject),
    });
     // Ensure the project was successfully added before updating the state
     if (res.ok) {
      const addedProject = await res.json();
      setProjects([...projects, { ...addedProject, id: (projects.length + 1).toString() }]);
     }
  };
  //DELETE PROJECT
  const deleteProject = async(id)=>{
    const res =await fetch (`/api/projects/${id}` , {
      method: 'DELETE',
      
    });
    return;
  };

  // UPDATE PROJECT
  const updateProject = async (project)=>{
    const res =await fetch (`/api/projects/${project.id}` , {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(project), 
    });
    return;
  };

  const router = createBrowserRouter(createRoutesFromElements(
  <Route path = '/' element= {<MainLayout/>}>
  <Route index element= {<Homepage/>}/>
  <Route path= '/projects' element= {<Projectspage/>}/>
  <Route path= '/add-project' element= {<AddProjectPage/> }/>
  <Route path="/proposed-resources" element={<ProposedResourcespage addProjectSubmit={addProjectSubmit} />} />
  <Route path= '/edit-project/:id' element= {<EditProjectPage updateProjectSubmit={updateProject}/>} loader ={projectLoader}/>
  <Route path= '/projects/:id' element= {<ProjectPage deleteProject = {deleteProject}/>} loader ={projectLoader}/>
  <Route path= '/dashboard' element= {<DashboardPage/>}/>
  <Route path= '*' element= {<NotFoundPage/>}/>
  </Route>
  ));
  return <RouterProvider router ={router}/>;
};

export default App;
