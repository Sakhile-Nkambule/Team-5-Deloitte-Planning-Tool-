const express = require("express");
const router = express.Router();
const pool = require("../db");


//GET

// Endpoint to get all users
router.get("/users", async (req, res) => {
    try {
      const limit = parseInt(req.query._limit) || 100;
      const [rows] = await pool.query("SELECT * FROM users LIMIT ?", [limit]);
      res.json(rows);
    } catch (err) {
      res.status(500).json("Error executing query: " + err);
    }
  });
  
  // Endpoint to get a single user
  router.get("/user/:id", async (req, res) => {
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
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const connection = await pool.getConnection();
  
      const [result] = await connection.execute(
        `
        SELECT * FROM users 
        WHERE email = ? AND password = ?
      `,
        [email, password]
      );
  
      if (result.length > 0) {
        // User found
        const user = result[0];
        res.json({
          id: user.UserID,
          name: user.UserName,
          email: user.Email,
          role: user.Role,
          rate: user.HourlyRate,
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

  //registration
  router.post("/register", async (req, res) => {
    const { username, email, role, password } = req.body;
  
    if (!username || !email || !role || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    const query =
      "INSERT INTO users (UserName, Email, Role, Password) VALUES (?, ?, ?, ?)";
  
    pool.query(query, [username, email, role, password], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to register user" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  });

  module.exports = router;