const express = require("express");
const router = express.Router();
const pool = require("../db");
const { parseISO, format } = require("date-fns");

//GET

// GET: Endpoint to Get tasks for a resource (user assigned to a certain project)
router.get("/tasks/:resourceId", async (req, res) => {
  try {
    const resourceId = req.params.resourceId;
    const [rows] = await pool.query(
      `
      SELECT r.ResourceID, r.UserID, r.Role, r.PlannedHours, r.WorkedHours, r.ProjectID, 
             t.TaskID, t.Description AS TaskDescription, t.Status, t.DueDate, t.Hours, t.SystemRequired, t.StartDate, t.Priority, t.completed
      FROM resources r
      LEFT JOIN tasks t ON r.ResourceID = t.ResourceID
      WHERE r.ResourceID = ?
    `,
      [resourceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const resource = {
      ResourceID: rows[0].ResourceID,
      UserID: rows[0].UserID,
      Role: rows[0].Role,
      PlannedHours: rows[0].PlannedHours,
      WorkedHours: rows[0].WorkedHours,
      ProjectID: rows[0].ProjectID,
      Tasks: rows
        .filter((row) => row.TaskID !== null)
        .map((row) => ({
          TaskID: row.TaskID,
          Description: row.TaskDescription,
          SystemRequired: row.SystemRequired,
          Status: row.Status,
          Hours: row.Hours,
          StartDate: row.StartDate,
          DueDate: row.DueDate,
          ProjectID: row.ProjectID,
          UserID: row.UserID,
          Priority: row.Priority,
          completed: row.completed,
        })),
    };

    res.json(resource);
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "Error executing query" });
  }
});

// GET: Endpoint to Get all tasks for a project
router.get("/tasks/project/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const [rows] = await pool.query(
      `
      SELECT t.TaskID, t.UserID, t.ResourceID, t.Description, t.Status, t.Hours, t.DueDate, t.SystemRequired, t.StartDate, t.Priority, t.completed
      FROM tasks t
      JOIN resources r ON t.ResourceID = r.ResourceID
      WHERE r.ProjectID = ?
    `,
      [projectId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching tasks for project:", err);
    res.status(500).json({ error: "Error fetching tasks for project" });
  }
});

// GET: Endpoint to Get all tasks for a user
router.get("/tasks/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(
      `
      SELECT t.TaskID, t.UserID, t.ResourceID, t.Description, t.Status, t.Hours, t.DueDate, t.SystemRequired, t.StartDate, t.Priority, t.completed
      FROM tasks t
      JOIN resources r ON t.ResourceID = r.ResourceID
      WHERE r.UserID = ?
    `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching tasks for user:", err);
    res.status(500).json({ error: "Error fetching tasks for user" });
  }
});


// Endpoint to update a project
router.put("/projects/:id", async (req, res) => {
  const projectId = req.params.id;
  const {
    ProjectCode,
    Title,
    Description,
    Budget,
    Status,
    Client,
    resources,
    StartDate,
    EndDate,
    financials,
  } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Convert StartDate and EndDate to local time and format
      const localStartDate = new Date(StartDate); // Converts to local timezone date
      const localEndDate = new Date(EndDate); // Converts to local timezone date
      
      // Format dates back to 'YYYY-MM-DD'
      const formattedStartDate = format(localStartDate, "yyyy-MM-dd");
      const formattedEndDate = format(localEndDate, "yyyy-MM-dd");

      // Update project data
      await connection.query(
        `
          UPDATE projects 
          SET ProjectCode = ?, Title = ?, Description = ?, Budget = ?, Status = ?, StartDate = ?, EndDate = ?
          WHERE ProjectID = ?
        `,
        [
          ProjectCode,
          Title,
          Description,
          Budget,
          Status,
          formattedStartDate, // Use the formatted local start date
          formattedEndDate, // Use the formatted local end date
          projectId,
        ]
      );

      // Update client data
      await connection.query(
        `
          UPDATE clients 
          SET CompanyName = ?, CompanyDescription = ?, ContactEmail = ?, ContactPhone = ?, CompanyLocation = ?
          WHERE ClientID = (SELECT ClientID FROM projects WHERE ProjectID = ?)
        `,
        [
          Client.CompanyName,
          Client.CompanyDescription,
          Client.ContactEmail,
          Client.ContactPhone,
          Client.CompanyLocation,
          projectId,
        ]
      );

      // Update financials
      await connection.query(
        `
          UPDATE financials 
          SET 
            ProjectID = ?, 
            GrossRevenue = ?, 
            NetRevenue = ?, 
            RecoveryRate = ?, 
            ProfitMargin = ? 
          WHERE 
            FinancialID = ? AND ProjectID = ?
        `,
        [
          projectId, // 1. ProjectID
          financials.Budget, // 2. GrossRevenue (you may want to use exhaustedBudget instead)
          financials.netRevenue, // 3. NetRevenue
          financials.recoveryRate, // 4. RecoveryRate
          financials.profitMargin, // 5. ProfitMargin
          financials.FinancialID, // 6. FinancialID
          projectId, // 7. ProjectID for the WHERE clause
        ]
      );

      // Update existing resources and insert new resources if they don't exist
      for (const resource of resources) {
        if (resource.ResourceID) {
          // Update existing resource
          await connection.query(
            `
              UPDATE resources 
              SET Role = ?, PlannedHours = ?
              WHERE ResourceID = ? AND ProjectID = ?
            `,
            [
              resource.Role,
              resource.PlannedHours,
              resource.ResourceID,
              projectId,
            ]
          );
        } else {
          // Insert new resource
          await connection.query(
            `
              INSERT INTO resources (ProjectID, UserID, Role, PlannedHours) 
              VALUES (?, ?, ?, ?)
            `,
            [projectId, resource.UserID, resource.Role, resource.PlannedHours]
          );
        }
      }

      await connection.commit();
      res.json({
        message: "Project, client, and resources updated successfully",
      });
    } catch (err) {
      await connection.rollback();
      console.error("Error updating project:", err);
      res.status(500).json({ error: "Error updating project: " + err });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error connecting to the database:", err);
    res.status(500).json({ error: "Error connecting to the database: " + err });
  }
});

// PUT: Endpoint to update the completion status of a task
router.put("/tasks/completed/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const { completed } = req.body

  if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "Completed status must be a boolean" });
  }

  let connection; // Declare connection here to ensure it can be released later
  try {
    connection = await pool.getConnection();

    // Validate if the TaskID exists in the tasks table
    const [existingTask] = await connection.execute(
      `SELECT * FROM tasks WHERE TaskID = ?`,
      [taskId]
    );

    if (existingTask.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update the task's completed status
    await connection.execute(
      `UPDATE tasks SET completed = ? WHERE TaskID = ?`,
      [completed, taskId]
    );

    res.json({ message: "Task completion status updated successfully" });
  } catch (err) {
    console.error("Error updating task completion status:", err);
    res.status(500).json({ error: "Error updating task completion status: " + err });
  } finally {
    if (connection) connection.release(); // Only release connection if it was successfully acquired
  }
});
 

//DELETE

// DELETE: Endpoint to Delete a Task
router.delete("/task/:taskId", async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        "DELETE FROM tasks WHERE TaskID = ?",
        [taskId]
      );

      await connection.commit();

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      await connection.rollback();
      console.error("Error deleting task:", err);
      res.status(500).json({ error: "Error deleting task: " + err });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Database error: " + err);
  }
});

module.exports = router;
