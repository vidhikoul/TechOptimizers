from fastapi import FastAPI, HTTPException
from groq import Groq
from pydantic import BaseModel
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import mysql.connector
import json

app = FastAPI()

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

mysql_connections = {}
trino_connections = {}
spark_connections = {}

async def generateQuery():
    pass

async def executeQuery(uid, query, dialect):
    if(dialect == 'mysql'):
        pass
    else:
        return "NA"

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
    if(schema != None):
        relivent_schema = schema.similarity_search(prompt, k = 3)
    if(dialect == "mysql"):
        query = f"""Use the following schema to generate MySql Query based on following schema give my only sql query with no explaination:

        {relivent_schema}

        Question: {prompt}
        Answer:
        """
        return send_to_groq(query)
    if dialect == "trino":
        vector_db = FAISS.load_local("vector_db_trino", embeddings, allow_dangerous_deserialization=True)
    elif dialect == "spark":
        vector_db = FAISS.load_local("vector_db_spark", embeddings, allow_dangerous_deserialization=True)
    docs = vector_db.similarity_search(prompt, k=3)  # Retrieve the top 3 relevant chunks
    query = f"""Use the following documentation to answer the query and give only SQL query without and explainantions:

{docs}

Question: {prompt}
Answer:
"""
    return send_to_groq(query)

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

class GetSchema(BaseModel):
    schema: str
    uid: str
