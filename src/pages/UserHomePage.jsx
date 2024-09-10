import Hero from "../componets/Hero";
import UserCards from "../componets/UserCards";
import ProjectListings from "../componets/ProjectListings";
import UserProjectListings from "../componets/userProjectListings";
import { useUser } from '../componets/UserContext';
import ViewAllProjects from "../componets/ViewAllProjects";

const UserHomepage = () => {
   const { user } = useUser();

  if (!user) {
     return <div>Please log in</div>;
   }
   console.log(user.userId);
  return (
    <>
      <Hero />
      <UserCards />
      <UserProjectListings userId={user.id} isUserHome={true} />
      <ViewAllProjects/>

    </>
  );
};

export default UserHomepage;