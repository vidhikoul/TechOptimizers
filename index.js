const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Import the database connection functions from db.js
const {db} = require('./config/db_config');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection flag
let isConnected = false;

//auth routes
const authrouter = require("./routers/authRouters");
app.use('/api/auth', authrouter);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
