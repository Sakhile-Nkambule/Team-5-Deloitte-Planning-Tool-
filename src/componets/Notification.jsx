import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { faBell, faTimes } from '@fortawesome/free-solid-svg-icons';

function Notification({ NotificationID, message, description, color, createdAt, Read_, onDelete }) {
    let bgColor = "";
    if (color === "High") bgColor = "bg-red-300";
    if (color === "Mid") bgColor = "bg-yellow-300";
    if (color === "Low") bgColor = "bg-green-300";

    // Initial notification permission state
    let PermissionNotification = false;
    let reason = "";

    // Format the date and time
    const formattedDate = new Date(createdAt).toLocaleString();

    // Define dynamic styling for unread notifications (Read_ === 0)
    const unreadStyles = !Read_ ? ' text-md text-black' : 'font-normal text-sm text-black';
    const unreadContainerStyles = !Read_ ? '' : '';

    // Check for "Reason" in the message and split if necessary
    let position = message.search(/Reason/);
    let messagePart = message;

    if (position !== -1) {
        PermissionNotification = true;
        messagePart = message.substring(0, position).trim();
        reason = message.substring(position + 6).trim(); // Extract the text after "Reason"
    }

    return (
      <div className={`${unreadContainerStyles} mb-10 relative mx-auto w-full max-w-2xl`}>
        <div className={`${bgColor} w-5/6 rounded-t-lg shadow-2xl p-2 text-black font-bold text-xl min-h-120`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faBell} className="pr-2 pl-2" size="1x" />
              {/* Apply dynamic styling based on Read_ status */}
              <span className={unreadStyles}>
                {description}
              </span>
            </div>
            <FontAwesomeIcon 
              icon={faTimes} 
              className="cursor-pointer text-black" 
              onClick={() => onDelete(NotificationID)}
            />
          </div>
        </div>
        <div className={`${unreadContainerStyles} w-5/6 rounded-b-lg shadow-2xl p-2 mb-10`}>
          <div className="text-sm text-gray-600">Created At: {formattedDate}</div>
          <div>
            <span className={unreadStyles}>
              {messagePart}
            </span>
            {PermissionNotification && reason && (
              <div>
                <strong>Reason: </strong>
                <span className={unreadStyles}>{reason}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}

export default Notification;
