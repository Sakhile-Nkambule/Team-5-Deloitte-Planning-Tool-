import React, { useState, useEffect } from "react";
import Notification from '../componets/Notification';
import { useUser } from '../componets/UserContext';
import { toast } from "react-toastify";

function NotificationsPage() {
    const [highPriorityNotifications, setHighPriority] = useState([]);
    const [midPriorityNotifications, setMidPriority] = useState([]);
    const [lowPriorityNotifications, setLowPriority] = useState([]);
    const [filter, setFilter] = useState("Unread");
    const [visibleCount, setVisibleCount] = useState(5);
    const { user, setUser } = useUser();

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

    useEffect(() => {
        if (user) {
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
        }

        return () => {
            markAsRead();
        };
    }, [user]);

    const deleteNotification = async (NotificationID) => {
        try {
            const response = await fetch(`http://localhost:8081/notifications/${NotificationID}`, {
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

    const filterNotifications = (notifications) => {
        switch (filter) {
            case "Read":
                return notifications.filter(notification => notification.Read_);
            case "Unread":
                return notifications.filter(notification => !notification.Read_);
            case "All":
            default:
                return notifications;
        }
    };

    const noNotifications = () => {
        const allFiltered = [
            ...filterNotifications(highPriorityNotifications),
            ...filterNotifications(midPriorityNotifications),
            ...filterNotifications(lowPriorityNotifications),
        ];
        return allFiltered.length === 0;
    };

    // Function to load more notifications
    const loadMoreNotifications = () => {
        setVisibleCount(prevCount => prevCount + 5);
    };

    // Function to show fewer notifications
    const showLessNotifications = () => {
        setVisibleCount(5);
    };

    return (
        <div className="min-h-screen bg-lime-100 py-4 px-4 flex justify-center">
            <div className="bg-white px-6 py-8 shadow-md rounded-md border m-2 md:m-0 w-full max-w-4xl">
                <h3 className="p-4 bg-black text-center text-white text-2xl font-semibold rounded-t-lg">
                    Notifications
                </h3>
                <div className="flex space-x-4 mt-2 justify-center">
                    {["All", "Read", "Unread"].map((type) => (  
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 text-sm font-medium ${
                                filter === type ? "bg-black text-white" : "bg-lime-100 text-black hover:bg-lime-300 hover:shadow-lg transform hover:scale-105 transition-all"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="border-b border-gray-300 my-4"></div>
                <div className="pt-4">
                    {noNotifications() ? (
                        <p className="text-center text-gray-500">
                            No {filter} Notifications
                        </p>
                    ) : (
                        <>
                            {filterNotifications(highPriorityNotifications)
                                .slice(0, visibleCount)
                                .map(notification => (
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
                            {filterNotifications(midPriorityNotifications)
                                .slice(0, visibleCount)
                                .map(notification => (
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
                            {filterNotifications(lowPriorityNotifications)
                                .slice(0, visibleCount)
                                .map(notification => (
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
                            <div className="flex justify-center mt-4">
                                {visibleCount < filterNotifications(highPriorityNotifications).length + filterNotifications(midPriorityNotifications).length + filterNotifications(lowPriorityNotifications).length && (
                                    <button
                                        onClick={loadMoreNotifications}
                                        className="px-4 py-2 text-sm font-medium bg-lime-100 text-black border rounded-lg mr-2"
                                    >
                                        Show More
                                    </button>
                                )}
                                {visibleCount > 5 && (
                                    <button
                                        onClick={showLessNotifications}
                                        className="px-4 py-2 text-sm font-medium bg-lime-100 text-black border rounded-lg"
                                    >
                                        Show Less
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationsPage;
