from fastapi import FastAPI, HTTPException
from groq import Groq
from pydantic import BaseModel
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import mysql.connector
import trino
from fastapi.middleware.cors import CORSMiddleware

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

def query_trino(uid, sql_query):
    """Connects to Trino and executes a SQL query."""
    try:
        cur = trino_connections[uid].cursor()
        cur.execute(sql_query)
        rows = cur.fetchall()
        return rows
    except Exception as e:
        print("Error:", e)
        return None

def fetch_info_schema(uid,schema="default"):
    sql_query = f"""
    SELECT table_name, column_name, data_type
    FROM mysql.information_schema.columns
    WHERE table_schema = '{schema}'
    """
    rows = query_trino(uid,sql_query)
    
    schema_info = {}
    if rows:
        for table_name, column_name, data_type in rows:
            if table_name not in schema_info:
                schema_info[table_name] = []
            schema_info[table_name].append({"column": column_name, "type": data_type})
    
    # If schema_info is empty, try alternative methods
    if not schema_info:
        schema_info = fetch_schema_alternative(uid,schema)
    
    return schema_info

def fetch_schema_alternative(uid,schema):
    schema_info = {}
    tables_query = f"SHOW TABLES FROM {schema}"
    tables = query_trino(uid,tables_query)
    
    if tables:
        for table in tables:
            table_name = table[0]
            describe_query = f"DESCRIBE {schema}.{table_name}"
            columns = query_trino(uid,describe_query)
            schema_info[table_name] = [
                {"column": row[0], "type": row[1]} for row in columns
            ]
    
    return schema_info

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
    schema=None
    try:
        schema = FAISS.load_local(f"{uid}_schema_db", embeddings, allow_dangerous_deserialization=True)
    except Exception:
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
        
        docs = vector_db.similarity_search_with_score(prompt)  # Retrieve the top 4 relevant chunks

        # docs = []
        query = f"""Use the following documentation to answer the query in {dialect} dialect and give only {dialect} SQL query without and explainantions:
        {docs}
        consider following schema :
        {relevant_history}
        consider following history :
        {relevant_history}
        Question: {prompt}
        Answer:
        """
        print(query)
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

class TrinoConnect(BaseModel):
    host: str
    port : int
    user : str
    uid : str
@app.post("/trino/connect")
async def trinoconnect(trinoconnect : TrinoConnect):
    conn = trino.dbapi.connect(
            host=trinoconnect.host,
            port=trinoconnect.port,
            user=trinoconnect.user
        )
    trino_connections[trinoconnect.uid] = conn
    schema_data = fetch_info_schema(trinoconnect.uid,"mysql.mydb")
    print(schema_data)
    descriptions = []
    for table, columns in schema_data.items():
        column_descriptions = ", ".join(
            [f"{col['column']} ({col['type']})" for col in columns]
        )
        table_description = f"Table: {table}, Columns: {column_descriptions}"
        descriptions.append(table_description)
    # Create FAISS vector store
    vector_db = FAISS.from_texts(descriptions, embeddings)
    # Save FAISS index
    vector_db.save_local(f"{trinoconnect.uid}_schema_db")
    return {"message" : "success"}

class TrinoExecute(BaseModel):
    query : str
    uid : str
@app.post("/trino/execute-query")
async def trinoExecute(trinoexecute : TrinoExecute):
    if trinoexecute.uid not in trino_connections:
        raise HTTPException(status_code=400, detail="User is not connected to a Trino database.")
    conn = trino_connections[trinoexecute.uid]
    cursor = conn.cursor()
    try:
        cursor.execute(trinoexecute.query)
        results = cursor.fetchall()
        print(results)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Query execution failed: {e}")
    finally:
        cursor.close()

