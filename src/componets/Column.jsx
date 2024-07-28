import React from "react";
import { Droppable } from "react-beautiful-dnd";
import Task from "./Task";
export default function Column({ title, tasks, id }) {
    return (
        <div className="bg-gray-20 rounded-md w-96 h-screen column">
            <h3 className="p-4 bg-lime-500 text-center text-2xl font-semibold rounded-t-lg sticky top-0  ">
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
                        {/* <Task task={{id: 123, title: "Make a progress board app"}}index={1}/> */}
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
