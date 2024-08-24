import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { faBell, faTimes } from '@fortawesome/free-solid-svg-icons';

function Notification({ NotificationID,message, description, color, onDelete }) {
    let bgColor = "";
    if (color === "High") bgColor = "bg-red-300";
    if (color === "Mid") bgColor = "bg-yellow-300";
    if (color === "Low") bgColor = "bg-green-300";

   
    return (
      <div className='mb-10 relative mx-auto w-full max-w-2xl'>
        <div className={`${bgColor}  w-5/6 rounded-t-lg shadow-2xl p-2 text-black font-bold text-xl min-h-120`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faBell} className="pr-2 pl-2" size="1x" />
              {description}
            </div>
            <FontAwesomeIcon 
              icon={faTimes} 
              className="cursor-pointer text-black" 
              onClick={() => onDelete(NotificationID)}
            />
          </div>
        </div>
        <div className='bg-white w-5/6 rounded-b-lg shadow-2xl p-2 mb-10'>
          {message}
        </div>
      </div>
    );
  }
  
export default Notification;
