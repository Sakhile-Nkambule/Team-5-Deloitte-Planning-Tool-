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

//POST

// POST: Endpoint to Add tasks
router.post("/tasks", async (req, res) => {
  const newTasks = req.body;

  // Modify the DueDate to ensure the correct local date is stored
  const filteredTasks = newTasks.map((task) => {
    const localDueDate = new Date(task.DueDate); // Converts to local timezone date
    return {
      ...task,
      DueDate: format(localDueDate, "yyyy-MM-dd"), // Format date back to 'YYYY-MM-DD'
    };
  });

  const tasksSql = `
      INSERT INTO tasks (ResourceID, Description, Status, Hours, DueDate, SystemRequired, StartDate, UserID, ProjectID, Priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          task.Priority,
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
        `SELECT * FROM resources WHERE ResourceID = ?`,
        [resourceId]
      );

      if (validateResult.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "ResourceID does not exist" });
      }

      // Adjust tasks DueDate to local timezone before updating/inserting
      const adjustedTasks = tasks.map((task) => {
        const localDueDate = new Date(task.DueDate); // Convert UTC to local timezone
        return {
          ...task,
          DueDate: format(localDueDate, "yyyy-MM-dd"), // Format to 'YYYY-MM-DD'
        };
      });

      // Loop through each task and update or insert
      for (const task of adjustedTasks) {
        if (task.TaskID) {
          // Check if the task exists
          const [existingTask] = await connection.execute(
            `SELECT * FROM tasks WHERE TaskID = ? AND ResourceID = ?`,
            [task.TaskID, resourceId]
          );

          if (existingTask.length > 0) {
            // Update existing task
            await connection.execute(
              `
              UPDATE tasks 
              SET Description = ?, Status = ?, Hours = ?, DueDate = ?, SystemRequired = ?, StartDate = ?, UserID = ?, ProjectID = ?, Priority = ?
              WHERE TaskID = ? AND ResourceID = ?
              `,
              [
                task.Description,
                task.Status,
                task.Hours,
                task.DueDate, 
                task.SystemRequired,
                task.StartDate,
                task.UserID,
                task.ProjectID,
                task.Priority,
                task.TaskID,
                resourceId,
              ]
            );

            
          } else {
            // If TaskID is provided but doesn't match an existing task, return an error
            return res.status(400).json({
              error: `Task with TaskID ${task.TaskID} does not exist for this ResourceID`,
            });
          }
        } else {
          // Insert new task
          await connection.execute(
            `
            INSERT INTO tasks (ResourceID, Description, Status, Hours, DueDate, SystemRequirement, StartDate, UserID, ProjectID, Priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              resourceId,
              task.Description,
              task.Status,
              task.Hours,
              task.DueDate,
              task.SystemRequirement,
              task.StartDate,
              task.UserID,
              task.ProjectID,
              task.Priority,
            ]
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

// PUT: Endpoint to update the completion status of a task
router.put("/tasks/completed/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const { completed } = req.body;

  if (typeof completed !== "boolean") {
    return res
      .status(400)
      .json({ error: "Completed status must be a boolean" });
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
    res
      .status(500)
      .json({ error: "Error updating task completion status: " + err });
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
