const express = require("express");
const router = express.Router();
const pool = require("../db");

//GET

// GET: Endpoint to Get tasks for a resource (user assigned to a certain project)
router.get("/tasks/:resourceId", async (req, res) => {
  try {
    const resourceId = req.params.resourceId;
    const [rows] = await pool.query(
      `
      SELECT r.ResourceID, r.UserID, r.Role, r.PlannedHours, r.ProjectID, 
             t.TaskID, t.Description AS TaskDescription, t.Status, t.DueDate, t.Hours, t.SystemRequired, t.StartDate
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
      SELECT t.TaskID, t.UserID, t.ResourceID, t.Description, t.Status, t.Hours, t.DueDate, t.SystemRequired, t.StartDate
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
      SELECT t.TaskID, t.ProjectID, t.ResourceID, t.Description, t.Status, t.Hours, t.DueDate, t.SystemRequired, t.StartDate
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


  //POST

  // POST: Endpoint to Add tasks
router.post("/tasks", async (req, res) => {
  const newTasks = req.body; // Assuming body is an array of new tasks

  console.log("Request body:", req.body);

  // Validate and filter the input to ensure it does not contain TaskID
  const filteredTasks = newTasks.map((task) => ({
    ResourceID: task.ResourceID,
    Description: task.Description,
    Status: task.Status,
    Hours: task.Hours,
    DueDate: task.DueDate,
    SystemRequired: task.SystemRequired,
    StartDate: task.StartDate,
    UserID: task.UserID,
    ProjectID: task.ProjectID,
  }));

  const tasksSql = `
        INSERT INTO tasks (ResourceID, Description, Status, Hours, DueDate, SystemRequired, StartDate, UserID, ProjectID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const task of filteredTasks) {
        await connection.execute(tasksSql, [
          task.ResourceID,
          task.Description,
          task.Status,
          task.Hours,
          task.DueDate,
          task.SystemRequired,
          task.StartDate,
          task.UserID,
          task.ProjectID,
        ]);
      }

      await connection.commit();
      res.json({ message: "Tasks added successfully" });
    } catch (err) {
      await connection.rollback();
      console.error("Error inserting tasks:", err);
      res.status(500).json({ error: "Error inserting tasks: " + err });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error connecting to the database:", err);
    res.status(500).json({ error: "Error connecting to the database: " + err });
  }
});

  
//UPDATE

 // PUT: Endpoint to Update tasks
router.put("/tasks/:resourceId", async (req, res) => {
  const resourceId = req.params.resourceId;
  const tasks = req.body; // Assuming body is an array of tasks

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Validate if the ResourceID exists in the resources table
      const [validateResult] = await connection.execute(
        `
        SELECT * FROM resources WHERE ResourceID = ?
      `,
        [resourceId]
      );

      if (validateResult.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "ResourceID does not exist" });
      }

      // Loop through each task and update or insert
      for (const task of tasks) {
        if (task.TaskID) {
          // Check if the task exists
          const [existingTask] = await connection.execute(
            `
            SELECT * FROM tasks WHERE TaskID = ? AND ResourceID = ?
          `,
            [task.TaskID, resourceId]
          );

          if (existingTask.length > 0) {
            // Update existing task
            await connection.execute(
              `
              UPDATE tasks 
              SET Description = ?, Status = ?, Hours = ?, DueDate = ?, SystemRequired = ?, StartDate = ?, UserID = ?, ProjectID = ?
              WHERE TaskID = ? AND ResourceID = ?
            `,
              [
                
                task.Description,
                task.Status,
                task.Hours,
                task.DueDate,
                task.SystemRequired,
                task.StartDate,
                task.TaskID,
                task.ProjectID,
                task.UserID,
                resourceId,
              ]
            );
          } else {
            // If TaskID is provided but doesn't match an existing task, return an error
            return res
              .status(400)
              .json({
                error: `Task with TaskID ${task.TaskID} does not exist for this ResourceID`,
              });
          }
        } else {
          // Insert new task
          await connection.execute(
            `
            INSERT INTO tasks (ResourceID, Description, Status, Hours, DueDate, SystemRequirement, StartDate, UserID, ProjectID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
            [resourceId, task.Description, task.Status, task.Hours, task.DueDate, task.SystemRequirement, task.StartDate, tasks.UserID, task.ProjectID]
          );
        }
      }

      await connection.commit();
      res.json({ message: "Tasks updated successfully" });
    } catch (err) {
      await connection.rollback();
      console.error("Error updating tasks:", err);
      res.status(500).json({ error: "Error updating tasks: " + err });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error connecting to the database:", err);
    res.status(500).json({ error: "Error connecting to the database: " + err });
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