import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { useParams } from "react-router-dom";

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
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((json) => {
                    console.log('Fetched tasks:', json);
                    const completedTasks = json.Tasks.filter(task => task.Status === "Completed");
                    const inProgressTasks = json.Tasks.filter(task => task.Status === "In Progress");
                    const ToDoTasks = json.Tasks.filter(task => task.Status === "To-Do");

                    setCompleted(completedTasks);
                    setToDo(ToDoTasks);
                    setInReview(inProgressTasks);
                })
                .catch((error) => {
                    console.error('Error fetching tasks:', error);
                });
        } else {
            console.log('resourceId is missing:', resourceId);
        }
    }, [resourceId]);

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination || source.droppableId === destination.droppableId) return;

        deletePreviousState(source.droppableId, draggableId);

        const task = findItemById(draggableId, [...ToDo, ...completed, ...inReview]);

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
                console.warn(`Unknown destinationDroppableId: ${destinationDroppableId}`);
        }
    }

    function findItemById(id, array) {
        return array.find((item) => item.TaskID == id);
    }

    function removeItemById(id, array) {
        return array.filter((item) => item.TaskID != id);
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <h2 className="text-black text-3xl text-center font-semibold pb-4 pt-4">PROGRESS BOARD</h2>
            <div className="flex justify-center space-x-4 rounded-md flex-row h-screen mx-auto ">
                <Column title={"TO DO"} tasks={ToDo} id={"1"} />
                <Column title={"IN PROGRESS"} tasks={inReview} id={"2"} />
                <Column title={"COMPLETED"} tasks={completed} id={"3"} />
            </div>
        </DragDropContext>
    );
}
