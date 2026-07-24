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

# Neo4j driver ek hi baar banate hain, poori app ke liye reuse hoga
neo4j_driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
)


def get_postgres_connection():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )


@app.get("/")
def read_root():
    return {"message": "Backend is running!"}


@app.get("/health")
def health_check():
    status = {}

    try:
        conn = get_postgres_connection()
        conn.close()
        status["postgres"] = "connected"
    except Exception as e:
        status["postgres"] = f"error: {str(e)}"

    try:
        neo4j_driver.verify_connectivity()
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
    url = f"{GROBID_URL}/api/processHeaderDocument"

    with open(file_path, "rb") as f:
        files = {"input": f}
        headers = {"Accept": "application/xml"}
        response = requests.post(url, files=files, headers=headers)

    if response.status_code != 200:
        return {"error": f"GROBID failed with status {response.status_code}", "raw_response": response.text[:500]}

    xml_content = response.text
    ns = {"tei": "http://www.tei-c.org/ns/1.0"}
    root = ET.fromstring(xml_content)

    title_elem = root.find(".//tei:titleStmt/tei:title", ns)
    title = title_elem.text if title_elem is not None else "Unknown Title"

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

    abstract_elem = root.find(".//tei:abstract//tei:p", ns)
    abstract = abstract_elem.text if abstract_elem is not None else "No abstract found"

    return {
        "title": title,
        "authors": authors,
        "abstract": abstract
    }


def save_paper_to_postgres(unique_id, filename, file_path, parsed_data):
    conn = get_postgres_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO papers (unique_id, filename, file_path, title, authors, abstract)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id;
        """,
        (
            unique_id,
            filename,
            file_path,
            parsed_data.get("title"),
            parsed_data.get("authors"),
            parsed_data.get("abstract"),
        )
    )

    paper_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return paper_id


def create_paper_node_in_neo4j(paper_id, unique_id, title, authors):
    """Neo4j me ek Paper node banata hai, aur har author ke liye Author node + relationship banata hai"""
    with neo4j_driver.session() as session:
        # Paper node banao
        session.run(
            """
            MERGE (p:Paper {paper_id: $paper_id})
            SET p.unique_id = $unique_id,
                p.title = $title
            """,
            paper_id=paper_id,
            unique_id=unique_id,
            title=title
        )

        # Har author ke liye Author node banao aur Paper se link karo
        for author_name in authors:
            session.run(
                """
                MERGE (a:Author {name: $author_name})
                WITH a
                MATCH (p:Paper {paper_id: $paper_id})
                MERGE (a)-[:AUTHORED]->(p)
                """,
                author_name=author_name,
                paper_id=paper_id
            )


@app.post("/upload")
async def upload_paper(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed"}

    unique_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_DIR}/{unique_id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parsed_data = parse_pdf_with_grobid(file_path)

    if "error" in parsed_data:
        return {
            "message": "File uploaded but parsing failed",
            "filename": file.filename,
            "saved_as": file_path,
            "parsed_data": parsed_data
        }

    paper_id = save_paper_to_postgres(unique_id, file.filename, file_path, parsed_data)

    # Neo4j me bhi node banao
    create_paper_node_in_neo4j(
        paper_id,
        unique_id,
        parsed_data.get("title"),
        parsed_data.get("authors", [])
    )

    return {
        "message": "File uploaded, parsed, saved, and added to knowledge graph",
        "paper_id": paper_id,
        "filename": file.filename,
        "saved_as": file_path,
        "parsed_data": parsed_data
    }


@app.get("/papers")
def get_all_papers():
    conn = get_postgres_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, unique_id, filename, title, authors, abstract, uploaded_at FROM papers ORDER BY uploaded_at DESC;")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    papers = []
    for row in rows:
        papers.append({
            "id": row[0],
            "unique_id": str(row[1]),
            "filename": row[2],
            "title": row[3],
            "authors": row[4],
            "abstract": row[5],
            "uploaded_at": str(row[6])
        })

    return {"papers": papers}