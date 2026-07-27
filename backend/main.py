from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import shutil
import uuid
import hashlib
import requests
import xml.etree.ElementTree as ET
import psycopg2
from neo4j import GraphDatabase
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from google import genai
import redis

load_dotenv()

app = FastAPI(title="Research Paper Discovery Platform")

UPLOAD_DIR = "uploads"
GROBID_URL = os.getenv("GROBID_URL")
QDRANT_COLLECTION = "papers"

# --- Authentication settings ---
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24  # tokens are valid for 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Create Neo4j driver once, reused across the whole app
neo4j_driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
)

# Create Qdrant client once
qdrant_client = QdrantClient(
    host=os.getenv("QDRANT_HOST"),
    port=int(os.getenv("QDRANT_PORT"))
)

# Create Gemini client once
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Load embedding model once at server startup
print("Loading embedding model... (this takes a bit of time the first time)")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Embedding model loaded!")

# Create the Qdrant collection if it doesn't already exist
try:
    qdrant_client.get_collection(QDRANT_COLLECTION)
except Exception:
    qdrant_client.create_collection(
        collection_name=QDRANT_COLLECTION,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )


def get_postgres_connection():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )


# ============================================================
# AUTHENTICATION HELPERS
# ============================================================

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: int, username: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "username": username, "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    """Decodes the JWT token and returns the current user's id and username.
    Raises an error if the token is missing or invalid."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        username = payload.get("username")
        if user_id is None:
            raise credentials_exception
        return {"user_id": int(user_id), "username": username}
    except JWTError:
        raise credentials_exception


@app.post("/signup")
def signup(request: SignupRequest):
    """Registers a new user account"""
    conn = get_postgres_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE username = %s OR email = %s;", (request.username, request.email))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Username or email is already registered")

    hashed = hash_password(request.password)
    cur.execute(
        "INSERT INTO users (username, email, hashed_password) VALUES (%s, %s, %s) RETURNING id;",
        (request.username, request.email, hashed)
    )
    user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    token = create_access_token(user_id, request.username)
    return {"message": "Account created successfully", "access_token": token, "token_type": "bearer"}


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Logs in an existing user and returns an access token"""
    conn = get_postgres_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, username, hashed_password FROM users WHERE username = %s;", (form_data.username,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row or not verify_password(form_data.password, row[2]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    user_id, username, _ = row
    token = create_access_token(user_id, username)
    return {"access_token": token, "token_type": "bearer"}


# ============================================================
# PROJECT ENDPOINTS
# ============================================================

class ProjectCreateRequest(BaseModel):
    name: str
    description: str = ""


@app.post("/projects")
def create_project(request: ProjectCreateRequest, current_user: dict = Depends(get_current_user)):
    """Creates a new project (workspace) for the current user"""
    conn = get_postgres_connection()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO projects (user_id, name, description) VALUES (%s, %s, %s) RETURNING id, created_at;",
        (current_user["user_id"], request.name, request.description)
    )
    project_id, created_at = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        "message": "Project created successfully",
        "project_id": project_id,
        "name": request.name,
        "description": request.description,
        "created_at": str(created_at)
    }


@app.get("/projects")
def list_projects(current_user: dict = Depends(get_current_user)):
    """Lists all projects belonging to the current user, along with how many papers each one has"""
    conn = get_postgres_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT pr.id, pr.name, pr.description, pr.created_at, COUNT(p.id) AS paper_count
        FROM projects pr
        LEFT JOIN papers p ON p.project_id = pr.id
        WHERE pr.user_id = %s
        GROUP BY pr.id
        ORDER BY pr.created_at DESC;
        """,
        (current_user["user_id"],)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    projects = []
    for row in rows:
        projects.append({
            "project_id": row[0],
            "name": row[1],
            "description": row[2],
            "created_at": str(row[3]),
            "paper_count": row[4]
        })

    return {"projects": projects}


def verify_project_ownership(project_id: int, user_id: int):
    """Checks that the given project exists and belongs to this user. Raises an error otherwise."""
    conn = get_postgres_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM projects WHERE id = %s AND user_id = %s;", (project_id, user_id))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Project not found or you do not have access to it")


# ============================================================
# GENERAL ENDPOINTS
# ============================================================

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
        qdrant_client.get_collections()
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


