import React, { useState, useEffect } from "react";
import Notification from '../componets/Notification'
// import { useParams } from "react-router-dom";
import {useUser} from '../componets/UserContext';


function NotificationsPage() {
  // const { resourceId } = useParams();
  const [highPriorityNotifications, setHighPriority] = useState([]);
  const [midPriorityNotifications, setMidPriority] = useState([]);
  const [lowPriorityNotifications, setLowPriority] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
        console.log(`Fetching notifications for user: ${user.id}`);
        fetch(`/api/notifications/${user.id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => { // Previously (json) -> Now use (data) since it's directly an array
                console.log('Fetched notifications:', data);
                const highPriorityNotifications = data.filter(notification => notification.Priority === "High");
                const midPriorityNotifications = data.filter(notification => notification.Priority === "Mid");
                const lowPriorityNotifications = data.filter(notification => notification.Priority === "Low");

                setHighPriority(highPriorityNotifications);
                setMidPriority(midPriorityNotifications);
                setLowPriority(lowPriorityNotifications);
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
            });
    } else {
        console.log('Resource ID is missing:', user);
    }
}, [user]);

  return (
    <div className="h-screen">
      <div className="bg-gray-white justify-center rounded-md pt-10 pl-20 pr-20">
        <h3 className="p-4 bg-black text-center text-white text-2xl font-semibold rounded-t-lg sticky top-0">
          Notifications
        </h3>
        <div className="pt-4 pl-4 pr-4 pb-4 bg-gray-100  rounded-b-lg">
          {highPriorityNotifications.map(notification => (
            <Notification key={notification.NotificationID} message={notification.Message} description={notification.Priority} color="High" />
          ))}
          {midPriorityNotifications.map(notification => (
            <Notification key={notification.NotificationID} message={notification.Message} description={notification.Priority} color="Mid" />
          ))}
          {lowPriorityNotifications.map(notification => (
            <Notification key={notification.NotificationID} message={notification.Message} description={notification.Priority} color="Low" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;

