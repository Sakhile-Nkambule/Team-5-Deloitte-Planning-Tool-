
import Hero from "../componets/Hero";
import HomeCards from "../componets/HomeCards";
import ProjectListings from "../componets/ProjectListings";

import ViewAllProjects from "../componets/ViewAllProjects";
const Homepage = () => {
  return (
    <>
     <Hero/>
     <HomeCards />
     <ProjectListings isHome = {true}/>
     <ViewAllProjects/>     
    </>
   
    
  );
};

export default Homepage;