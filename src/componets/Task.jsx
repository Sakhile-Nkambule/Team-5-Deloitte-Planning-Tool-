import React from "react";
import { Draggable } from "react-beautiful-dnd";

export default function Task({ task, index, columnId }) {
    function bgcolorChange(isDragging, columnId) {
        if (isDragging) {
            return "bg-lime-400";
        }
        switch (columnId) {
            case "1":
                return "bg-red-500";  // TO DO
            case "2":
                return "bg-yellow-200";  // IN REVIEW
            case "3":
                return "bg-lime-500";  // COMPLETED
            default:
                return "bg-gray-300";  // Default color
        }
    }

    return (
        <Draggable draggableId={`${task.id}`} key={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`rounded-lg shadow-md p-2 text-black mb-2 min-h-120 ml-10 mr-10 ${bgcolorChange(snapshot.isDragging, columnId)}`}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                >
                    <div className="flex justify-start p-2">
                        <span>
                            <small>#{task.id}{"  "}</small>
                        </span>
                    </div>
                    <div className="flex justify-center p-2">
                        <div>{task.title}</div>
                    </div>
                    {provided.placeholder}
                </div>
            )}
        </Draggable>
    );
}
