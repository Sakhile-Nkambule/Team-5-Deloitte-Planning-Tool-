import React, { useState, useEffect } from "react";
import Notification from '../componets/Notification';
import { useUser } from '../componets/UserContext';
import { toast } from "react-toastify";
import { data } from "autoprefixer";

function NotificationsPage() {
    const [highPriorityNotifications, setHighPriority] = useState([]);
    const [midPriorityNotifications, setMidPriority] = useState([]);
    const [lowPriorityNotifications, setLowPriority] = useState([]);
    const { user, setUser } = useUser();

    // Function to mark notifications as read and update on the backend
    const markAsRead = async () => {
        if (user && user.notifications) {
            const updatedNotifications = user.notifications.map(notification => ({
                ...notification,
                Read_: true
            }));

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/markAsRead`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ notifications: updatedNotifications })
                });

                if (!response.ok) {
                    throw new Error('Failed to update notifications on the server');
                }

                setUser({ ...user, notifications: updatedNotifications });
                toast.info("All notifications marked as read.");
            } catch (error) {
                console.error("Error updating notifications:", error);
            }
        }
    };

    // Fetch notifications on mount
    useEffect(() => {
        if (user) {
            console.log(`Fetching notifications for user: ${user.id}`);
            fetch(`${import.meta.env.VITE_API_URL}/notifications/${user.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
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
            console.log('User ID is missing:', user);
        }

        

        // Mark notifications as read when the user leaves the page (component unmount)
        return () => {
            markAsRead();
        };
    }, [user]);

    const deleteNotification = async (NotificationID) => {
        try {
            const response = await fetch(`http://localhost:8081notifications/${NotificationID}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error(`Error deleting notification:`, error);
        }
    };

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
                <div className="pt-4 pl-4 pr-4 pb-2 rounded-b-lg">
                    {highPriorityNotifications.map(notification => (
                        <Notification
                            key={notification.NotificationID}
                            NotificationID={notification.NotificationID}
                            message={notification.Message}
                            description={notification.Priority}
                            color="High"
                            createdAt={notification.CreatedAt}
                            Read_={notification.Read_}
                            onDelete={onDelete}
                        />
                    ))}
                    {midPriorityNotifications.map(notification => (
                        <Notification
                            key={notification.NotificationID}
                            NotificationID={notification.NotificationID}
                            message={notification.Message}
                            description={notification.Priority}
                            color="Mid"
                            createdAt={notification.CreatedAt}
                            Read_={notification.Read_}
                            onDelete={onDelete}
                        />
                    ))}
                    {lowPriorityNotifications.map(notification => (
                        <Notification
                            key={notification.NotificationID}
                            NotificationID={notification.NotificationID}
                            message={notification.Message}
                            description={notification.Priority}
                            color="Low"
                            createdAt={notification.CreatedAt}
                            Read_={notification.Read_}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NotificationsPage;
