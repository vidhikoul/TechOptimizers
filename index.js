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

//MYSQL Routers
const mysqlrouter = require("./routers/mysqlRouters");
app.use("/api/mysql", mysqlrouter);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.post("/api/convert-to-prisma", async (req, res) => {
  const { sqlSchema } = req.body;
  if (!sqlSchema) {
    return res.status(400).json({ error: "SQL schema is required" });
  }

  try {
    // Generate Prisma schema using Groq instead of external API
    const response = await groq.chat.completions.create({
      messages: [{
        role: "user",
        content: `Convert this SQL schema to Prisma schema format:\n\n${sqlSchema}\n\nOnly provide the Prisma schema code, no explanations.`
      }],
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 1024
    });

    const prismaSchema = response.choices[0]?.message?.content?.trim() || '';
    
    if (!prismaSchema) {
      return res.status(500).json({ error: "Failed to generate Prisma schema" });
    }

    return res.status(200).json({ prismaSchema });
  } catch (error) {
    console.error("Error converting to Prisma schema:", error);
    return res.status(500).json({
      error: "Failed to convert schema",
      details: error.message,
    });
  }
});