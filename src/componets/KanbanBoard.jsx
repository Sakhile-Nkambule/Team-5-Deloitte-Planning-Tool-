import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
export default function Board() {
  const { resourceId } = useParams();

  const [completed, setCompleted] = useState([]);
  const [ToDo, setToDo] = useState([]);
  const [inReview, setInReview] = useState([]);

  useEffect(() => {
    if (resourceId) {
      console.log(`Fetching tasks for resourceId: ${resourceId}`);
      fetch(`/api/tasks/${resourceId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((json) => {
          console.log("Fetched tasks:", json);
          const completedTasks = json.Tasks.filter(
            (task) => task.Status === "Completed"
          );
          const inProgressTasks = json.Tasks.filter(
            (task) => task.Status === "In Progress"
          );
          const ToDoTasks = json.Tasks.filter(
            (task) => task.Status === "To-Do"
          );

          setCompleted(completedTasks);
          setToDo(ToDoTasks);
          setInReview(inProgressTasks);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    } else {
      console.log("resourceId is missing:", resourceId);
    }
  }, [resourceId]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination || source.droppableId === destination.droppableId) return;

    deletePreviousState(source.droppableId, draggableId);

    const task = findItemById(draggableId, [
      ...ToDo,
      ...completed,
      ...inReview,
    ]);

    setNewState(destination.droppableId, task);
  };

  function deletePreviousState(sourceDroppableId, TaskID) {
    switch (sourceDroppableId) {
      case "1":
        setToDo(removeItemById(TaskID, ToDo));
        break;
      case "3":
        setCompleted(removeItemById(TaskID, completed));
        break;
      case "2":
        setInReview(removeItemById(TaskID, inReview));
        break;
      default:
        console.warn(`Unknown sourceDroppableId: ${sourceDroppableId}`);
    }
  }

  function setNewState(destinationDroppableId, task) {
    let updatedTask;
    switch (destinationDroppableId) {
      case "1":
        updatedTask = { ...task, Status: "To-Do" };
        setToDo([updatedTask, ...ToDo]);
        break;
      case "3":
        updatedTask = { ...task, Status: "Completed" };
        setCompleted([updatedTask, ...completed]);
        break;
      case "2":
        updatedTask = { ...task, Status: "In Progress" };
        setInReview([updatedTask, ...inReview]);
        break;
      default:
        console.warn(
          `Unknown destinationDroppableId: ${destinationDroppableId}`
        );
    }
  }

  function findItemById(id, array) {
    return array.find((item) => item.TaskID == id);
  }

  function removeItemById(id, array) {
    return array.filter((item) => item.TaskID != id);
  }

  const handleSave = async () => {
    const promises = [];
  
    if (ToDo.length > 0) {
      promises.push(
        fetch(`/api/tasks/${resourceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ToDo),
        })
      );
    }
  
    if (inReview.length > 0) {
      promises.push(
        fetch(`/api/tasks/${resourceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inReview),
        })
      );
    }
  
    if (completed.length > 0) {
      promises.push(
        fetch(`/api/tasks/${resourceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(completed),
        })
      );
    }
  
    // Execute all requests in parallel
    const responses = await Promise.all(promises);
  
    // Check if all responses are ok
    const allSuccessful = responses.every(response => response.ok);
  
    if (allSuccessful) {
      toast.success("Tasks saved successfully");
    } else {
      toast.error("Failed to save some or all tasks");
    }
  };
  
  

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <h2 className="text-black text-3xl text-center font-semibold pb-4 pt-4">
          PROGRESS BOARD
        </h2>
        <div class="text-center  pb-4">
          <button onClick={handleSave} class="bg-lime-500 hover:bg-lime-700 rounded-full text-white px-10  py-2 ">Save </button>
        </div>

        <div className="flex justify-center space-x-4 rounded-md flex-row h-screen mx-auto ">
          <Column title={"TO DO"} tasks={ToDo} id={"1"} />
          <Column title={"IN PROGRESS"} tasks={inReview} id={"2"} />
          <Column title={"COMPLETED"} tasks={completed} id={"3"} />
        </div>
      </DragDropContext>
    </div>
  );
}