def calculate_file_hash(file_path: str) -> str:
    """Calculates a SHA-256 hash of the file content, used to detect duplicate uploads"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()


def find_existing_paper_by_hash(file_hash: str, project_id: int):
    """Checks if this project already has a paper with this exact file hash"""
    conn = get_postgres_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, title FROM papers WHERE file_hash = %s AND project_id = %s;", (file_hash, project_id))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row:
        return {"id": row[0], "title": row[1]}
    return None


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


def save_paper_to_postgres(unique_id, filename, file_path, file_hash, parsed_data, user_id, project_id):
    conn = get_postgres_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO papers (unique_id, filename, file_path, file_hash, title, authors, abstract, user_id, project_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """,
        (
            unique_id,
            filename,
            file_path,
            file_hash,
            parsed_data.get("title"),
            parsed_data.get("authors"),
            parsed_data.get("abstract"),
            user_id,
            project_id,
        )
    )

    paper_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return paper_id


def create_paper_node_in_neo4j(paper_id, unique_id, title, authors, user_id, project_id):
    """Creates a Paper node in Neo4j, and an Author node + relationship for each author.
    The Paper node stores which user and project it belongs to."""
    with neo4j_driver.session() as session:
        session.run(
            """
            MERGE (p:Paper {paper_id: $paper_id})
            SET p.unique_id = $unique_id,
                p.title = $title,
                p.user_id = $user_id,
                p.project_id = $project_id
            """,
            paper_id=paper_id,
            unique_id=unique_id,
            title=title,
            user_id=user_id,
            project_id=project_id
        )

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


def save_embedding_to_qdrant(paper_id, title, abstract, user_id, project_id):
    """Generates an embedding for the paper's title+abstract and saves it in Qdrant,
    tagged with the owning user and project so searches can be scoped correctly."""
    text_to_embed = f"{title}. {abstract}"
    embedding = embedding_model.encode(text_to_embed).tolist()

    qdrant_client.upsert(
        collection_name=QDRANT_COLLECTION,
        points=[
            PointStruct(
                id=paper_id,
                vector=embedding,
                payload={
                    "title": title,
                    "abstract": abstract,
                    "user_id": user_id,
                    "project_id": project_id
                }
            )
        ]
    )


def build_project_filter(user_id: int, project_id: int):
    """Builds a Qdrant filter that scopes results to a specific user's specific project"""
    return {
        "must": [
            {"key": "user_id", "match": {"value": user_id}},
            {"key": "project_id", "match": {"value": project_id}}
        ]
    }


# ============================================================
# PAPER ENDPOINTS (all require login AND a project_id)
# ============================================================

@app.post("/upload")
async def upload_paper(project_id: int, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed"}

    user_id = current_user["user_id"]
    verify_project_ownership(project_id, user_id)

    unique_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_DIR}/{unique_id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_hash = calculate_file_hash(file_path)
    existing_paper = find_existing_paper_by_hash(file_hash, project_id)

    if existing_paper:
        os.remove(file_path)
        return {
            "message": "This paper has already been uploaded to this project.",
            "existing_paper_id": existing_paper["id"],
            "existing_paper_title": existing_paper["title"]
        }

    parsed_data = parse_pdf_with_grobid(file_path)

    if "error" in parsed_data:
        return {
            "message": "File uploaded but parsing failed",
            "filename": file.filename,
            "saved_as": file_path,
            "parsed_data": parsed_data
        }

    paper_id = save_paper_to_postgres(unique_id, file.filename, file_path, file_hash, parsed_data, user_id, project_id)

    create_paper_node_in_neo4j(
        paper_id,
        unique_id,
        parsed_data.get("title"),
        parsed_data.get("authors", []),
        user_id,
        project_id
    )

    save_embedding_to_qdrant(
        paper_id,
        parsed_data.get("title", ""),
        parsed_data.get("abstract", ""),
        user_id,
        project_id
    )

    return {
        "message": "File uploaded, parsed, saved, added to knowledge graph, and indexed for search",
        "paper_id": paper_id,
        "project_id": project_id,
        "filename": file.filename,
        "saved_as": file_path,
        "parsed_data": parsed_data
    }


@app.get("/papers")
def get_all_papers(project_id: int, current_user: dict = Depends(get_current_user)):
    """Returns only the papers belonging to the given project (owned by the current user)"""
    verify_project_ownership(project_id, current_user["user_id"])

    conn = get_postgres_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, unique_id, filename, title, authors, abstract, uploaded_at FROM papers WHERE project_id = %s ORDER BY uploaded_at DESC;",
        (project_id,)
    )
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


@app.get("/search")
def semantic_search(query: str, project_id: int, limit: int = 5, current_user: dict = Depends(get_current_user)):
    """Meaning-based search - only searches within the given project"""
    verify_project_ownership(project_id, current_user["user_id"])

    query_embedding = embedding_model.encode(query).tolist()

    results = qdrant_client.query_points(
        collection_name=QDRANT_COLLECTION,
        query=query_embedding,
        limit=limit,
        query_filter=build_project_filter(current_user["user_id"], project_id)
    ).points

    search_results = []
    for r in results:
        search_results.append({
            "paper_id": r.id,
            "score": r.score,
            "title": r.payload.get("title"),
            "abstract": r.payload.get("abstract")
        })

    return {"query": query, "results": search_results}


