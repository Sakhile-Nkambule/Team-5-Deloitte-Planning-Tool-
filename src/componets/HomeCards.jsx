import Card from "./Card";
import { Link } from "react-router-dom";
const HomeCards = () => {
  return (
    <section className="py-4">
      <div className="container-xl lg:container m-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <Card>
            <h2 className="text-2xl font-bold">Existing Projects?</h2>
            <p className="mt-2 mb-4">
              Browse Existing Projects for Monitoring and updating
            </p>
            <Link
              to="/projects"
              className="inline-block bg-lime-500 text-white rounded-lg px-4 py-2  hover:bg-lime-600 hover:shadow-lg 
             transform hover:scale-105 transition-all"
            >
              Browse Existing Projects
            </Link>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold">New Project?</h2>
            <p className="mt-2 mb-4">
              Add a new project by entering project details including project code from SAP and the system will propose a combination of resources for the project
            </p>
            <Link
              to="/add-project"
              className="inline-block bg-lime-500 text-white rounded-lg px-4 py-2  hover:bg-lime-600 hover:shadow-lg 
             transform hover:scale-105 transition-all"
            >
              Add Project
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HomeCards;
