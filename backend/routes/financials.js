const express = require("express");
const router = express.Router();
const pool = require("../db");

//GET

// Endpoint to get project financials
router.get("/financials/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const [rows] = await pool.query(
      "SELECT * FROM financials WHERE ProjectID = ?",
      [projectId]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

module.exports = router;
