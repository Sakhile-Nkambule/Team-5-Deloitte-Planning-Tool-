const mysql = require("mysql2/promise");
require("dotenv").config();
// Configure the MySQL database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create a MySQL pool connection
const pool = mysql.createPool(dbConfig);

module.exports = pool;
