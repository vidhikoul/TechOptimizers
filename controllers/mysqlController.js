const axios = require("axios");
const dotenv = require('dotenv');

dotenv.config();

async function connectToDB(req, res){
    const {uid, user, password, host, port, db_name} = req.body;
    if (!host || !user || !password || !db_name || !uid || !port) {
        return res.status(400).json({ error: "Missing required database credentials" });
    }

    try {
        const response = await axios.post(process.env.SERVER_URL + "mysql/connect", {
            "uid":uid,
            "user":user,
            "password":password,
            "host":host,
           "port":port,
            "db_name":db_name,
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
        const response = await axios.post(process.env.SERVER_URL + "mysql/execute-query", {
            uid: uid,
            query: query
        });

        return res.json({ success: true, results: response.data.results, flag : response.data.flag });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.response?.data?.detail || error.message });
    }
}

async function GenerateSQL(req, res){
    const {uid, user, password, host, port, db_name} = req.body;
    if (!host || !user || !password || !db_name || !uid || !port) {
        return res.status(400).json({ error: "Missing required database credentials" });
    }

    try {
        const response = await axios.post(process.env.SERVER_URL + "mysql/connect", {
            "uid":uid,
            "user":user,
            "password":password,
            "host":host,
           "port":port,
            "db_name":db_name,
        });
        return res.json({success : true, message: "Credentials sent successfully" });
    } catch (error) {
        return res.status(500).json({success : false , message: error.message });
    }
}

module.exports = {connectToDB, ExecuteQuery, GenerateSQL}