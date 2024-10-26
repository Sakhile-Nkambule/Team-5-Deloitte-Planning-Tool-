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
  const [projectStartDate, setProjectStartDate] = useState(null);
  const [projectEndDate, setProjectEndDate] = useState(null);
  const [projectCode, setProjectCode] = useState(null);
  const [userName, setUserName] = useState(""); // Store specific user name
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [datetasks, setdatetasks] = useState([]);
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState("All");
  const [isProficiencyModalOpen, setIsProficiencyModalOpen] = useState(false);
  const [skillsetToUpdate, setSkillsetToUpdate] = useState(null);
  const [newProficiency, setNewProficiency] = useState(null);
  const [warnings, setWarnings] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch resource details and tasks
        const resourceResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/tasks/${resourceId}`
        );
        const resourceData = await resourceResponse.json();

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
          const userResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/user/${resourceData.UserID}`
          );
          const user = await userResponse.json();
          setUserName(user.UserName || "Unknown User");
        } else {
          setUserName("Unknown User");
        }

        if (resourceData.ProjectID) {
          const projectResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/project/${resourceData.ProjectID}`
          );
          const project = await projectResponse.json();
          console.log(project);

          setProjectCode(project.ProjectCode || "Unknown Project Code");
          setProjectStartDate(project.StartDate || "Unknown Project Code");
          setProjectEndDate(project.EndDate || "Unknown Project Code");
          console.log("Filtered startdate:", project.StartDate);
        } else {
          setProjectCode("Unknown Project Code");
        }

        //fetch all tasks based on userid only to get all tasks associeted to that user
        if (resourceData.UserID) {
          const taskdates = await fetch(
            `${import.meta.env.VITE_API_URL}/tasks/user/${resourceData.UserID}`
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

  const handleTaskChange = (taskId, field, value) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.TaskID === taskId) {
          let updatedTask = { ...task, [field]: value };

          // Validate Hours
          if (field === "Hours") {
            const hoursValue = Number(value);
            if (isNaN(hoursValue) || hoursValue < 0) {
              // If input is not a number or is negative
              setErrors((prevErrors) => ({
                ...prevErrors,
                [taskId]: {
                  ...prevErrors[taskId],
                  Hours: "Hours must be a non-negative number.",
                },
              }));
            } else if (hoursValue > 8) {
              // If hours exceed 8
              setErrors((prevErrors) => ({
                ...prevErrors,
                [taskId]: {
                  ...prevErrors[taskId],
                  Hours: "Warning: Hours exceed the limit of 8.",
                },
              }));
            } else {
              // Valid hours
              setErrors((prevErrors) => ({
                ...prevErrors,
                [taskId]: { ...prevErrors[taskId], Hours: undefined }, // Clear error
              }));
              updatedTask.Hours = hoursValue; // Update Hours if valid
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
              updatedTask.DueDate = value; // Update DueDate if valid
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

    const updatedWorkedHours =
      parseFloat(resource.WorkedHours) + parseFloat(taskToComplete.Hours);

    try {
      // Call the API to update resource's WorkedHours
      await fetch(`${import.meta.env.VITE_API_URL}/resources/${resource.ResourceID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ WorkedHours: updatedWorkedHours }),
      });

      // Call the API to update the task's completion status
      await fetch(
        `${import.meta.env.VITE_API_URL}/tasks/completed/${taskToComplete.TaskID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: true }),
        }
      );

      // Update task completion status in the state
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

      // Fetch the user's skillsets to update the workedHours
      const skillsetsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/skillset/${resource.UserID}`
      );
      const skillsets = await skillsetsResponse.json();
      console.log("User SKILLS: ", skillsets);
      console.log("System Required: ", taskToComplete.SystemRequired);

      // Find the specific skillset related to this task (by SkillsetRequired)
      const skillsetToUpdate = skillsets.find(
        (s) => s.skillset === taskToComplete.SystemRequired
      );

      console.log("Skill to update: ", skillsetToUpdate);
      if (skillsetToUpdate) {
        const newSkillsetWorkedHours =
          parseFloat(skillsetToUpdate.workedHours) +
          parseFloat(taskToComplete.Hours);
        console.log("Updated Worked Hours:", newSkillsetWorkedHours);

        // Update the workedHours on the skillset
        await fetch(
          `${import.meta.env.VITE_API_URL}/skillsets/${skillsetToUpdate.SkillID}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workedHours: newSkillsetWorkedHours,
              proficiency: skillsetToUpdate.proficiency,
            }),
          }
        );

        // Determine if proficiency needs to be updated
        let newProficiency = skillsetToUpdate.proficiency;
        console.log(newProficiency);

        if (newSkillsetWorkedHours >= 80 && newSkillsetWorkedHours < 160)
          newProficiency = 10;
        else if (newSkillsetWorkedHours >= 160 && newSkillsetWorkedHours < 240)
          newProficiency = 20;
        else if (newSkillsetWorkedHours >= 240 && newSkillsetWorkedHours < 320)
          newProficiency = 30;
        else if (newSkillsetWorkedHours >= 320 && newSkillsetWorkedHours < 400)
          newProficiency = 40;
        else if (newSkillsetWorkedHours >= 400 && newSkillsetWorkedHours < 480)
          newProficiency = 50;
        else if (newSkillsetWorkedHours >= 480 && newSkillsetWorkedHours < 560)
          newProficiency = 60;
        else if (newSkillsetWorkedHours >= 560 && newSkillsetWorkedHours < 640)
          newProficiency = 70;
        else if (newSkillsetWorkedHours >= 640 && newSkillsetWorkedHours < 720)
          newProficiency = 80;
        else if (newSkillsetWorkedHours >= 720 && newSkillsetWorkedHours < 800)
          newProficiency = 90;
        else if (newSkillsetWorkedHours >= 800) newProficiency = 100;
        // If proficiency increased, show confirmation modal
        if (newProficiency > skillsetToUpdate.proficiency) {
          setIsProficiencyModalOpen(true);
          setSkillsetToUpdate({
            ...skillsetToUpdate,
            newProficiency,
            newSkillsetWorkedHours,
          });
          console.log(skillsetToUpdate);
        } else {
          toast.success(`Task Set to Complete successfully`);
        }
      } else {
        toast.success(`Task Set to Complete successfully`);
      }

      // Close the task completion modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update WorkedHours or task completion", error);
    }
  };

  // Function to handle proficiency confirmation
  const handleConfirmProficiencyIncrease = async () => {
    try {
      // Update the proficiency for the skillset
      await fetch(
        `${import.meta.env.VITE_API_URL}/skillsets/${skillsetToUpdate.SkillID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workedHours: skillsetToUpdate.newSkillsetWorkedHours,
            proficiency: skillsetToUpdate.newProficiency,
          }),
        }
      );

      // Close the proficiency modal
      setIsProficiencyModalOpen(false);
      toast.success(`Proficiency updated successfully!`);
    } catch (error) {
      console.error("Failed to update proficiency", error);
    }
  };

  // Function to close the proficiency modal
  const handleCloseProficiencyModal = () => {
    setIsProficiencyModalOpen(false);
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
        Status: "To-Do",
        Hours: "",
        StartDate: null,
        DueDate: null, // Initialize with null or default date
        SystemRequired: "SAP",
        Priority: "High",
        ProjectID: resource.Projectid,
        UserID: resource.UserID,
        isNew: true,
        completed: false,
      },
    ]);
    setSelectedTaskStatus("To-Do");
  };
  const removeTask = async (taskId) => {
    try {
      // Confirm with the user before removing the task
      if (window.confirm("Are you sure you want to delete this Task?")) {
        if (taskId) {
          // If the task exists in the database (has a TaskID), make the DELETE request
          await fetch(`${import.meta.env.VITE_API_URL}/task/${taskId}`, {
            method: "DELETE",
          });
        }

        // Remove the task from the state, regardless of whether it's saved in the database
        setTasks(
          tasks.filter((task) => task.TaskID !== taskId && task.TaskID !== null)
        );
      }
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
        await fetch(`${import.meta.env.VITE_API_URL}/tasks/${resourceId}`, {
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

        await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
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

        const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData),
        });

        if (response.ok) {
          toast.success(`Task Notification sent to ${userName} successfully`);
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

  //FILTER
  const tasksStatus = ["All", "Completed", "In Progress", "To-Do"];

  // Filter users by selected role
  const filteredTasks =
    selectedTaskStatus === "All"
      ? tasks
      : tasks.filter((task) => task.Status === selectedTaskStatus);

  const projectDateRange = {
    start: projectStartDate,
    end: projectEndDate,
  };

  //BACK BUTTON
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Goes back to the previous page
    console.log("Filtered range:", projectDateRange);
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
      <div className="flex gap-96 m-auto py-6 px-6">
        <div className="container ">
          {isLoading ? (
            <p>Loading resource details...</p>
          ) : resource ? (
            <div className="mb-4 border-2 rounded-xl shadow-lg p-5">
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
          {/* Tasks Filtering */}
          <div className="mb-4">
            <label className="mr-2">Filter by Status:</label>
            <select
              value={selectedTaskStatus}
              onChange={(e) => setSelectedTaskStatus(e.target.value)}
              className="border rounded p-2"
            >
              {tasksStatus.map((tasksStatus) => (
                <option key={tasksStatus} value={tasksStatus}>
                  {tasksStatus}
                </option>
              ))}
            </select>
          </div>

          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              // Determine the border color based on task status and completion
              const borderColor = task.completed
                ? "border-green-500"
                : task.Status === "Completed"
                ? "border-yellow-500"
                : task.Status === "In Progress"
                ? "border-red-500"
                : "border-red-500"; // Default color for "To-Do"

              return (
                <div
                  key={task.TaskID}
                  className={`mb-10 border-2 ${borderColor} rounded-xl p-5 shadow-md transition-transform transform hover:scale-105 hover:shadow-lg relative `}
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
                      handleTaskChange(
                        task.TaskID,
                        "Description",
                        e.target.value
                      )
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
                    <option value="Genric Application">
                      Genric Application
                    </option>
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
                    <option value="Project Management">
                      Project Management
                    </option>
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
                    <span className="text-red-500 ">
                      {errors[task.TaskID].Hours}
                    </span>
                  )}
                  {/* Warning for total hours exceeding 8 */}
                  {warnings[task.TaskID] && (
                    <span className="text-yellow-500">
                      {warnings[task.TaskID]}
                    </span>
                  )}

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
                    className="bg-red-500 ml-5 text-white rounded px-2 py-1  hover:bg-red-600 hover:shadow-lg 
             transform hover:scale-105 transition-all"
                    onClick={() => removeTask(task.TaskID)}
                  >
                    Remove Task
                  </button>
                </div>
              );
            })
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
          {/* Modal for confirming proficiency increase */}
          <Modal
            isOpen={isProficiencyModalOpen}
            onClose={handleCloseProficiencyModal}
          >
            <h2 className="text-2xl font-bold mb-4">Proficiency Update !!!</h2>

            {/* Added margin between header and body */}
            <p className="mb-2">
              The User has worked for {skillsetToUpdate?.newSkillsetWorkedHours}{" "}
              hours on the skill "{skillsetToUpdate?.skillset}".
            </p>

            <p className="mb-2">
              The proficiency for the skill "{skillsetToUpdate?.skillset}" has
              increased.
            </p>

            {/* New proficiency styled: only the value is dark green */}
            <p className="mt-4 font-bold">
              New Proficiency:{" "}
              <span className="text-green-800">
                {skillsetToUpdate?.newProficiency}%
              </span>
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseProficiencyModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmProficiencyIncrease}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Confirm
              </button>
            </div>
          </Modal>

          <button
            type="button"
            className="bg-blue-500 text-white rounded px-4 py-2 mt-4 
             hover:bg-blue-700 hover:shadow-lg 
             transform hover:scale-105 transition-all"
            onClick={addTask}
          >
            Add Task
          </button>

          <button
            type="button"
            className="bg-lime-500 text-white rounded px-4 py-2 mt-4 ml-4  hover:bg-lime-600 hover:shadow-lg 
             transform hover:scale-105 transition-all"
            onClick={() => {
              saveTasks();
              sendNotification();
            }}
          >
            Save Tasks
          </button>
        </div>
        <div className="container rounded-xl shadow-lg pl-20 justify-left h-screen border-2 hover:shadow-lg 
             transform hover:scale-105 transition-all">
          <Calendar tasks={datetasks} projectDateRange={projectDateRange} />
        </div>
      </div>
    </div>
  );
};
export default ManageTasksPage;
