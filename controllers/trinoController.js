const axios = require("axios");
const dotenv = require('dotenv');

dotenv.config();

async function connectToDB(req, res){
    const {uid, user, host, port} = req.body;
    if (!host || !user || !uid || !port) {
        return res.status(400).json({ error: "Missing required database credentials" });
    }

    try {
        const response = await axios.post(process.env.SERVER_URL + "trino/connect", {
            "uid":uid,
            "user":user,
            "host":host,
           "port":port,
        });
        return res.json({success : true, message: "Credentials sent successfully" });
    } catch (error) {
        return res.status(500).json({success : false , message: error.message });
    }
}

async function ExecuteQuery(req, res) {
    const { uid, query } = req.body;
    
    if (!uid || !query) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
        const response = await axios.post(process.env.SERVER_URL + "trino/execute-query", {
            uid: uid,
            query: query
        });
        return res.json({ success: true, results: response.data.results});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.response?.data?.detail || error.message });
    }
}

async function GenerateSQL(req, res){
    const {uid, query, dialect} = req.body;
    if (!uid || !query || !dialect) {
        return res.status(400).json({ error: "Missing required database credentials" });
    }
    try {
        const response = await axios.post(process.env.SERVER_URL + "query", {
            "uid": uid,
            "query" : query,
            "dialect" : "trino"
        });
        return res.json({success : true, query: response.data.sql_query });
    } catch (error) {
        return res.status(500).json({success : false , message: error.message });
    }
}

module.exports = {connectToDB, ExecuteQuery, GenerateSQL}