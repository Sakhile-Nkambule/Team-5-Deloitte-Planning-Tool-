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

    // If no skillsets are found, return an empty response with 204 (No Content)
    if (rows.length === 0) {
      return res.status(204).send();
    }

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

    const skillEntries = Object.entries(skills);
    
    for (const [skill, proficiency] of skillEntries) {
      // Update existing skillset or insert new if not exists
      await pool.query(
        `
        INSERT INTO Skillsets (UserID, Skillset, Proficiency)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE Proficiency = ?
        `,
        [userId, skill, proficiency, proficiency]
      );
    }

    await pool.query("COMMIT"); // Commit transaction

    res.status(200).json({ message: "Skills updated successfully" });
  } catch (err) {
    await pool.query("ROLLBACK"); // Rollback transaction on error
    console.error("Transaction error:", err);
    res.status(500).json("Error executing query: " + err);
  }
});

  

  module.exports = router;