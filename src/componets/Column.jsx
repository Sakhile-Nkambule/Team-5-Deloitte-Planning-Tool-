import React from "react";
import { Droppable } from "react-beautiful-dnd";
import Task from "./Task";
export default function Column({ title, tasks, id }) {
  return (
    <div className="bg-gray-20 rounded-md w-80 h-screen column">
      <h3 className="p-4 bg-black text-center text-white text-2xl    font-semibold rounded-t-lg sticky top-0  ">
        {title}
      </h3>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            className={`p-3 transition-colors  bg-gray-100 flex-grow min-h-full ${
              snapshot.isDraggingOver ? "bg-blue-200" : ""
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <Task key={task.id} task={task} index={index} columnId={id} />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
