const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json


const buildPath = path.join(__dirname, '../dist');

// Serve static files from the "dist" directory
app.use(express.static(buildPath));

// Send the index.html file on the root request
app.get('/', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'), function(err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// Import routes
//const projectsRoutes = require("./routes/projects");
// const usersRoutes = require("./routes/users");
// const notificationsRoutes = require("./routes/notifications");
const resourcesRoutes = require("./routes/resources");
const tasksRoutes = require("./routes/tasks");
const financialsRoutes = require("./routes/financials");
const companiesRoutes = require("./routes/clients");
const skillsetsRoutes = require("./routes/skillsets");



// Use routes
// app.use("/", projectsRoutes);
// app.use("/", usersRoutes);
// app.use("/", notificationsRoutes); 
app.use("/", resourcesRoutes);
app.use("/", tasksRoutes);
app.use("/", financialsRoutes);
app.use("/", companiesRoutes);
app.use("/", skillsetsRoutes);


// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
