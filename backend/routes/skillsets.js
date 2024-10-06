const express = require("express");
const router = express.Router();
const pool = require("../db");

//GET

// Endpoint to get user skills
// Endpoint to get user skills
router.get("/skillsets/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.query(
      `SELECT Skillset, Proficiency
      FROM Skillsets
      WHERE UserID = ?`,
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

// GET skillset with workedHours for a user
router.get("/skillset/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.query(
      `
      SELECT SkillID, Skillset, Proficiency, workedHours
      FROM Skillsets
      WHERE UserID = ?
    `,
      [userId]
    );

    // If no skillsets are found, return an empty response with 204 (No Content)
    if (rows.length === 0) {
      return res.status(204).send();
    }

    // Transform rows into an object, including SkillID
    const skills = rows.map(
      ({ SkillID, Skillset, Proficiency, workedHours }) => ({
        SkillID: SkillID, // Add this line to include SkillID
        skillset: Skillset,
        proficiency: Proficiency,
        workedHours: workedHours,
      })
    );

    res.json(skills);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

//UPDATE
// Endpoint to update user skills
// UPDATE workedHours and proficiency for a user's skillset
router.put("/skillsets/:skillsetId", async (req, res) => {
  const SkillID = req.params.skillsetId;
  const { workedHours, proficiency } = req.body;
  console.log("SkillID is: ", SkillID);
  console.log("worked hours is: ", workedHours);
  console.log("Request Body:", req.body); // Log the request body
  console.log("Skillset ID from URL:", req.params.skillsetId); // Log the Skillset ID from URL

  try {
    await pool.query(
      `
      UPDATE Skillsets
      SET workedHours = ?, Proficiency = ?
      WHERE SkillID = ?
    `,
      [workedHours, proficiency, SkillID]
    );

    res.status(200).json({ message: "Skillset updated successfully" });
  } catch (err) {
    console.error("Error updating skillset:", err);
    res.status(500).json("Error executing query: " + err);
  }
});

//Endpoint to update all skillsets

router.put("/allskillsets/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { skills } = req.body; // Expecting skills to be an object with skill names and worked hours values

  try {
    await pool.query("START TRANSACTION"); // Begin transaction

    const skillEntries = Object.entries(skills);

    for (const [skill, workedHours] of skillEntries) {
      // Calculate the new proficiency based on the worked hours
      let newProficiency = 0;

      if (workedHours >= 80 && workedHours < 160) newProficiency = 10;
      else if (workedHours >= 160 && workedHours < 240) newProficiency = 20;
      else if (workedHours >= 240 && workedHours < 320) newProficiency = 30;
      else if (workedHours >= 320 && workedHours < 400) newProficiency = 40;
      else if (workedHours >= 400 && workedHours < 480) newProficiency = 50;
      else if (workedHours >= 480 && workedHours < 560) newProficiency = 60;
      else if (workedHours >= 560 && workedHours < 640) newProficiency = 70;
      else if (workedHours >= 640 && workedHours < 720) newProficiency = 80;
      else if (workedHours >= 720 && workedHours < 800) newProficiency = 90;
      else if (workedHours >= 800) newProficiency = 100;

      // Update existing skillset or insert new one if it doesn't exist, including worked hours and proficiency
      await pool.query(
        `
        INSERT INTO Skillsets (UserID, Skillset, WorkedHours, Proficiency)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE workedHours = ?, Proficiency = ?
        `,
        [
          userId,
          skill,
          workedHours,
          newProficiency,
          workedHours,
          newProficiency,
        ]
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
