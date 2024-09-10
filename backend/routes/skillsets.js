const express = require("express");
const router = express.Router();
const pool = require("../db");

//GET

// Endpoint to get user skills
router.get("/skillsets/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
      const [rows] = await pool.query(
        `
        SELECT Skillset, Proficiency
        FROM Skillsets
        WHERE UserID = ?
      `,
        [userId]
      );
  
      if (rows.length === 0)
        return res
          .status(404)
          .json({ message: "No skills found for this user." });
  
      // Transform rows into an object where the skill is the key and proficiency is the value
      const skills = rows.reduce((acc, { Skillset, Proficiency }) => {
        acc[Skillset] = Proficiency;
        return acc;
      }, {});
  
      res.json(skills);
    } catch (err) {
      res.status(500).json("Error executing query: " + err);
    }
  });

  //UPDATE
  
  // Endpoint to update user skills
  router.put("/skillsets/:userId", async (req, res) => {
    const userId = req.params.userId;
    const { skills } = req.body; // Expecting skills to be an object with skill names and proficiency values
  
    try {
      await pool.query("START TRANSACTION"); // Begin transaction
  
      // Delete existing skills for the user
      await pool.query("DELETE FROM Skillsets WHERE UserID = ?", [userId]);
  
      // Insert new skills
      const skillEntries = Object.entries(skills);
      const insertPromises = skillEntries.map(([skill, proficiency]) =>
        pool.query(
          "INSERT INTO Skillsets (UserID, Skillset, Proficiency) VALUES (?, ?, ?)",
          [userId, skill, proficiency]
        )
      );
  
      await Promise.all(insertPromises); // Execute all insert queries
  
      await pool.query("COMMIT"); // Commit transaction
  
      res.status(200).json({ message: "Skills updated successfully" });
    } catch (err) {
      await pool.query("ROLLBACK"); // Rollback transaction on error
      res.status(500).json("Error executing query: " + err);
    }
  });
  

  module.exports = router;