from fastapi import FastAPI, UploadFile, File
from dotenv import load_dotenv
import os
import shutil
import uuid
import requests
import xml.etree.ElementTree as ET
import psycopg2
from neo4j import GraphDatabase
from qdrant_client import QdrantClient
import redis

load_dotenv()

app = FastAPI(title="Research Paper Discovery Platform")

UPLOAD_DIR = "uploads"
GROBID_URL = os.getenv("GROBID_URL")

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

@app.get("/health")
def health_check():
    status = {}

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

    try:
        client = QdrantClient(
            host=os.getenv("QDRANT_HOST"),
            port=int(os.getenv("QDRANT_PORT"))
        )
        client.get_collections()
        status["qdrant"] = "connected"
    except Exception as e:
        status["qdrant"] = f"error: {str(e)}"

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


def parse_pdf_with_grobid(file_path: str):
    """GROBID ko PDF bhejta hai aur title, authors, abstract nikaalta hai"""
    url = f"{GROBID_URL}/api/processHeaderDocument"

    with open(file_path, "rb") as f:
        files = {"input": f}
        headers = {"Accept": "application/xml"}
        response = requests.post(url, files=files, headers=headers)

    print("GROBID STATUS CODE:", response.status_code)
    print("GROBID RESPONSE (first 500 chars):", response.text[:500])

    if response.status_code != 200:
        return {"error": f"GROBID failed with status {response.status_code}", "raw_response": response.text[:500]}

    # GROBID XML (TEI format) return karta hai, usse parse karte hain
    xml_content = response.text
    ns = {"tei": "http://www.tei-c.org/ns/1.0"}
    root = ET.fromstring(xml_content)

    # Title nikaalo
    title_elem = root.find(".//tei:titleStmt/tei:title", ns)
    title = title_elem.text if title_elem is not None else "Unknown Title"

    # Authors nikaalo
    authors = []
    for author in root.findall(".//tei:sourceDesc//tei:author/tei:persName", ns):
        forename = author.find("tei:forename", ns)
        surname = author.find("tei:surname", ns)
        name_parts = []
        if forename is not None and forename.text:
            name_parts.append(forename.text)
        if surname is not None and surname.text:
            name_parts.append(surname.text)
        if name_parts:
            authors.append(" ".join(name_parts))

    # Abstract nikaalo
    abstract_elem = root.find(".//tei:abstract//tei:p", ns)
    abstract = abstract_elem.text if abstract_elem is not None else "No abstract found"

    return {
        "title": title,
        "authors": authors,
        "abstract": abstract
    }


@app.post("/upload")
async def upload_paper(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed"}

    unique_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_DIR}/{unique_id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # GROBID se parse karwao
    parsed_data = parse_pdf_with_grobid(file_path)

    return {
        "message": "File uploaded and parsed successfully",
        "filename": file.filename,
        "saved_as": file_path,
        "parsed_data": parsed_data
    }