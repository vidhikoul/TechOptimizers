from fastapi import FastAPI, HTTPException
from groq import Groq
from pydantic import BaseModel
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import mysql.connector
import json
from fastapi.middleware.cors import CORSMiddleware
from collections import deque  # Import deque for query queues

app = FastAPI()


# Allow all origins, methods, and headers (Adjust for security in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins for security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

mysql_connections = {}
trino_connections = {}
spark_connections = {}

chat_history = {}
CHAT_HISTORY_LIMIT = 7  # Store last 7 messages

def update_chat_history(human: str, response: str, uid : str):
    """Add a new message pair to chat history and maintain limit."""
    if uid not in chat_history:
        chat_history[uid] = [{"human": human, "response": response}]
    else:
        chat_history[uid].append({"human": human, "response": response})
    
    # Keep only last CHAT_HISTORY_LIMIT messages
    if len(chat_history) > CHAT_HISTORY_LIMIT:
        chat_history[uid][:] = chat_history[uid][-CHAT_HISTORY_LIMIT:]

def get_relevant_history(uid : str):
    """Retrieve relevant chat history as a formatted string."""
    if uid not in chat_history:
        chat_history[uid] = []
    return "\n".join([f"Human: {entry['human']}\nResponse: {entry['response']}" for entry in chat_history[uid]])

async def generateQuery():
    pass

def extract_text_from_txt(txt_path):
    with open(txt_path, "r", encoding="utf-8") as file:
        text = file.read()
    return text

def chunk_text(text, chunk_size=1000, chunk_overlap=100):
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_text(text)

def create_vector_db(txt_text, dbname):
    chunks = chunk_text(txt_text)
    vector_db = FAISS.from_texts(chunks, embeddings)
    vector_db.save_local(dbname)

def send_to_groq(query):
    client = Groq(api_key="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")
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content" : query}],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )
    response_text = ""
    for chunk in completion:
        # Process each chunk from the stream
        response_text += chunk.choices[0].delta.content or ""
        print(chunk.choices[0].delta.content or "", end="")

    return response_text

async def generate_query(uid, prompt, dialect):
    try:
        schema = FAISS.load_local(f"{uid}_schema_db", embeddings, allow_dangerous_deserialization=True)
    except FileNotFoundError:
        shcema = None
    relivent_schema = []
    relevant_history = get_relevant_history(uid)

    if(schema != None):
        relivent_schema = schema.similarity_search(prompt, k = 3)

    if(dialect == "mysql"):
        query = f"""Use the following schema to generate MySql Query based on following schema give my only sql query with no explaination:

        {relivent_schema}
        consider following history :
        {relevant_history}
        Question: {prompt}
        Answer:
        """
        result_text =  send_to_groq(query)
    else:
        if dialect == "trino":
            vector_db = FAISS.load_local("vector_db_trino", embeddings, allow_dangerous_deserialization=True)
        elif dialect == "spark":
            vector_db = FAISS.load_local("vector_db_spark", embeddings, allow_dangerous_deserialization=True)
        docs = vector_db.similarity_search(prompt, k=3)  # Retrieve the top 3 relevant chunks
        query = f"""Use the following documentation to answer the query and give only SQL query without and explainantions:

        {docs}
        consider following history :
        {relevant_history}
        Question: {prompt}
        Answer:
        """
        result_text = send_to_groq(query)
    update_chat_history(prompt, result_text,uid)
    return result_text
# Root endpoint
@app.get("/")
async def home():
    return {"message": "Welcome to the API!"}

def get_user_databases(conn):
    """Fetch only user-created databases."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT schema_name 
        FROM information_schema.schemata
        WHERE schema_name NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
    """)
    databases = [db[0] for db in cursor.fetchall()]
    cursor.close()
    return databases

def get_tables_for_database(conn, database):
    """Fetch tables from the selected database."""
    cursor = conn.cursor()
    cursor.execute(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{database}'")
    tables = [tbl[0] for tbl in cursor.fetchall()]
    cursor.close()
    return tables

def get_schema_for_table(conn, database, table):
    """Fetch column names and types for a given table."""
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = '{database}' 
        AND table_name = '{table}'
    """)
    schema = {row[0]: row[1] for row in cursor.fetchall()}
    cursor.close()
    return schema

def create_schema_vector_db(uid, db_schema):
    # Extract table descriptions for embedding
    table_descriptions = []
    table_names = []
    for db_name, tables in db_schema.items():
        for table_name, columns in tables.items():
            column_info = ", ".join([f"{col}: {dtype}" for col, dtype in columns.items()])
            description = f"Table '{table_name}' in database '{db_name}' contains columns: {column_info}."
            table_descriptions.append(description)
            table_names.append(table_name)
    # Create FAISS vector store
    vector_db = FAISS.from_texts(table_descriptions, embeddings)
    # Save FAISS index
    vector_db.save_local(f"{uid}_schema_db")

class MySqlConnection(BaseModel): 
    uid : str
    user: str
    password: str
    host : str
    port:int
    db_name : str
@app.post("/mysql/connect")
async def connect(mysqlconnection : MySqlConnection):
    conn = mysql.connector.connect(host=mysqlconnection.host, port=mysqlconnection.port, user=mysqlconnection.user, password=mysqlconnection.password)
    mysql_connections[mysqlconnection.uid] = conn
    user_databases = get_user_databases(conn)
    conn.cursor().execute("USE " + mysqlconnection.db_name)
    print("connection successful")
    if not user_databases:
        print("No user-created databases found.")
        return {"message" : "No database found"}
    schema_data = {}
    for db in user_databases:
        tables = get_tables_for_database(conn, db)
        schema_data[db] = {}
        for table in tables:
            schema_data[db][table] = {"schema": get_schema_for_table(conn, db, table)}
    create_schema_vector_db(mysqlconnection.uid, schema_data)
    return {"message" : "connection successful"}

class QueryInput(BaseModel):
    query: str
    uid : str
    dialect: str

@app.post("/query")
async def query(query: QueryInput):
    """POST API to generate SQL from text."""
    generated = await generate_query(query.uid, query.query, query.dialect)
    return {"sql_query": generated}

class ExecuteQuery(BaseModel):
    query: str
    uid : str
    
@app.post("/mysql/execute-query")
async def execute_query(executequery: ExecuteQuery):
    """Execute a SQL query on the user's MySQL database."""
    uid = executequery.uid
    query = executequery.query
    if uid not in mysql_connections:
        raise HTTPException(status_code=400, detail="User is not connected to a MySQL database.")

    conn = mysql_connections[uid]
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(query)
        if query.strip().lower().startswith("select"):
            flag = True
            results = cursor.fetchall()
        else:
            conn.commit()
            flag = False
            results = {"message": "Query executed successfully."}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=f"Query execution failed: {err}")
    finally:
        cursor.close()
    return {"flag" : flag, "results": results}

