import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { FaExclamationCircle, FaArrowUp, FaArrowDown } from "react-icons/fa"; // Import icons for priority

export default function Task({ task, index, columnId }) {
  // Function to set background color based on dragging state and column
  function bgcolorChange(isDragging, columnId) {
    if (isDragging) {
      return "bg-lime-400";
    }
    switch (columnId) {
      case "1":
        return "bg-red-500"; // TO DO
      case "2":
        return "bg-yellow-500"; // IN REVIEW
      case "3":
        return "bg-lime-500"; // COMPLETED
      default:
        return "bg-gray-400"; // Default color
    }
  }

  // Function to display the priority icon based on task priority
  function getPriorityIcon(priority) {
    switch (priority) {
      case "High":
        return (
          <FaExclamationCircle className="text-red-600" title="High Priority" />
        );
      case "Medium":
        return (
          <FaArrowUp className="text-yellow-500" title="Medium Priority" />
        );
      case "Low":
        return <FaArrowDown className="text-green-500" title="Low Priority" />;
      default:
        return null; // No icon for unknown priority
    }
  }

  // Format the task's due date
  const formattedStartDate = task.DueDate
    ? new Date(task.DueDate).toLocaleDateString()
    : "_";

  return (
    <Draggable draggableId={`${task.TaskID}`} key={task.TaskID} index={index}>
      {(provided, snapshot) => (
        <div
          className={`rounded-lg shadow-md p-2 text-white mb-2 min-h-120 ml-10 mr-10 ${bgcolorChange(
            snapshot.isDragging,
            columnId
          )}`}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div className="flex justify-between items-center font-bold p-2 bg-black rounded-xl">
            {/* Display Due Date */}
            <span>
              <small>
                Due Date: {formattedStartDate}
                {"  "}
              </small>
            </span>
            {/* Display Priority Icon */}
            <div className="border-2 rounded-full text-white text-xs p-1">
              <span>{task.Priority}</span>
            </div>
          </div>

          {/* Task Description */}
          <div className="flex justify-left p-2">
            <div>{task.Description}</div>
          </div>
          <div className="flex justify-between items-center font-bold p-2 border-2 rounded-xl">
            <div>{task.SystemRequired}</div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
