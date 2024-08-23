import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
const ManageTasksPage = () => {
  const { resourceId } = useParams(); // Get resourceId from URL params
  const [resource, setResource] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(""); // Store specific user name
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch resource details and tasks
        const resourceResponse = await fetch(`/api/tasks/${resourceId}`);
        const resourceData = await resourceResponse.json();
        console.log(resourceData);
        setResource({
          ResourceID: resourceData.ResourceID,
          UserID: resourceData.UserID,
          Role: resourceData.Role,
          PlannedHours: resourceData.PlannedHours,
          Projectid: resourceData.ProjectID,
        });
        setTasks(resourceData.Tasks || []);
  
        // Check if UserID exists before fetching user data
        if (resourceData.UserID) {
          const userResponse = await fetch(`/api/user/${resourceData.UserID}`);
          const user = await userResponse.json();
          setUserName(user.UserName || "Unknown User");
        } else {
          setUserName("Unknown User");
        }
  
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [resourceId]);
  

  const handleTaskChange = (taskId, field, value) => {
    setTasks(
      tasks.map((task) =>
        task.TaskID === taskId ? { ...task, [field]: value } : task
      )
    );
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        TaskID: Date.now(), // Unique ID based on timestamp
        ResourceID: resourceId,
        Description: "",
        Status: "To-Do",
        isNew: true,
      },
    ]);
  };

  const removeTask = async (taskId) => {
    try {
      await fetch(`/api/task/${taskId}`, {
        method: "DELETE",
      });
      setTasks(tasks.filter((task) => task.TaskID !== taskId));
    } catch (error) {
      console.error("Failed to remove task", error);
    }
  };

  const saveTasks = async () => {
    try {
      const updatedTasks = tasks.filter((task) => !task.isNew);
      const newTasks = tasks.filter((task) => task.isNew);

      if (updatedTasks.length > 0) {
        await fetch(`/api/tasks/${resourceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTasks),
        });
      }

      if (newTasks.length > 0) {
        const sanitizedNewTasks = newTasks.map((task) => ({
          ResourceID: task.ResourceID,
          Description: task.Description,
          Status: task.Status,
        }));

        await fetch(`/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedNewTasks),
        });
      }

      alert("Tasks saved successfully!");
    } catch (error) {
      console.error("Failed to save tasks", error);
    }
  };


  const sendNotification = async () => {
    // Find the Partner/Director from the resources array
    // const associateDirector = resources.find(
    //   (resource) => resource.role === "Partner/Director"
    // );
  
    if (resourceId) {
      try {
        const notificationData = {
          UserID: resource.UserID,
          Message: `You have been assigned a task on project ${resource.Projectid} `,
          Type: "In-App",
          Priority: "High",
        };
  
        const response = await fetch("http://localhost:8081/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData),
        });
  
        if (response.ok) {
          toast.success("Task Notification sent successfully");
        } else {
          toast.error("Failed to send Task Notification");
        }
      } catch (error) {
        console.error("Error sending notification:", error);
        toast.error("An error occurred while sending the ");
      }
    } else {
      toast.error("No Partner/Director found in the resources");
    }
  };

  return (
    <div className="container m-auto py-6 px-6">
      <h2 className="text-black text-3xl text-center font-semibold mb-6">
        Manage Tasks
      </h2>
      {isLoading ? (
        <p>Loading resource details...</p>
      ) : resource ? (
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Resource Details</h3>
          <div className="mb-2">
            <strong>Name:</strong> {userName} {/* Display the specific user name */}
          </div>
          <div className="mb-2">
            <strong>Role:</strong> {resource.Role}
          </div>
          <div className="mb-2">
            <strong>Planned Hours:</strong> {resource.PlannedHours}
          </div>
        </div>
      ) : (
        <p>Loading resource details...</p>
      )}
      <h3 className="text-xl font-semibold mb-2">Tasks</h3>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task.TaskID} className="mb-4">
            <input
              type="text"
              value={task.Description || ""}
              onChange={(e) =>
                handleTaskChange(task.TaskID, "Description", e.target.value)
              }
              placeholder="Task Description"
              className="border rounded w-full py-2 px-3 mb-2"
            />
            <select
              value={task.Status || "To-Do"}
              onChange={(e) =>
                handleTaskChange(task.TaskID, "Status", e.target.value)
              }
              className="border rounded w-full py-2 px-3 mb-2"
            >
              <option value="To-Do">To-Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              type="button"
              className="bg-red-500 text-white rounded px-2 py-1"
              onClick={() => removeTask(task.TaskID)}
            >
              Remove Task
            </button>
          </div>
        ))
      ) : (
        <p>No tasks available.</p>
      )}
      <button
        type="button"
        className="bg-blue-500 text-white rounded px-4 py-2 mt-4"
        onClick={addTask}
      >
        Add Task
      </button>
      <button
        type="button"
        className="bg-green-500 text-white rounded px-4 py-2 mt-4 ml-4"
        onClick={()=>{saveTasks();
           sendNotification();
          }}
      >
        Save Tasks
      </button>
    </div>
  );
};

export default ManageTasksPage;
