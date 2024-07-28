
import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";

export default function Board() {
    const [completed, setCompleted] = useState([]);
    const [incomplete, setIncomplete] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [inReview, setInReview] = useState([]);

    useEffect(() => {
        fetch("https://jsonplaceholder.typicode.com/todos")
            .then((response) => response.json())
            .then((json) => {
                setCompleted(json.filter((task) => task.completed));
                setIncomplete(json.filter((task) => !task.completed));
            });
    }, []);

    const handleDragEnd = (result) => {
        //result is a built in object that contains the source and destination of the drag
        //it is from the react-beautiful-dnd library
        const { destination, source, draggableId } = result;

        if (!destination || source.droppableId === destination.droppableId) return;

        deletePreviousState(source.droppableId, draggableId);

        const task = findItemById(draggableId, [...incomplete, ...completed, ...inReview, ...backlog]);

        setNewState(destination.droppableId, task);

    };

    function deletePreviousState(sourceDroppableId, taskId) {
        switch (sourceDroppableId) {
            case "1":
                // remove item from incomplete since the sorce id is 1 which is the first column with id one hence remove from that column
                //we set the ne state to the incomplete column
                setIncomplete(removeItemById(taskId, incomplete)); 
                break;
            case "3":
                setCompleted(removeItemById(taskId, completed));
                break;
            case "2":
                setInReview(removeItemById(taskId, inReview));
                break;
            // case "4":
            //      setBacklog(removeItemById(taskId, backlog));
            //     break;
        }

    }
    function setNewState(destinationDroppableId, task) {
        let updatedTask;
        switch (destinationDroppableId) {
            case "1":   // TO DO
                updatedTask = { ...task, completed: false };
                setIncomplete([updatedTask, ...incomplete]);
                break;
            case "3":  // DONE
                updatedTask = { ...task, completed: true };
                setCompleted([updatedTask, ...completed]);
                break;
            case "2":  // IN REVIEW
                updatedTask = { ...task, completed: false };
                setInReview([updatedTask, ...inReview]);
                break;
            // case "4":  // BACKLOG
            //     updatedTask = { ...task, completed: false };
            //     setBacklog([updatedTask, ...backlog]);
            //     break;
        }
    }
    function findItemById(id, array) {
        return array.find((item) => item.id == id);
    }

    function removeItemById(id, array) {
        return array.filter((item) => item.id != id);//filter out the item with the id
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <h2 className="text-black text-3xl text-center font-semibold pb-4 pt-4">PROGRESS BOARD</h2>

            <div className="flex justify-between items-start rounded-md  flex-row w-100 h-screen mx-auto pl-4 pr-4">
                <Column title={"TO DO"} tasks={incomplete} id={"1"} />
                <Column title={"IN PROGRESS"} tasks={inReview} id={"2"} />
                <Column title={"COMPLETED"} tasks={completed} id={"3"} />
            </div>
        </DragDropContext>
    );
}
