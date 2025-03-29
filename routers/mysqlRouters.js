const express = require("express");
const router = express.Router();
const { connectToDB, ExecuteQuery, GenerateSQL} = require("../controllers/mysqlController");

router.post("/connect", connectToDB);

router.post("/execute", ExecuteQuery);

router.get("/generateSql", GenerateSQL);

module.exports = router;