@app.get("/author-network")
def get_author_network(project_id: int, current_user: dict = Depends(get_current_user)):
    """Returns co-authorship network between authors, scoped to the given project"""
    verify_project_ownership(project_id, current_user["user_id"])

    with neo4j_driver.session() as session:
        paper_result = session.run(
            """
            MATCH (a:Author)-[:AUTHORED]->(p:Paper)
            WHERE p.project_id = $project_id
            RETURN p.title AS paper_title, p.paper_id AS paper_id, collect(a.name) AS authors
            ORDER BY paper_title
            """,
            project_id=project_id
        )

        collaborations_by_paper = []
        for record in paper_result:
            if len(record["authors"]) > 1:
                collaborations_by_paper.append({
                    "paper_id": record["paper_id"],
                    "paper_title": record["paper_title"] or "Untitled",
                    "authors": record["authors"],
                    "author_count": len(record["authors"])
                })

        author_result = session.run(
            """
            MATCH (a:Author)-[:AUTHORED]->(p:Paper)
            WHERE p.project_id = $project_id
            RETURN a.name AS name, count(p) AS paper_count
            ORDER BY paper_count DESC
            LIMIT 10
            """,
            project_id=project_id
        )
        top_authors = [{"name": r["name"], "paper_count": r["paper_count"]} for r in author_result]

        stats_result = session.run(
            """
            MATCH (p:Paper) WHERE p.project_id = $project_id
            WITH count(p) AS total_papers
            MATCH (a:Author)-[r:AUTHORED]->(p:Paper) WHERE p.project_id = $project_id
            RETURN total_papers, count(DISTINCT a) AS total_authors, count(r) AS total_relationships
            """,
            project_id=project_id
        )
        stats = stats_result.single()

    return {
        "summary": {
            "total_authors": stats["total_authors"] if stats else 0,
            "total_papers": stats["total_papers"] if stats else 0,
            "total_authorship_links": stats["total_relationships"] if stats else 0
        },
        "top_authors": top_authors,
        "collaborations_by_paper": collaborations_by_paper
    }


@app.get("/timeline")
def get_research_timeline(project_id: int, current_user: dict = Depends(get_current_user)):
    """Groups the given project's papers by upload month"""
    verify_project_ownership(project_id, current_user["user_id"])

    conn = get_postgres_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT 
            TO_CHAR(uploaded_at, 'YYYY-MM') AS month,
            COUNT(*) AS paper_count,
            ARRAY_AGG(title) AS titles
        FROM papers
        WHERE project_id = %s
        GROUP BY TO_CHAR(uploaded_at, 'YYYY-MM')
        ORDER BY month ASC;
        """,
        (project_id,)
    )
    rows = cur.fetchall()

    cur.close()
    conn.close()

    timeline = []
    for row in rows:
        timeline.append({
            "month": row[0],
            "paper_count": row[1],
            "titles": row[2]
        })

    return {
        "timeline": timeline,
        "total_months": len(timeline)
    }


@app.get("/ask")
def ask_question(question: str, project_id: int, context_limit: int = 3, current_user: dict = Depends(get_current_user)):
    """Takes a user question, finds relevant papers (from the given project), and generates an answer using Gemini"""
    verify_project_ownership(project_id, current_user["user_id"])

    query_embedding = embedding_model.encode(question).tolist()
    results = qdrant_client.query_points(
        collection_name=QDRANT_COLLECTION,
        query=query_embedding,
        limit=context_limit,
        query_filter=build_project_filter(current_user["user_id"], project_id)
    ).points

    if not results:
        return {"question": question, "answer": "No relevant paper was found.", "sources": []}

    context_text = ""
    sources = []
    for r in results:
        title = r.payload.get("title", "Unknown")
        abstract = r.payload.get("abstract", "")
        context_text += f"\n\nPaper Title: {title}\nAbstract: {abstract}"
        sources.append({"paper_id": r.id, "title": title, "score": r.score})

    prompt = f"""Answer the question below using only the research paper abstracts provided as context.
Only answer from the given context. If the answer is not present in the context, say "The answer to this question was not found in the given context."

Context:
{context_text}

Question: {question}

