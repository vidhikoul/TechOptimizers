const express = require("express");
const router = express.Router();
const { connectToDB, ExecuteQuery, GenerateSQL} = require("../controllers/trinoController");

router.post("/connect", connectToDB);

router.post("/execute", ExecuteQuery);

router.post("/generateSql", GenerateSQL);

module.exports = router;