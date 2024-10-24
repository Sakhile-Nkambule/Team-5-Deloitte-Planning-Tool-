const express = require("express");
const router = express.Router();
const pool = require("../db");
const { parseISO, format } = require("date-fns");

//GET

// Endpoints to get all projects
router.get("/projects", async (req, res) => {
  try {
    const limit = parseInt(req.query._limit) || 100;
    const [rows] = await pool.query(
      "SELECT * FROM projects ORDER BY ProjectID DESC LIMIT ?",
      [limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

// Endpoint to get a single project
router.get("/project/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    const [rows] = await pool.query(
      "SELECT * FROM projects WHERE ProjectID = ?",
      [projectId]
    );
    if (rows.length === 0) return res.status(404).json("Project not found");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

//Endpoint to get all projects for a single user

router.get("/user-projects/:userId", async (req, res) => {
  const userId = req.params.userId;
  const limit = parseInt(req.query._limit) || 100; // Set default limit to 100 if not specified

  try {
    const [rows] = await pool.query(
      `
        SELECT p.ProjectID, p.ProjectCode, p.Title, p.Description, p.Budget, p.ClientID, p.Status
        FROM projects p
        JOIN resources r ON p.ProjectID = r.ProjectID
        WHERE r.UserID = ?
        ORDER BY p.ProjectID DESC
        LIMIT ?
      `,
      [userId, limit] // Pass the limit parameter to the query
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

//POSTS
// Endpoint to add a new project
router.post("/newprojects", async (req, res) => {
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
      // Insert client data
      const [clientResult] = await connection.query(
        `
          INSERT INTO clients (CompanyName, CompanyDescription, ContactEmail, ContactPhone, CompanyLocation) 
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          Client.CompanyName,
          Client.CompanyDescription,
          Client.ContactEmail,
          Client.ContactPhone,
          Client.CompanyLocation,
        ]
      );

      const clientId = clientResult.insertId;

      // Insert project data
      const [projectResult] = await connection.query(
        `
          INSERT INTO projects (ProjectCode, Title, Description, Budget, ClientID, Status, StartDate, EndDate) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          ProjectCode,
          Title,
          Description,
          Budget,
          clientId,
          Status,
          StartDate,
          EndDate,
        ]
      );

      const projectId = projectResult.insertId;

      // Insert resources data
      const insertResourceQuery = `
          INSERT INTO resources (ProjectID, UserID, Role, PlannedHours) 
          VALUES (?, ?, ?, ?)
        `;

      for (const resource of resources) {
        await connection.query(insertResourceQuery, [
          projectId,
          resource.UserID,
          resource.Role,
          resource.hours,
        ]);
      }
      // Handle financials as an object
      if (financials && typeof financials === "object") {
        const insertFinancialsQuery = `
        INSERT INTO financials (ProjectID, GrossRevenue, NetRevenue, RecoveryRate, ProfitMargin) 
        VALUES (?, ?, ?, ?, ?)
      `;

        await connection.query(insertFinancialsQuery, [
          projectId,
          financials.Budget, //financials.exhaustedBudget, // Assuming exhaustedBudget as GrossRevenue (based on naming context)
          financials.netRevenue,
          financials.recoveryRate,
          financials.profitMargin,
        ]);
      } else {
        throw new Error("Financials data is not correctly formatted.");
      }

      await connection.commit();
      res.json({
        message: "Project, client, and resources added successfully",
      });
    } catch (err) {
      await connection.rollback();
      res.status(500).json("Error adding project: " + err);
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json("Error connecting to the database: " + err);
  }
});

//UPDATE

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
          financials.Budget, // 2. GrossRevenue 
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

//DELETE

// Delete a project
router.delete("/projects/:id", async (req, res) => {
  const projectId = req.params.id;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete tasks associated with the project
      await connection.query(
        `
          DELETE FROM tasks 
          WHERE ResourceID IN (SELECT ResourceID FROM resources WHERE ProjectID = ?)
        `,
        [projectId]
      );

      // Delete resources associated with the project
      await connection.query("DELETE FROM resources WHERE ProjectID = ?", [
        projectId,
      ]);

      // Delete the project
      await connection.query("DELETE FROM projects WHERE ProjectID = ?", [
        projectId,
      ]);

      await connection.commit();
      res.status(204).send();
    } catch (err) {
      await connection.rollback();
      res.status(500).send("Error deleting project: " + err);
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).send("Database error: " + err);
  }
});

module.exports = router;
