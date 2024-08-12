// backend/server.js
const express = require("express");
const cors = require("cors");
const sql = require("mssql");

// Configure the database connectionnpm
const dbConfig = {
  user: "Sakhile",
  password: "Qwerty@1234567",
  server: "deloittedatabase.database.windows.net",
  database: "Deloitte-DB",
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: false // Set to true if using a self-signed certificate
  }
};

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json

// Connect to the database
sql.connect(dbConfig).then(pool => {
  if (pool.connected) {
    console.log("Connected to the database");
  }
}).catch(err => {
  console.error("Error connecting to the database:", err);
});

// Endpoints To get all projects
app.get("/projects", async (req, res) => {
  try {
    const limit = parseInt(req.query._limit) || 10;
    const result = await sql.query`SELECT TOP (${limit}) * FROM projects`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});



//Endpoint to get Projects assigned to user
app.get("/user-projects/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log('Received request for user projects:', req.params.userId);

  try {
    const pool = await sql.connect(dbConfig);
    
    const query = `
      SELECT p.ProjectID, p.ProjectCode, p.Title, p.Description, p.Budget, p.ClientID, p.Status
      FROM projects p
      JOIN resources r ON p.ProjectID = r.ProjectID
      WHERE r.UserID = @UserID
    `;  
    
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "Error executing query: " + err });
  }
});

//Endpoint to get single project
app.get("/project/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    const result = await sql.query`SELECT * FROM projects WHERE ProjectID = ${projectId}`;
    if (result.recordset.length === 0) return res.status(404).json("Project not found");
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});




// Endpoint to get notifications for a given resourceId
app.get("/notifications/:userID", async (req, res) => {
  const UserID = req.params.userID;
  
  try {
      // Query to get notifications for the resource
      const result = await sql.query` 
          SELECT n.NotificationID, n.Message, n.CreatedAt,n.Priority
          FROM notifications n
          WHERE n.UserID = ${UserID}`;

      if (result.recordset.length === 0) {
          return res.status(404).send({ message: 'No notifications found for this resource.' });
      }

      // Respond with the notifications
      res.status(200).json(result.recordset);
  } catch (error) {
      console.error('Error accessing the database:', error);
      res.status(500).send({ message: 'Server error occurred' });
  }
}); 

