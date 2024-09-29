import React from 'react';

const TaskCard = ({ task, resource, priorityIcon, isCompleted }) => {
  return (
    <div className="border p-0 rounded-lg shadow-sm mb-4">
      {/* User Name Section */}
      <div className={`p-2 ${isCompleted ? 'bg-green-500' : 'bg-red-500'} text-white`}>
      <h4 className="font-semibold">{resource?.UserName || 'Unknown User'}</h4>
      </div>
      
      {/* Task Description Section */}
      <div className={`p-2 ${isCompleted ? 'bg-gray-500' : 'bg-gray-500'} text-white`}>
        <div className="flex justify-between items-center">
          <p>{task.Description}</p>
          <div>{priorityIcon}</div>
        </div>
      </div>

      {/* System, Hours, and Due Date Section */}
      <div className="bg-gray text-black p-2 rounded-b-lg">
        <p><strong>System:</strong> {task.SystemRequired}</p>
        <p><strong>Hours:</strong> {task.Hours}</p>
        <p><strong>Due Date:</strong> {new Date(task.DueDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

const ProjectKanbanBoard = ({ outstandingTasks, completedTasks, users }) => {

// Function to get the corresponding user from the users list by their UserID (UserID from the task)
const getUser = (userID) => users.find(user => user.UserID === userID);
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Outstanding Tasks Section */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2 bg-black text-white p-2 rounded-lg">Outstanding Tasks</h3>
        {outstandingTasks.map(task => (
          <TaskCard 
            key={task.TaskID}
            task={task}
            resource={getUser(task.UserID)}
            priorityIcon={<span role="img" aria-label="priority">⚠️</span>} // Example priority icon
            isCompleted={false}
          />
        ))}
      </div>

      {/* Completed Tasks Section */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2 bg-black text-white p-2 rounded-lg">Completed Tasks</h3>
        {completedTasks.map(task => (
          <TaskCard 
            key={task.TaskID}
            task={task}
            resource={getUser(task.UserID)}
            priorityIcon={<span role="img" aria-label="priority">✅</span>} // Example priority icon
            isCompleted={true}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectKanbanBoard;
