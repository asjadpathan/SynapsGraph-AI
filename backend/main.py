from fastapi import FastAPI, UploadFile, File
from dotenv import load_dotenv
import os
import shutil
import uuid
import psycopg2
from neo4j import GraphDatabase
from qdrant_client import QdrantClient
import redis

load_dotenv()

app = FastAPI(title="Research Paper Discovery Platform")

UPLOAD_DIR = "uploads"

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

@app.get("/health")
def health_check():
    status = {}

    # Check Postgres
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT"),
            dbname=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
        )
        conn.close()
        status["postgres"] = "connected"
    except Exception as e:
        status["postgres"] = f"error: {str(e)}"

    # Check Neo4j
    try:
        driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )
        driver.verify_connectivity()
        driver.close()
        status["neo4j"] = "connected"
    except Exception as e:
        status["neo4j"] = f"error: {str(e)}"

    # Check Qdrant
    try:
        client = QdrantClient(
            host=os.getenv("QDRANT_HOST"),
            port=int(os.getenv("QDRANT_PORT"))
        )
        client.get_collections()
        status["qdrant"] = "connected"
    except Exception as e:
        status["qdrant"] = f"error: {str(e)}"

    # Check Redis
    try:
        r = redis.Redis(
            host=os.getenv("REDIS_HOST"),
            port=int(os.getenv("REDIS_PORT"))
        )
        r.ping()
        status["redis"] = "connected"
    except Exception as e:
        status["redis"] = f"error: {str(e)}"

    return status

@app.post("/upload")
async def upload_paper(file: UploadFile = File(...)):
    # Sirf PDF allow karo
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed"}

    # Unique filename banao (taaki do papers same naam se overwrite na ho)
    unique_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_DIR}/{unique_id}_{file.filename}"

    # File save karo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "saved_as": file_path
    }