const express = require("express");
const router = express.Router();
const pool = require("../db");

// Endpoint to get the company associated with a project
router.get("/api/company/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const [rows] = await pool.query(
      `
        SELECT c.* FROM clients c
        JOIN projects p ON p.ClientID = c.ClientID
        WHERE p.ProjectID = ?
      `,
      [projectId]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});
module.exports = router;
