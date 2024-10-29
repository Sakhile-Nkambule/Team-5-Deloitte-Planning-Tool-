const express = require("express");
const router = express.Router();
const pool = require("../db");

//GET

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
// UPDATE workedHours and proficiency for a user's skillset
router.put("/skillsets/:skillsetId", async (req, res) => {
  const SkillID = req.params.skillsetId;
  const { workedHours, proficiency } = req.body;
  console.log("SkillID is: ", SkillID);
  console.log("worked hours is: ", workedHours);
  console.log("Request Body:", req.body); // Log the request body

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
  const { skills } = req.body; // Expecting skills to be an object with skill names and proficiency values

  try {
    await pool.query("START TRANSACTION"); // Begin transaction

    const skillEntries = Object.entries(skills);

    for (const [skill, proficiency] of skillEntries) {
      // Calculate worked hours based on proficiency
      let workedHours = 0;

      if (proficiency >= 10 && proficiency < 20) workedHours = 80;
      else if (proficiency >= 20 && proficiency < 30) workedHours = 160;
      else if (proficiency >= 30 && proficiency < 40) workedHours = 240;
      else if (proficiency >= 40 && proficiency < 50) workedHours = 320;
      else if (proficiency >= 50 && proficiency < 60) workedHours = 400;
      else if (proficiency >= 60 && proficiency < 70) workedHours = 480;
      else if (proficiency >= 70 && proficiency < 80) workedHours = 560;
      else if (proficiency >= 80 && proficiency < 90) workedHours = 640;
      else if (proficiency >= 90 && proficiency < 100) workedHours = 720;
      else if (proficiency >= 100) workedHours = 800;

      // Update existing skillset conditionally based on workedHours
      const [updateResult] = await pool.query(
        `
        UPDATE Skillsets 
        SET 
          WorkedHours = CASE WHEN WorkedHours = 0 THEN ? ELSE WorkedHours END, 
          Proficiency = ? 
        WHERE UserID = ? AND Skillset = ?
        `,
        [workedHours, proficiency, userId, skill]
      );

      // If no rows were affected by the update, insert a new skillset
      if (updateResult.affectedRows === 0) {
        await pool.query(
          `
          INSERT INTO Skillsets (UserID, Skillset, WorkedHours, Proficiency)
          VALUES (?, ?, ?, ?)
          `,
          [userId, skill, workedHours, proficiency]
        );
      }
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