//Endpoint to get company associated with project
app.get("/company/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const result = await sql.query`
      SELECT c.* FROM clients c
      JOIN projects p ON p.ClientID = c.ClientID
      WHERE p.ProjectID = ${projectId}`;
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

//Endpoint to get Project resources
app.get("/resources/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const result = await sql.query`SELECT * FROM resources WHERE ProjectID = ${projectId}`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

//Endpoint to get tasks assigned to user on a project
app.get("/tasks/:resourceId", async (req, res) => {
  try {
    const resourceId = req.params.resourceId;
    const result = await sql.query`
      SELECT r.ResourceID, r.UserID, r.Role, r.PlannedHours,
             t.TaskID, t.Description AS TaskDescription, t.Status
      FROM resources r
      LEFT JOIN tasks t ON r.ResourceID = t.ResourceID
      WHERE r.ResourceID = ${resourceId}`;
    
    const resource = {
      ResourceID: result.recordset[0]?.ResourceID,
      UserID: result.recordset[0]?.UserID,
      Role: result.recordset[0]?.Role,
      PlannedHours: result.recordset[0]?.PlannedHours,
      Tasks: result.recordset.filter(row => row.TaskID !== null).map(row => ({
        TaskID: row.TaskID,
        Description: row.TaskDescription,
        Status: row.Status
      }))
    };
    
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: "Error executing query" });
  }
});
//Endpoint to get all Users
app.get("/users", async (req, res) => {
  try {
    const limit = parseInt(req.query._limit) || 10;
    const result = await sql.query`SELECT TOP (${limit}) * FROM users`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});
//Endpoint to get single User
app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await sql.query`SELECT * FROM users WHERE UserID = ${userId}`;
    if (result.recordset.length === 0) return res.status(404).json("User not found");
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json("Error executing query: " + err);
  }
});

// Endpoint to get resourceId
app.get('/resource-id/:userId/:projectId', async (req, res) => {
  const  userId = req.params.userId;
  const projectId =req.params.projectId;
  
  try {
      const pool = await sql.connect(dbConfig);
      
      const query = `
          SELECT r.ResourceID
          FROM resources r
          WHERE r.UserID = @UserID AND r.ProjectID = @ProjectID
      `;
      
      const result = await pool.request()
          .input('UserID', sql.Int, userId)
          .input('ProjectID', sql.Int, projectId)
          .query(query);
      
      if (result.recordset.length > 0) {
          const resourceId = result.recordset[0].ResourceID;
          console.log(`ResourceId is ${resourceId}`);
          res.json({ resourceId });
      } else {
          res.status(404).send('Resource not found');
      }
  } catch (err) {
      console.error("Error executing query:", err);
      res.status(500).send('Database error');
  }
});


//POST
//Endpoint to add a new project
app.post("/newprojects", async (req, res) => {
  const { ProjectCode, Title, Description, Budget, Status, Client, resources } = req.body;
console.log(req.body);
  try {
    const pool = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      // Insert client data
      const clientResult = await transaction.request()
        .input('CompanyName', sql.NVarChar, Client.CompanyName)
        .input('CompanyDescription', sql.NVarChar, Client.CompanyDescription)
        .input('ContactEmail', sql.NVarChar, Client.ContactEmail)
        .input('ContactPhone', sql.NVarChar, Client.ContactPhone)
        .input('CompanyLocation', sql.NVarChar, Client.CompanyLocation)
        .query(`
          INSERT INTO clients (CompanyName, CompanyDescription, ContactEmail, ContactPhone, CompanyLocation) 
          VALUES (@CompanyName, @CompanyDescription, @ContactEmail, @ContactPhone, @CompanyLocation);
          SELECT SCOPE_IDENTITY() AS ClientID
        `);
      const clientId = clientResult.recordset[0].ClientID;

      // Insert project data
      const projectResult = await transaction.request()
        .input('ProjectCode', sql.NVarChar, ProjectCode)
        .input('Title', sql.NVarChar, Title)
        .input('Description', sql.NVarChar, Description)
        .input('Budget', sql.Decimal, Budget)
        .input('ClientID', sql.Int, clientId)
        .input('Status', sql.NVarChar, Status)
        .query(`
          INSERT INTO projects (ProjectCode, Title, Description, Budget, ClientID, Status) 
          VALUES (@ProjectCode, @Title, @Description, @Budget, @ClientID, @Status);
          SELECT SCOPE_IDENTITY() AS ProjectID
        `);
      const projectId = projectResult.recordset[0].ProjectID;

      // Insert resources data
      const insertResourceQuery = `
        INSERT INTO resources (ProjectID, UserID, Role, PlannedHours) 
        VALUES (@ProjectID, @UserID, @Role, @PlannedHours)
      `;

      for (const resource of resources) {
        await transaction.request()
          .input('ProjectID', sql.Int, projectId)
          .input('UserID', sql.Int, resource.UserID)
          .input('Role', sql.NVarChar, resource.role)
          .input('PlannedHours', sql.Int, resource.hours)
          .query(insertResourceQuery);
      }

      await transaction.commit();
      res.json({ message: "Project, client, and resources added successfully" });
    } catch (err) {
      await transaction.rollback();
      res.status(500).json("Error adding project: " + err);
    }
  } catch (err) {
    res.status(500).json("Error connecting to the database: " + err);
  }
});

//Endpoint to Update Project
app.put("/projects/:id", async (req, res) => {
  const projectId = req.params.id;
  const { ProjectCode, Title, Description, Budget, Status, Client, resources } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      // Update project data
      await transaction.request()
        .input('ProjectCode', sql.NVarChar, ProjectCode)
        .input('Title', sql.NVarChar, Title)
        .input('Description', sql.NVarChar, Description)
        .input('Budget', sql.Decimal, Budget)
        .input('Status', sql.NVarChar, Status)
        .input('ProjectID', sql.Int, projectId)
        .query(`
          UPDATE projects 
          SET ProjectCode = @ProjectCode, Title = @Title, Description = @Description, Budget = @Budget, Status = @Status
          WHERE ProjectID = @ProjectID
        `);

      // Update client data
      await transaction.request()
        .input('CompanyName', sql.NVarChar, Client.CompanyName)
        .input('CompanyDescription', sql.NVarChar, Client.CompanyDescription)
        .input('ContactEmail', sql.NVarChar, Client.ContactEmail)
        .input('ContactPhone', sql.NVarChar, Client.ContactPhone)
        .input('CompanyLocation', sql.NVarChar, Client.CompanyLocation)
        .input('ProjectID', sql.Int, projectId)
        .query(`
          UPDATE clients 
          SET CompanyName = @CompanyName, CompanyDescription = @CompanyDescription, ContactEmail = @ContactEmail, ContactPhone = @ContactPhone, CompanyLocation = @CompanyLocation
          WHERE ClientID = (SELECT ClientID FROM projects WHERE ProjectID = @ProjectID)
        `);

      // Delete existing tasks
      await transaction.request()
        .input('ProjectID', sql.Int, projectId)
        .query(`
          DELETE FROM tasks WHERE ResourceID IN (SELECT ResourceID FROM resources WHERE ProjectID = @ProjectID)
        `);

      // Delete existing resources
      await transaction.request()
        .input('ProjectID', sql.Int, projectId)
        .query(`
          DELETE FROM resources WHERE ProjectID = @ProjectID
        `);

      // Insert new resources
      const resourceValues = resources.map(resource => [
        projectId,
        resource.UserID,
        resource.Role,
        resource.PlannedHours
      ]);
      await transaction.request().query(`
        INSERT INTO resources (ProjectID, UserID, Role, PlannedHours) 
        VALUES ${resourceValues.map(() => '(?, ?, ?, ?)').join(', ')}
      `, resourceValues.flat());

      await transaction.commit();
      res.json({ message: "Project and resources updated successfully" });
    } catch (err) {
      await transaction.rollback();
      res.status(500).json("Error updating project: " + err);
    }
  } catch (err) {
    res.status(500).json("Error connecting to the database: " + err);
  }
});

//Endpoint to add tasks
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
    VALUES (@ResourceID, @Description, @Status)
  `;

  try {
    const pool = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      for (const task of filteredTasks) {
        await transaction.request()
          .input('ResourceID', sql.Int, task.ResourceID)
          .input('Description', sql.NVarChar, task.Description)
          .input('Status', sql.NVarChar, task.Status)
          .query(tasksSql);
      }

      await transaction.commit();
      res.json({ message: "Tasks added successfully" });
    } catch (err) {
      await transaction.rollback();
      console.error("Error inserting tasks:", err);
      res.status(500).json({ error: "Error inserting tasks: " + err });
    }
  } catch (err) {
    console.error("Error connecting to the database:", err);
    res.status(500).json({ error: "Error connecting to the database: " + err });
  }
});

