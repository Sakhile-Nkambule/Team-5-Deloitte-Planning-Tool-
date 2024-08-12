import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';

function Notification({ message, description, color }) {
    let bgColor = "";
    if (color === "High") bgColor = "bg-red-300";
    if (color === "Mid") bgColor = "bg-yellow-300";
    if (color === "Low") bgColor = "bg-green-300";
  
    return (
      <div className='mb-20'>
        <div className={`${bgColor} rounded-t-lg shadow-2xl p-2 text-black font-bold text-xl  min-h-120`}>
            <FontAwesomeIcon icon={faBell} className="pr-2 pl-2" size="1x" />
        {description}
        </div>
        <div className='bg-white rounded-b-lg shadow-2xl p-2 mb-10'>
        {message}
        </div>
      </div>
    );
  }
  
  export default Notification;