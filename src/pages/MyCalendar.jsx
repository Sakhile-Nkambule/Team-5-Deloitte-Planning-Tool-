import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "../componets/Calendar";
import Spinner from "../componets/Spinner";

const MyCalendar = () => {
  const [dateTasks, setDateTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { id } = useParams();

  const fetchUserTasks = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tasks/user/${id}`
      );
      const data = await response.json();
      console.log(data);
      setDateTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false); // Set loading to false regardless of success or failure
    }
  };

  useEffect(() => {
    fetchUserTasks(id); // Call the function with userId
  }, [id]); // Effect runs when userId changes

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lime-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Calendar</h1>
      {isLoading ? (
        <Spinner /> // Display the spinner while loading
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl mx-auto flex items-center justify-center border-2">
          {/* Centering the Calendar component */}
          <div
            className="flex flex-col items-center w-full border-2 hover:shadow-lg 
             transform hover:scale-105 transition-all"
          >
            <Calendar tasks={dateTasks} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
