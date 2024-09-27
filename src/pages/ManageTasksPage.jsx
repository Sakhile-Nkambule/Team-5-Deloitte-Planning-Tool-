import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from "../componets/Calendar";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Spinner from "../componets/Spinner";
import Modal from "../componets/modal";

const ManageTasksPage = () => {
  const [errors, setErrors] = useState({});
  const { resourceId } = useParams(); // Get resourceId from URL params
  const [resource, setResource] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectCode, setProjectCode] = useState(null);
  const [userName, setUserName] = useState(""); // Store specific user name
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [datetasks, setdatetasks] = useState([]);
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);

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
          WorkedHours: resourceData.WorkedHours,
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

        if (resourceData.ProjectID) {
          const projectResponse = await fetch(
            `/api/project/${resourceData.ProjectID}`
          );
          const project = await projectResponse.json();
          setProjectCode(project.ProjectCode || "Unknown Project Code");
        } else {
          setProjectCode("Unknown Project Code");
        }

        //fetch all tasks based on userid only to get all tasks associeted to that user
        if (resourceData.UserID) {
          const taskdates = await fetch(
            `/api/tasks/user/${resourceData.UserID}`
          );
          const data = await taskdates.json();
          setdatetasks(data);
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

  useEffect(() => {
    const forloopOccupiedDates = [];

    for (let i = 0; i < datetasks.length; i++) {
      const dueDate = new Date(datetasks[i].DueDate); // Use only DueDate

      if (!isNaN(dueDate)) {
        forloopOccupiedDates.push(dueDate); // Add only the DueDate to the array
      }
    }

    setOccupiedDates(forloopOccupiedDates); // Update occupiedDates after processing all datetasks
  }, [datetasks]);

  const handleTaskChange = (taskId, field, value) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.TaskID === taskId) {
          let updatedTask = { ...task, [field]: value };

          // Validate Hours
          if (field === "Hours") {
            const hoursValue = Number(value);
            if (isNaN(hoursValue) || hoursValue < 0 || hoursValue > 8) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                [taskId]: {
                  ...prevErrors[taskId],
                  Hours: "Hours must be a number between 0 and 8.",
                },
              }));
            } else {
              setErrors((prevErrors) => ({
                ...prevErrors,
                [taskId]: { ...prevErrors[taskId], Hours: undefined }, // Clear error
              }));
              updatedTask.Hours = hoursValue; // Only update Hours if valid
            }
          }

          // Validate Due Date
          if (field === "DueDate") {
            const dueDate = new Date(value);
            if (dueDate < new Date()) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                [taskId]: {
                  ...prevErrors[taskId],
                  DueDate: "Due Date cannot be in the past.",
                },
              }));
            } else {
              setErrors((prevErrors) => ({
                ...prevErrors,
                [taskId]: { ...prevErrors[taskId], DueDate: undefined }, // Clear error
              }));
              updatedTask.DueDate = value; // Only update DueDate if valid
            }
          }

          return updatedTask;
        }
        return task;
       
      });
     
      return updatedTasks;
    });
  };

  const handleCheckboxChange = (task) => {
    setTaskToComplete(task);
    setIsModalOpen(true); // Open the modal on checkbox click
  };

  const handleConfirmCompletion = async () => {
    if (!taskToComplete) return;
  
    const updatedWorkedHours = parseFloat(resource.WorkedHours) + parseFloat(taskToComplete.Hours);
    console.log("Updated Worked Hours:", updatedWorkedHours);
  
    try {
      // Call the API to update resource's WorkedHours
      await fetch(`/api/resources/${resource.ResourceID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ WorkedHours: updatedWorkedHours }),
      });
  
      // Call the API to update the task's completion status
      await fetch(`/api/tasks/completed/${taskToComplete.TaskID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
  
      // Update the task's completion status in the state
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.TaskID === taskToComplete.TaskID ? { ...t, completed: true } : t
        )
      );
  
      // Update resource worked hours state
      setResource((prevResource) => ({
        ...prevResource,
        WorkedHours: updatedWorkedHours,
      }));
  
      // Close the modal after confirming
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update WorkedHours or task completion", error);
    }
  };
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToComplete(null); // Reset the selected task when modal is closed
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        TaskID: Date.now(), // Unique ID based on timestamp
        ResourceID: resourceId,
        Description: "",
        Status: "",
        Hours: "",
        StartDate: null,
        DueDate: null, // Initialize with null or default date
        SystemRequired: "",
        Priority: "",
        ProjectID: resource.Projectid,
        UserID: resource.UserID,
        isNew: true,
      },
    ]);
  };
  const removeTask = async (taskId) => {
    try {
      if (window.confirm("Are you sure you want to delete this Task?")) {
        await fetch(`/api/task/${taskId}`, {
          method: "DELETE",
        });
      }
      setTasks(tasks.filter((task) => task.TaskID !== taskId));
    } catch (error) {
      console.error("Failed to remove task", error);
    }
  };

  const saveTasks = async () => {
    try {
      const updatedTasks = tasks.filter((task) => !task.isNew);
      const newTasks = tasks.filter((task) => task.isNew);

      const sanitizedUpdatedTasks = updatedTasks.map((task) => ({
        TaskID: task.TaskID,
        ResourceID: task.ResourceID,
        Description: task.Description,
        Status: task.Status,
        Hours: task.Hours,
        DueDate: task.DueDate,
        StartDate: task.StartDate,
        SystemRequired: task.SystemRequired,
        Priority: task.Priority,
        ProjectID: task.ProjectID, // Ensure ProjectID is included
        UserID: task.UserID,
      }));

      if (sanitizedUpdatedTasks.length > 0) {
        await fetch(`/api/tasks/${resourceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedUpdatedTasks),
        });
      }

      if (newTasks.length > 0) {
        const sanitizedNewTasks = newTasks.map((task) => ({
          ResourceID: task.ResourceID,
          Description: task.Description,
          Status: task.Status,
          Hours: task.Hours,
          DueDate: task.DueDate,
          StartDate: task.StartDate,

          SystemRequired: task.SystemRequired,
          Priority: task.Priority,
          ProjectID: task.ProjectID,
          UserID: task.UserID,
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
    if (resourceId) {
      try {
        const notificationData = {
          UserID: resource.UserID,
          Message: `You have been assigned a task on project ${projectCode} `,
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

  //BACK BUTTON
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Goes back to the previous page
  };

  return (
    <div>
      <div className="container m-auto py-2 px-2 text-lime-500 hover:text-lime-700 flex items-center">
        <button onClick={handleGoBack}>
          {" "}
          <FaArrowLeft className="mr-1" /> Back
        </button>
      </div>

      <h2 className="text-black text-3xl text-center font-semibold mb-6 pt-5">
        Manage Tasks
      </h2>
      <div className="flex  gap-96 m-auto py-6 px-6">
        <div className="container ">
          {isLoading ? (
            <p>Loading resource details...</p>
          ) : resource ? (
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Resource Details</h3>
              <div className="mb-2">
                <strong>Name:</strong> {userName}{" "}
              </div>
              <div className="mb-2">
                <strong>Role:</strong> {resource.Role}
              </div>
              <div className="mb-2">
                <strong>Planned Hours:</strong> {resource.PlannedHours}
              </div>
              <div className="mb-2">
                <strong>Worked Hours:</strong> {resource.WorkedHours}
              </div>
            </div>
          ) : (
            <p>Loading resource details...</p>
          )}

          <h3 className="text-xl font-semibold mb-2">Tasks</h3>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.TaskID}
                className="mb-10 border-2 border-lime-500 rounded-xl shadow-lg shadow-t pl-5 pr-5 pb-5 pt-5"
              >
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed || false}
                    onChange={() => handleCheckboxChange(task)}
                  />
                  Completed
                </label>
                <label className="block mb-1 font-semibold">
                  Task Description
                </label>
                <input
                  type="text"
                  value={task.Description || ""}
                  onChange={(e) =>
                    handleTaskChange(task.TaskID, "Description", e.target.value)
                  }
                  placeholder="Task Description"
                  className="border rounded w-full py-2 px-3 mb-2"
                />
                <label className="block mb-1 font-semibold">
                  System to be worked on
                </label>
                <select
                  value={task.SystemRequired || ""}
                  onChange={(e) =>
                    handleTaskChange(
                      task.TaskID,
                      "SystemRequired",
                      e.target.value
                    )
                  }
                  className="border rounded w-full py-2 px-3 mb-2"
                >
                  <option value="SAP">SAP</option>
                  <option value="JDE">JDE</option>
                  <option value="Oracle">Oracle</option>
                  <option value="Genric Application">Genric Application</option>
                  <option value="Microsoft SQL">Microsoft SQL</option>
                  <option value="Oracle DB">Oracle DB</option>
                  <option value="Linux">Linux</option>
                  <option value="Microsoft OS">Microsoft OS</option>
                  <option value="Active Directory">Active Directory</option>
                  <option value="Cyber memo">Cyber memo</option>
                  <option value="CTRA">CTRA</option>
                  <option value="DCNO">DCNO</option>
                  <option value="SAP-AUTO">SAP-AUTO</option>
                  <option value="AUTO">AUTO</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="Project Management">Project Management</option>
                </select>

                <label className="block mb-1 font-semibold">Status</label>
                <select
                  value={task.Status || ""}
                  onChange={(e) =>
                    handleTaskChange(task.TaskID, "Status", e.target.value)
                  }
                  className="border rounded w-full py-2 px-3 mb-2"
                >
                  <option value="To-Do">To-Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <label className="block mb-1 font-semibold">Priority</label>
                <select
                  value={task.Priority || " "}
                  onChange={(e) =>
                    handleTaskChange(task.TaskID, "Priority", e.target.value)
                  }
                  className="border rounded w-full py-2 px-3 mb-2"
                >
                  <option value="High">High</option>
                  <option value="Mid">Mid</option>
                  <option value="Low">Low</option>
                </select>
                <label className="block mb-1 font-semibold">Hours</label>
                <input
                  type="text"
                  value={task.Hours || ""}
                  onChange={(e) =>
                    handleTaskChange(task.TaskID, "Hours", e.target.value)
                  }
                  placeholder="Task Hours"
                  className="border rounded w-full py-2 px-3 mb-2"
                />
                {errors[task.TaskID]?.Hours && (
                  <span className="text-red-500">
                    {errors[task.TaskID].Hours}
                  </span>
                )}
                {/* <label className="block mb-1 font-semibold">Due Date</label>
                <DatePicker
                  selected={task.StartDate ? new Date(task.StartDate) : null}
                  onChange={(date) =>
                    handleTaskChange(task.TaskID, "StartDate", date)
                  }
                  placeholderText="Select Start Date"
                  className="border rounded w-full py-2 px-3 mb-2"
                  dateFormat="yyyy-MM-dd"
                /> */}

                <label className="block mb-1 font-semibold">Due Date</label>
                <DatePicker
                  selected={task.DueDate ? new Date(task.DueDate) : null}
                  onChange={(date) =>
                    handleTaskChange(task.TaskID, "DueDate", date)
                  }
                  placeholderText="Select Due Date"
                  className="border rounded w-full py-2 px-3 mb-2"
                  dateFormat="yyyy-MM-dd"
                />
                {errors[task.TaskID]?.DueDate && (
                  <span className="text-red-500">
                    {errors[task.TaskID].DueDate}
                  </span>
                )}
                <button
                  type="button"
                  className="bg-red-500 ml-5 text-white rounded px-2 py-1"
                  onClick={() => removeTask(task.TaskID)}
                >
                  Remove Task
                </button>
              </div>
            ))
          ) : (
            <p>No tasks available.</p>
          )}

          {/* Modal for confirming task completion */}
          <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
            <h2>Confirm Completion</h2>
            <p>
              Are you sure you want to mark the task "
              {taskToComplete?.Description}" as completed?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompletion}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Confirm
              </button>
            </div>
          </Modal>

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
            onClick={() => {
              saveTasks();
              sendNotification();
            }}
          >
            Save Tasks
          </button>
        </div>
        <div className="container  rounded-xl shadow-lg pl-20 justify-left h-screen">
          <Calendar tasks={datetasks} />
        </div>
      </div>
    </div>
  );
};

export default ManageTasksPage;
