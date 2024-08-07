
import Card from "./Card";
import { Link } from "react-router-dom";
const UserCards = () => {
  return (
    <section className="py-4">
      <div className="container-xl lg:container m-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <Card>
            <h2 className="text-2xl font-bold">Your Projects</h2>
            <p className="mt-2 mb-4">
            Browse through the projects you are assigned to for monitoring and updating.
            </p>
            <Link
              to="/projects"
              className="inline-block bg-lime-500 text-white rounded-lg px-4 py-2 hover:bg-gray-700"
            >
             Browse Your Projects
            </Link>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold">User Profile</h2>
            <p className="mt-2 mb-4">
            View and update your profile information. You can also upload your CV to keep your information up to date.
            </p>
            <Link
              to="/add-project"
              className="inline-block bg-lime-500 text-white rounded-lg px-4 py-2 hover:bg-gray-700"
            >
              Go To Profile
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UserCards;
