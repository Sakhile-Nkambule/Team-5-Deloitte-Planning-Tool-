import React, { useState, useEffect } from "react";
import Notification from '../componets/Notification'
// import { useParams } from "react-router-dom";
import {useUser} from '../componets/UserContext';
import { toast } from "react-toastify";

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

const deleteNotification = async (NotificationID) => {
  try {
    const response = await fetch(`/api/notifications/${NotificationID}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    console.error(`Error deleting notification:`, error);
  }
}






const onDelete = (NotificationID) => {
  const confirm = window.confirm(
    "Are you sure you want to delete this Notification?"
  );

  if (!confirm) return;

  deleteNotification(NotificationID);

  toast.success("Notification Deleted Successfully");
  updateNotificationListings(NotificationID);


};
const updateNotificationListings = (deletedNotificationID) => {
  setHighPriority(prevNotifications => prevNotifications.filter(notification => notification.NotificationID !== deletedNotificationID));
  setMidPriority(prevNotifications => prevNotifications.filter(notification => notification.NotificationID !== deletedNotificationID));
  setLowPriority(prevNotifications => prevNotifications.filter(notification => notification.NotificationID !== deletedNotificationID));
};


  return (
    <div className="h-screen">
      <div className="bg-gray-white justify-center rounded-md pt-10 pl-20 pr-20">
        <h3 className="p-4 bg-black text-center text-white text-2xl font-semibold rounded-t-lg rounded-b-lg">
          Notifications
        </h3>
        <div className="pt-4 pl-4 pr-4 pb-2  rounded-b-lg">
          {highPriorityNotifications.map(notification => (
            <Notification key={notification.NotificationID}  NotificationID={notification.NotificationID}  message={notification.Message} description={notification.Priority} color="High" onDelete={onDelete} />
          ))}
          {midPriorityNotifications.map(notification => (
            <Notification key={notification.NotificationID}  NotificationID={notification.NotificationID}  message={notification.Message} description={notification.Priority} color="Mid" onDelete={onDelete} />
          ))}
          {lowPriorityNotifications.map(notification => (
            <Notification key={notification.NotificationID}  NotificationID={notification.NotificationID}  message={notification.Message} description={notification.Priority} color="Low"onDelete={onDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;

