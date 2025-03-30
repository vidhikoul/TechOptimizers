const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Import the database connection functions from db.js
const {db} = require('./config/db_config');
const { Groq } = require('groq-sdk');

dotenv.config();

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Store your API key in a .env file
});

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

//Trino Routers
const trinoRouters = require("./routers/trinoRouters");
app.use("/api/trino", trinoRouters);


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
    const response = await groqClient.chat.completions.create({
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

app.get('/api/sql/schema', async (req, res) => {
  const { userQuery } = req.query; // Change from req.body to req.query

  if (!userQuery) {
    return res.status(400).json({ error: "No prompt found" });
  }

  try {
    const result = await groqClient.chat.completions.create({
      messages: [{ "role": "user", "content": `Generate only SQL schema and give me CREATE TABLE SQL statements only for this prompt: ${userQuery}` }],
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false
    });

    if (!result.choices || result.choices.length === 0) {
      throw new Error("No schema response from LLM");
    }

    const generatedQuery = result.choices[0]?.message?.content?.trim() || '';
    console.log("Generated Query:", generatedQuery);
    return res.status(200).json({ schema: generatedQuery });
  } catch (error) {
    console.error("Schema recommendation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});