Answer:"""

    response = gemini_client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return {
        "question": question,
        "answer": response.text,
        "sources": sources
    }


@app.get("/literature-review")
def generate_literature_review(topic: str, project_id: int, paper_limit: int = 8, current_user: dict = Depends(get_current_user)):
    """Generates a structured literature review on a given topic using the given project's papers"""
    verify_project_ownership(project_id, current_user["user_id"])

    query_embedding = embedding_model.encode(topic).tolist()
    results = qdrant_client.query_points(
        collection_name=QDRANT_COLLECTION,
        query=query_embedding,
        limit=paper_limit,
        query_filter=build_project_filter(current_user["user_id"], project_id)
    ).points

    if not results:
        return {"topic": topic, "review": "No relevant papers were found for this topic.", "sources": []}

    context_text = ""
    sources = []
    for r in results:
        title = r.payload.get("title", "Unknown")
        abstract = r.payload.get("abstract", "")
        context_text += f"\n\nPaper Title: {title}\nAbstract: {abstract}"
        sources.append({"paper_id": r.id, "title": title, "score": r.score})

    prompt = f"""You are a research assistant. Using ONLY the paper abstracts provided below, write a structured literature review on the topic: "{topic}"

Structure your review with these sections:
1. Introduction - briefly introduce the topic and why it matters
2. Key Themes - summarize the main approaches/methods found across the papers
3. Common Findings - what results or conclusions do multiple papers agree on
4. Research Gaps - based on what's missing or under-explored across these papers, suggest potential gaps
5. Conclusion - a short wrap-up

Papers:
{context_text}

Write the literature review now:"""

    response = gemini_client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return {
        "topic": topic,
        "review": response.text,
        "papers_used": len(sources),
        "sources": sources
    }


@app.get("/recommend-citations")
def recommend_citations(paper_id: int, project_id: int, limit: int = 5, current_user: dict = Depends(get_current_user)):
    """Given a paper already in the given project, recommends other similar papers from that same project"""
    verify_project_ownership(project_id, current_user["user_id"])

    stored_points = qdrant_client.retrieve(
        collection_name=QDRANT_COLLECTION,
        ids=[paper_id],
        with_vectors=True
    )

    if not stored_points:
        return {"error": f"No paper found with paper_id {paper_id}"}

    source_paper = stored_points[0]

    if source_paper.payload.get("user_id") != current_user["user_id"] or source_paper.payload.get("project_id") != project_id:
        raise HTTPException(status_code=403, detail="You do not have access to this paper")

    source_vector = source_paper.vector

    results = qdrant_client.query_points(
        collection_name=QDRANT_COLLECTION,
        query=source_vector,
        limit=limit + 1,
        query_filter=build_project_filter(current_user["user_id"], project_id)
    ).points

    recommendations = []
    for r in results:
        if r.id != paper_id:
            recommendations.append({
                "paper_id": r.id,
                "score": r.score,
                "title": r.payload.get("title"),
                "abstract": r.payload.get("abstract")
            })

    return {
        "source_paper": {
            "paper_id": paper_id,
            "title": source_paper.payload.get("title")
        },
        "recommended_citations": recommendations[:limit]
    }


@app.get("/research-gaps")
def detect_research_gaps(project_id: int, current_user: dict = Depends(get_current_user)):
    """Analyzes all of the given project's papers together and identifies potential research gaps"""
    verify_project_ownership(project_id, current_user["user_id"])

    conn = get_postgres_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT title, abstract FROM papers WHERE project_id = %s AND title IS NOT NULL;",
        (project_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if len(rows) < 2:
        return {
            "message": "Not enough papers to detect meaningful research gaps. Upload at least 2-3 papers on a related topic first.",
            "gaps": None
        }

    context_text = ""
    paper_titles = []
    for title, abstract in rows:
        context_text += f"\n\nPaper Title: {title}\nAbstract: {abstract}"
        paper_titles.append(title)

    prompt = f"""You are a research analyst. Below are the titles and abstracts of {len(rows)} research papers collected by a researcher.

Analyze these papers TOGETHER as a collection and identify potential RESEARCH GAPS - meaning:
- Topics, methods, or combinations that appear under-explored across these papers
- Limitations that multiple papers share in common
- Directions that seem like natural next steps but haven't been covered
- Missing comparisons or datasets that could strengthen this body of work

Structure your response as:
1. Summary of the Collection - what this set of papers is broadly about
2. Identified Research Gaps - a numbered list of specific, actionable gaps
3. Suggested Future Directions - brief suggestions on what could be explored next

Papers:
{context_text}

Provide your analysis now:"""

    response = gemini_client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return {
        "papers_analyzed": len(rows),
        "paper_titles": paper_titles,
        "gap_analysis": response.text
    }