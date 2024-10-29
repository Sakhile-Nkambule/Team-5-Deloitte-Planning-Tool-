const express = require("express");
const router = express.Router();
const pool = require("../db");

// Endpoint to get notifications for a given resourceId
router.get("/notifications/:userID", async (req, res) => {
  const UserID = req.params.userID;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE UserID = ? ORDER BY NotificationID DESC",
      [UserID]
    );
    if (rows.length === 0)
      return res
        .status(404)
        .send({ message: "No notifications found for this resource." });
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send({ message: "Server error occurred" });
  }
});

//Endpoint to create a new notification
router.post("/notifications", async (req, res) => {
  const { UserID, Message, Type, Priority } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO Deloitte.notifications (UserID, Message, Type, CreatedAt, Read_, Priority) VALUES (?, ?, ?, NOW(), 0, ?)",
      [UserID, Message, Type, Priority]
    );

    if (result.affectedRows === 1) {
      res.status(201).send({ message: "Notification created successfully" });
    } else {
      res.status(400).send({ message: "Failed to create notification" });
    }
  } catch (err) {
    res.status(500).send({ message: "Server error occurred" });
  }
});
//
// Endpoint to mark notifications as read
router.post("/notifications/markAsRead", async (req, res) => {
  const { notifications } = req.body;

  try {
    // Create a placeholder string for the SQL query
    const ids = notifications.map((n) => n.NotificationID);
    const placeholders = ids.map(() => "?").join(", ");

    // Update notifications where NotificationID is in the array
    const query = `
          UPDATE notifications
          SET Read_ = 1
          WHERE NotificationID IN (${placeholders})
      `;

    await pool.query(query, ids);

    res.status(200).json({ message: "Notifications marked as read." });
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//end point to delete a notification
router.delete("/notifications/:id", async (req, res) => {
  const NotificationID = req.params.id;

  try {
    const [result] = await pool.query(
      "DELETE FROM notifications WHERE NotificationID = ?",
      [NotificationID]
    );

    if (result.affectedRows === 1) {
      res.status(204).send();
    } else {
      res.status(404).send({ message: "Notification not found" });
    }
  } catch (err) {
    res.status(500).send({ message: "Server error occurred" });
  }
});

module.exports = router;
