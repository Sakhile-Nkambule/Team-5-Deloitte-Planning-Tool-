const express = require("express");
const router = express.Router();
const pool = require("../db");

// Endpoint to get project resources
router.get("/resources/:projectId", async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const [rows] = await pool.query(
        "SELECT * FROM resources WHERE ProjectID = ?",
        [projectId]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json("Error executing query: " + err);
    }
  });

  // Endpoint to get resourceId
  router.get("/resource-id/:userId/:projectId", async (req, res) => {
    const userId = req.params.userId;
    const projectId = req.params.projectId;
  
    try {
      const [rows] = await pool.query(
        `
        SELECT r.ResourceID
        FROM resources r
        WHERE r.UserID = ? AND r.ProjectID = ?
      `,
        [userId, projectId]
      );
  
      if (rows.length > 0) {
        const resourceId = rows[0].ResourceID;
        res.json({ resourceId });
      } else {
        res.status(404).send("Resource not found");
      }
    } catch (err) {
      res.status(500).send("Database error");
    }
  });

  //DELELE

  //Endpoint to delete project resource

  router.delete("/resources/:resourceId", async (req, res) => {
    const resourceId = req.params.resourceId;
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
      await connection.beginTransaction();
  
      try {
        // Prepare and execute the SQL query to delete the resource
        const [result] = await connection.query('DELETE FROM resources WHERE ResourceID = ?', [resourceId]);
  
        // Commit the transaction
        await connection.commit();
  
        // Check if any rows were affected (resource was found and deleted)
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Resource not found" });
        }
  
        // Send success response
        res.json({ message: "Resource deleted successfully" });
      } catch (err) {
        // Rollback the transaction in case of an error
        await connection.rollback();
        console.error("Error deleting resource:", err);
        res.status(500).json({ error: "Error deleting resource: " + err });
      } finally {
        // Release the connection back to the pool
        connection.release();
      }
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).send("Database error: " + err);
    }
  });
  
  module.exports = router;