const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require('dotenv').config();

// Configure the MySQL database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json

// Create a MySQL pool connection
const pool = mysql.createPool(dbConfig);

// Endpoints to get all projects
app.get("/projects", async (req, res) => {
  try {
    const limit = parseInt(req.query._limit) || 10;
    const [rows] = await pool.query("SELECT * FROM projects LIMIT ?", [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

// Endpoint to get projects assigned to user
app.get("/user-projects/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.query(`
      SELECT p.ProjectID, p.ProjectCode, p.Title, p.Description, p.Budget, p.ClientID, p.Status
      FROM projects p
      JOIN resources r ON p.ProjectID = r.ProjectID
      WHERE r.UserID = ?
    `, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

// Endpoint to get a single project
app.get("/project/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    const [rows] = await pool.query("SELECT * FROM projects WHERE ProjectID = ?", [projectId]);
    if (rows.length === 0) return res.status(404).json("Project not found");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

// Endpoint to get notifications for a given resourceId
app.get("/notifications/:userID", async (req, res) => {
  const UserID = req.params.userID;
  try {
    const [rows] = await pool.query("SELECT * FROM notifications WHERE UserID = ?", [UserID]);
    if (rows.length === 0) return res.status(404).send({ message: 'No notifications found for this resource.' });
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send({ message: 'Server error occurred' });
  }
});

//Endpoint to create a new notification
app.post("/notifications", async (req, res) => {
  const { UserID, Message, Type, Priority } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO Deloitte.notifications (UserID, Message, Type, CreatedAt, Read_, Priority) VALUES (?, ?, ?, NOW(), 0, ?)",
      [UserID, Message, Type, Priority]
    );

    if (result.affectedRows === 1) {
      res.status(201).send({ message: 'Notification created successfully' });
    } else {
      res.status(400).send({ message: 'Failed to create notification' });
    }
  } catch (err) {
    res.status(500).send({ message: 'Server error occurred' });
  }
});

//end point to delete a notification
app.delete("/notifications/:id", async (req, res) => {
  const NotificationID = req.params.id;

  try {
    const [result] = await pool.query("DELETE FROM notifications WHERE NotificationID = ?", [NotificationID]);

    if (result.affectedRows === 1) {
      res.status(204).send();
    } else {
      res.status(404).send({ message: 'Notification not found' });
    }
  } catch (err) {
    res.status(500).send({ message: 'Server error occurred' });
  }
});



// Endpoint to get the company associated with a project
app.get("/company/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const [rows] = await pool.query(`
      SELECT c.* FROM clients c
      JOIN projects p ON p.ClientID = c.ClientID
      WHERE p.ProjectID = ?
    `, [projectId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

// Endpoint to get project resources
app.get("/resources/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const [rows] = await pool.query("SELECT * FROM resources WHERE ProjectID = ?", [projectId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

app.get("/tasks/:resourceId", async (req, res) => {
  try {
    const resourceId = req.params.resourceId;
    const [rows] = await pool.query(`
      SELECT r.ResourceID, r.UserID, r.Role, r.PlannedHours, r.ProjectID, 
             t.TaskID, t.Description AS TaskDescription, t.Status
      FROM resources r
      LEFT JOIN tasks t ON r.ResourceID = t.ResourceID
      WHERE r.ResourceID = ?
    `, [resourceId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const resource = {
      ResourceID: rows[0].ResourceID,
      UserID: rows[0].UserID,
      Role: rows[0].Role,
      PlannedHours: rows[0].PlannedHours,
      ProjectID: rows[0].ProjectID,
      Tasks: rows.filter(row => row.TaskID !== null).map(row => ({
        TaskID: row.TaskID,
        Description: row.TaskDescription,
        Status: row.Status
      }))
    };
    
    res.json(resource);
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "Error executing query" });
  }
});


// Endpoint to get all users
app.get("/users", async (req, res) => {
  try {
    const limit = parseInt(req.query._limit) || 10;
    const [rows] = await pool.query("SELECT * FROM users LIMIT ?", [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

// Endpoint to get a single user
app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await pool.query("SELECT * FROM users WHERE UserID = ?", [userId]);
    if (rows.length === 0) return res.status(404).json("User not found");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

// Endpoint to get resourceId
app.get('/resource-id/:userId/:projectId', async (req, res) => {
  const userId = req.params.userId;
  const projectId = req.params.projectId;
  
  try {
    const [rows] = await pool.query(`
      SELECT r.ResourceID
      FROM resources r
      WHERE r.UserID = ? AND r.ProjectID = ?
    `, [userId, projectId]);
    
    if (rows.length > 0) {
      const resourceId = rows[0].ResourceID;
      res.json({ resourceId });
    } else {
      res.status(404).send('Resource not found');
    }
  } catch (err) {
    res.status(500).send('Database error');
  }
});

// Endpoint to add a new project
app.post("/newprojects", async (req, res) => {
  const { ProjectCode, Title, Description, Budget, Status, Client, resources } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert client data
      const [clientResult] = await connection.query(`
        INSERT INTO clients (CompanyName, CompanyDescription, ContactEmail, ContactPhone, CompanyLocation) 
        VALUES (?, ?, ?, ?, ?)
      `, [Client.CompanyName, Client.CompanyDescription, Client.ContactEmail, Client.ContactPhone, Client.CompanyLocation]);

      const clientId = clientResult.insertId;

      // Insert project data
      const [projectResult] = await connection.query(`
        INSERT INTO projects (ProjectCode, Title, Description, Budget, ClientID, Status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [ProjectCode, Title, Description, Budget, clientId, Status]);

      const projectId = projectResult.insertId;

      // Insert resources data
      const insertResourceQuery = `
        INSERT INTO resources (ProjectID, UserID, Role, PlannedHours) 
        VALUES (?, ?, ?, ?)
      `;

      for (const resource of resources) {
        await connection.query(insertResourceQuery, [projectId, resource.UserID, resource.role, resource.hours]);
      }

      await connection.commit();
      res.json({ message: "Project, client, and resources added successfully" });
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

// Endpoint to update a project
app.put("/projects/:id", async (req, res) => {
  const projectId = req.params.id;
  const { ProjectCode, Title, Description, Budget, Status, Client, resources } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update project data
      await connection.query(`
        UPDATE projects 
        SET ProjectCode = ?, Title = ?, Description = ?, Budget = ?, Status = ?
        WHERE ProjectID = ?
      `, [ProjectCode, Title, Description, Budget, Status, projectId]);

      // Update client data
      await connection.query(`
        UPDATE clients 
        SET CompanyName = ?, CompanyDescription = ?, ContactEmail = ?, ContactPhone = ?, CompanyLocation = ?
        WHERE ClientID = (SELECT ClientID FROM projects WHERE ProjectID = ?)
      `, [Client.CompanyName, Client.CompanyDescription, Client.ContactEmail, Client.ContactPhone, Client.CompanyLocation, projectId]);

      // Delete existing resources and tasks
      await connection.query(`
        DELETE FROM tasks WHERE ResourceID IN (SELECT ResourceID FROM resources WHERE ProjectID = ?)
      `, [projectId]);

      await connection.query(`
        DELETE FROM resources WHERE ProjectID = ?
      `, [projectId]);

      // Insert updated resources
      const insertResourceQuery = `
        INSERT INTO resources (ProjectID, UserID, Role, PlannedHours) 
        VALUES (?, ?, ?, ?)
      `;

      for (const resource of resources) {
        await connection.query(insertResourceQuery, [projectId, resource.UserID, resource.Role, resource.PlannedHours]);
      }

      await connection.commit();
      res.json({ message: "Project, client, and resources updated successfully" });
    } catch (err) {
      await connection.rollback();
      res.status(500).json("Error updating project: " + err);
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json("Error connecting to the database: " + err);
  }
});

// Delete a project
app.delete("/projects/:id", async (req, res) => {
  const projectId = req.params.id;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete tasks associated with the project
      await connection.query(`
        DELETE FROM tasks 
        WHERE ResourceID IN (SELECT ResourceID FROM resources WHERE ProjectID = ?)
      `, [projectId]);

      // Delete resources associated with the project
      await connection.query("DELETE FROM resources WHERE ProjectID = ?", [projectId]);

      // Delete the project
      await connection.query("DELETE FROM projects WHERE ProjectID = ?", [projectId]);

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

// Endpoint to add tasks
app.post("/tasks", async (req, res) => {
  const newTasks = req.body; // Assuming body is an array of new tasks

  console.log("Request body:", req.body);

  // Validate and filter the input to ensure it does not contain TaskID
  const filteredTasks = newTasks.map(task => ({
    ResourceID: task.ResourceID,
    Description: task.Description,
    Status: task.Status
  }));

  const tasksSql = `
    INSERT INTO tasks (ResourceID, Description, Status)
    VALUES (?, ?, ?)
  `;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const task of filteredTasks) {
        await connection.execute(tasksSql, [task.ResourceID, task.Description, task.Status]);
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

// Endpoint to update tasks
app.put("/tasks/:resourceId", async (req, res) => {
  const resourceId = req.params.resourceId;
  const tasks = req.body; // Assuming body is an array of tasks

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Validate if the ResourceID exists in the resources table
      const [validateResult] = await connection.execute(`
        SELECT * FROM resources WHERE ResourceID = ?
      `, [resourceId]);

      if (validateResult.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "ResourceID does not exist" });
      }

      // Delete existing tasks for the resource
      await connection.execute(`
        DELETE FROM tasks WHERE ResourceID = ?
      `, [resourceId]);

      // Insert updated tasks
      const insertSql = `
        INSERT INTO tasks (ResourceID, Description, Status)
        VALUES (?, ?, ?)
      `;
      for (const task of tasks) {
        await connection.execute(insertSql, [resourceId, task.Description, task.Status]);
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

// Endpoint for login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const connection = await pool.getConnection();

    const [result] = await connection.execute(`
      SELECT * FROM users 
      WHERE email = ? AND password = ?
    `, [email, password]);
    
    if (result.length > 0) {
      // User found
      const user = result[0];
      res.json({
        id: user.UserID,
        name: user.UserName,
        email: user.Email,
        role: user.Role,
        rate: user.HourlyRate,
      });
    } else {
      // User not found
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send('Database error');
  }
});
//registration
app.post('/register', async (req, res) => {
  const { username, email, role, password } = req.body;

  if (!username || !email || !role || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'INSERT INTO users (UserName, Email, Role, Password) VALUES (?, ?, ?, ?)';

  pool.query(query, [username, email, role, password], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to register user' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Endpoint to get user skills
app.get("/skillsets/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.query(`
      SELECT Skillset, Proficiency
      FROM Skillsets
      WHERE UserID = ?
    `, [userId]);

    if (rows.length === 0) return res.status(404).json({ message: 'No skills found for this user.' });

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


// Endpoint to update user skills
app.put("/skillsets/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { skills } = req.body; // Expecting skills to be an object with skill names and proficiency values

  try {
    await pool.query('START TRANSACTION'); // Begin transaction

    // Delete existing skills for the user
    await pool.query('DELETE FROM Skillsets WHERE UserID = ?', [userId]);

    // Insert new skills
    const skillEntries = Object.entries(skills);
    const insertPromises = skillEntries.map(([skill, proficiency]) =>
      pool.query('INSERT INTO Skillsets (UserID, Skillset, Proficiency) VALUES (?, ?, ?)', [userId, skill, proficiency])
    );
    
    await Promise.all(insertPromises); // Execute all insert queries

    await pool.query('COMMIT'); // Commit transaction

    res.status(200).json({ message: 'Skills updated successfully' });
  } catch (err) {
    await pool.query('ROLLBACK'); // Rollback transaction on error
    res.status(500).json("Error executing query: " + err);
  }
});


// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