//Endpoint to Update Tasks
app.put("/tasks/:resourceId", async (req, res) => {
  const resourceId = req.params.resourceId;
  const tasks = req.body; // Assuming body is an array of tasks

  try {
    const pool = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      // Validate if the ResourceID exists in the resources table
      const validateResourceSql = `
        SELECT * FROM resources WHERE ResourceID = @ResourceID
      `;
      const validateResult = await transaction.request()
        .input('ResourceID', sql.Int, resourceId)
        .query(validateResourceSql);

      if (validateResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "ResourceID does not exist" });
      }

      // Delete existing tasks for the resource
      const deleteSql = `
        DELETE FROM tasks WHERE ResourceID = @ResourceID
      `;
      await transaction.request()
        .input('ResourceID', sql.Int, resourceId)
        .query(deleteSql);

      // Insert updated tasks
      const insertSql = `
        INSERT INTO tasks (ResourceID, Description, Status)
        VALUES (@ResourceID, @Description, @Status)
      `;
      for (const task of tasks) {
        await transaction.request()
          .input('ResourceID', sql.Int, resourceId)
          .input('Description', sql.NVarChar, task.Description)
          .input('Status', sql.NVarChar, task.Status)
          .query(insertSql);
      }

      await transaction.commit();
      res.json({ message: "Tasks updated successfully" });
    } catch (err) {
      await transaction.rollback();
      console.error("Error updating tasks:", err);
      res.status(500).json({ error: "Error updating tasks: " + err });
    }
  } catch (err) {
    console.error("Error connecting to the database:", err);
    res.status(500).json({ error: "Error connecting to the database: " + err });
  }
});

//Endpoint to delete a task
app.delete("/task/:taskId", async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const pool = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const sqlQuery = `
        DELETE FROM tasks WHERE TaskID = @TaskID
      `;
      await transaction.request()
        .input('TaskID', sql.Int, taskId)
        .query(sqlQuery);

      await transaction.commit();
      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      await transaction.rollback();
      console.error("Error deleting task:", err);
      res.status(500).json({ error: "Error deleting task: " + err });
    }
  } catch (err) {
    console.error("Error connecting to the database:", err);
    res.status(500).json({ error: "Error connecting to the database: " + err });
  }
});

//Endpoint to delete a project
app.delete("/projects/:id", async (req, res) => {
  const projectId = req.params.id;

  try {
    const pool = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      // Delete associated resources and tasks
      await transaction.request()
        .input('ProjectID', sql.Int, projectId)
        .query(`
          DELETE FROM resources WHERE ProjectID = @ProjectID;
          DELETE FROM tasks WHERE ResourceID IN (SELECT ResourceID FROM resources WHERE ProjectID = @ProjectID);
        `);

      // Delete project
      await transaction.request()
        .input('ProjectID', sql.Int, projectId)
        .query(`
          DELETE FROM projects WHERE ProjectID = @ProjectID
        `);

      await transaction.commit();
      res.json({ message: "Project deleted successfully" });
    } catch (err) {
      await transaction.rollback();
      res.status(500).json("Error deleting project: " + err);
    }
  } catch (err) {
    res.status(500).json("Error connecting to the database: " + err);
  }
});

// Define the login endpoint
// Endpoint for login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const pool = await sql.connect(dbConfig);
    
    const query = `
      SELECT * FROM users 
      WHERE email = @Email AND password = @Password
    `;
    
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .input('Password', sql.NVarChar, password)
      .query(query);
    
    if (result.recordset.length > 0) {
      // User found
      const user = result.recordset[0];
      res.json({
        id: user.UserID,
        name: user.UserName,
        email: user.Email,
        role: user.Role,
        rate: user.HourlyRate,
        skills: user.SkillSet,
        cvPath: user.CVPath,
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









// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${8081}`));