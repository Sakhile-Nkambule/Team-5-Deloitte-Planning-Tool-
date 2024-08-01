
import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { useParams } from "react-router-dom";

export default function Board() {
    const { resourceId } = useParams(); // Get resourceId from URL params
    const [completed, setCompleted] = useState([]);
    const [ToDo, setToDo] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [inReview, setInReview] = useState([]);

    useEffect(() => {
        fetch(`/api/tasks/${resourceId}`) // fetch the tasks from the API for a specific resource
            .then((response) => response.json())
            .then((json) => {
                // Filter tasks based on their status
                const completedTasks = json.Tasks.filter(task => task.Status === "Completed");
                const inProgressTasks = json.Tasks.filter(task => task.Status === "In Progress");
                const ToDoTasks = json.Tasks.filter(task => task.Status === "Completed");
    
                setCompleted(completedTasks);
                setToDo(ToDoTasks);
                setInReview(inProgressTasks);

            });
    }, [resourceId]); // Adding resourceId as a dependency ensures the effect runs again if resourceId changes
    

    const handleDragEnd = (result) => {
        //result is a built in object that contains the source and destination of the drag
        //it is from the react-beautiful-dnd library
        const { destination, source, draggableId } = result;

        if (!destination || source.droppableId === destination.droppableId) return;

        deletePreviousState(source.droppableId, draggableId);

        const task = findItemById(draggableId, [...ToDo, ...completed, ...inReview, ...backlog]);

        setNewState(destination.droppableId, task);

    };

    function deletePreviousState(sourceDroppableId, TaskID) {
        switch (sourceDroppableId) {
            case "1":
                // remove item from ToDo since the sorce id is 1 which is the first column with id one hence remove from that column
                //we set the ne state to the ToDo column
                setToDo(removeItemById(TaskID, ToDo)); 
                break;
            case "3":
                setCompleted(removeItemById(TaskID, completed));
                break;
            case "2":
                setInReview(removeItemById(TaskID, inReview));
                break;
            // case "4":
            //      setBacklog(removeItemById(task.TaskID, backlog));
            //     break;
        }

    }
    function setNewState(destinationDroppableId, task) {
        let updatedTask;
        switch (destinationDroppableId) {
            case "1":   // TO DO
                updatedTask = { ...task,Status:"To-Do" };
                setToDo([updatedTask, ...ToDo]);
                break;
            case "3":  // DONE
                updatedTask = { ...task, Status:"Completed" };
                setCompleted([updatedTask, ...completed]);
                break;
            case "2":  // IN REVIEW
                updatedTask = { ...task, Status:"In Progress" }; //
                setInReview([updatedTask, ...inReview]);
                break;
            // case "4":  // BACKLOG
            //     updatedTask = { ...task, completed: false };
            //     setBacklog([updatedTask, ...backlog]);
            //     break;
        }
    }
    function findItemById(id, array) {
        return array.find((item) => item.TaskID == id);
    }

    function removeItemById(id, array) {
        return array.filter((item) => item.TaskID != id);//filter out the item with the id
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <h2 className="text-black text-3xl text-center font-semibold pb-4 pt-4">PROGRESS BOARD</h2>

            <div className="flex justify-center space-x-4  rounded-md  flex-row h-screen mx-auto ">
                <Column title={"TO DO"} tasks={ToDo} id={"1"} />
                <Column title={"IN PROGRESS"} tasks={inReview} id={"2"} />
                <Column title={"COMPLETED"} tasks={completed} id={"3"} />
            </div>
        </DragDropContext>
    );
}

