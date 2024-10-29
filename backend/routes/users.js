const express = require("express");
const router = express.Router();
const pool = require("../db");

//GET

// Endpoint to get all users
router.get("/api/users", async (req, res) => {
  try {
    const limit = parseInt(req.query._limit) || 100;
    const [rows] = await pool.query("SELECT * FROM users LIMIT ?", [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

// Endpoint to get a single user
router.get("/api/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await pool.query("SELECT * FROM users WHERE UserID = ?", [
      userId,
    ]);
    if (rows.length === 0) return res.status(404).json("User not found");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

//POST

// Endpoint for login
router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await pool.getConnection();

    // Fetch user details
    const [userResult] = await connection.execute(
      `
        SELECT * FROM users 
        WHERE email = ? AND password = ?
      `,
      [email, password]
    );

    if (userResult.length > 0) {
      // User found
      const user = userResult[0];

      // Fetch user notifications
      const [notificationsResult] = await connection.execute(
        `
          SELECT * FROM notifications 
          WHERE UserID = ?
        `,
        [user.UserID]
      );

      // Structure the response
      res.json({
        id: user.UserID,
        name: user.UserName,
        email: user.Email,
        role: user.Role,
        rate: user.HourlyRate,
        notifications: notificationsResult, // Include notifications in the response
      });
    } else {
      // User not found
      res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Database error");
  }
});

// Registration
router.post("/api/register", async (req, res) => {
  const { username, email, role, password } = req.body;

  if (!username || !email || !role || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let HourlyRate;

  // Using a switch statement to determine the hourly rate based on role
  switch (role) {
    case "Director":
      HourlyRate = 250;
      break;
    case "Associate Director":
      HourlyRate = 200;
      break;
    case "Snr Associate Director":
      HourlyRate = 220;
      break;
    case "Manager":
      HourlyRate = 160;
      break;
    case "Snr Manager":
      HourlyRate = 180;
      break;
    case "Jnr Manager":
      HourlyRate = 150;
      break;
    case "Consultant":
      HourlyRate = 90;
      break;
    case "Jnr Consultant":
      HourlyRate = 75;
      break;
    case "Snr Consultant":
      HourlyRate = 100;
      break;
    default:
      HourlyRate = 0;
  }

  // Insert the user data including the hourly rate
  const query =
    "INSERT INTO users (UserName, Email, Role, Password, HourlyRate) VALUES (?, ?, ?, ?, ?)";

  pool.query(
    query,
    [username, email, role, password, HourlyRate],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to register user" });
      }
      res.status(201).json({ message: "User registered successfully" });
    }
  );
  console.log(HourlyRate);
});

//UPDATE
// Endpoint to update a user
router.put("/api/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, hourlyRate } = req.body;

    // Update the user in the database
    const [result] = await pool.query(
      "UPDATE users SET UserName = ?, Email = ?, Role = ?, HourlyRate = ? WHERE UserID = ?",
      [name, email, role, hourlyRate, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json("User not found");
    }

    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

//DELETE

// DELETE user by ID
// Delete a user and related entries from projects, resources, tasks, skillsets, and notifications
router.delete("/api/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete skillsets associated with the user (this needs to be done first due to foreign key constraints)
      await connection.query("DELETE FROM Skillsets WHERE UserID = ?", [
        userId,
      ]);

      // Delete tasks associated with the user
      await connection.query(
        `DELETE FROM tasks WHERE ResourceID IN (SELECT ResourceID FROM resources WHERE UserID = ?)`,
        [userId]
      );

      // Delete resources associated with the user
      await connection.query("DELETE FROM resources WHERE UserID = ?", [
        userId,
      ]);

      // Delete notifications associated with the user
      await connection.query("DELETE FROM notifications WHERE UserID = ?", [
        userId,
      ]);

      // Finally, delete the user
      await connection.query("DELETE FROM users WHERE UserID = ?", [userId]);

      // Commit the transaction
      await connection.commit();
      res.status(204).send(); // Success - No Content
    } catch (err) {
      // Rollback if any of the above queries fail
      await connection.rollback();
      res.status(500).send("Error deleting user: " + err);
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  } catch (err) {
    res.status(500).send("Database error: " + err);
  }
});

module.exports = router;
