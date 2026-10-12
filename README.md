# 🧠 SynapsGraph AI — Intelligent Research Paper Discovery & Knowledge Graph Platform 

> An AI-powered platform for uploading, parsing, organizing, and analyzing research papers using **Semantic Search**, **Knowledge Graphs**, **Citation Recommendations**, **Literature Reviews**, and **Research Gap Analysis** — all from your own paper library.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Start Infrastructure Services (Docker)](#2-start-infrastructure-services-docker)
  - [3. Initialize the PostgreSQL Database](#3-initialize-the-postgresql-database)
  - [4. Set Up the Backend](#4-set-up-the-backend)
  - [5. Set Up the Frontend](#5-set-up-the-frontend)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

**SynapsGraph AI** is a full-stack research paper management platform. Researchers can upload PDF papers, which are automatically parsed (via GROBID), stored across multiple databases, embedded for vector search, and connected in a knowledge graph. The platform then exposes AI-powered features such as semantic search, automatic literature reviews, citation recommendations, research gap detection, and a comparison table — all powered by **Google Gemini** and **sentence-transformers**.

---

## Features

| Feature | Description |
|---|---|
| 📄 **PDF Upload & Parsing** | Upload research papers as PDFs. GROBID extracts title, authors, abstract, venue, year, and full text. |
| 🔍 **Semantic Search** | Search your paper library by meaning, not just keywords, using vector embeddings (all-MiniLM-L6-v2). |
| 🕸️ **Knowledge Graph** | Papers and authors are stored as nodes in Neo4j with AUTHORED and SIMILAR_TO relationships. |
| 🤖 **AI Q&A Chat** | Ask natural-language questions about your papers. Gemini generates answers grounded in your library. |
| 📊 **Comparison Table** | Auto-generated side-by-side comparison of papers: datasets, methods, results, and gaps (Gemini-powered). |
| 📚 **Literature Review** | Generate a structured literature review on any topic using your uploaded papers. |
| 💡 **Citation Recommendations** | Get recommended papers to cite based on semantic similarity within your project. |
| 🔬 **Research Gap Detection** | AI analyzes your entire paper collection and identifies under-explored areas and future directions. |
| 👥 **Author Analytics** | View co-authorship networks, top authors, and collaboration patterns from Neo4j. |
| 📈 **Research Trends / Timeline** | Visualize when papers were uploaded, grouped by month. |
| 🌐 **Multi-language Support** | AI answers can be translated to multiple languages via Gemini. |
| 🔐 **User Authentication** | JWT-based signup/login with bcrypt password hashing. |
| 📁 **Workspace / Projects** | Organize papers into separate workspaces (projects) — all data is scoped per project. |
| 🌙 **Dark Mode** | Full light/dark theme toggle across the UI. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                  │
│               Port 3000 → Proxy → Backend :8000                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                     REST API (FastAPI)
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
   ┌─────▼─────┐     ┌──────▼──────┐     ┌──────▼──────┐
   │ PostgreSQL │     │    Neo4j    │     │   Qdrant    │
   │   :5432    │     │   :7687    │     │   :6333     │
   │ (metadata) │     │  (graph)   │     │ (vectors)   │
   └────────────┘     └────────────┘     └─────────────┘
         │                                      │
   ┌─────▼─────┐                         ┌──────▼──────┐
   │   Redis    │                         │   GROBID    │
   │   :6379    │                         │   :8070     │
   │  (cache)   │                         │ (PDF parse) │
   └────────────┘                         └─────────────┘
         │
   ┌─────▼──────────────┐    ┌──────────────────────────┐
   │  Google Gemini API  │    │  OpenAlex API (metadata) │
   │  (LLM analysis)    │    │  (venue, year enrichment)│
   └─────────────────────┘    └──────────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.10+** | Runtime |
| **FastAPI** | REST API framework |
| **PostgreSQL 16** | Relational data (users, papers, projects) |
| **Neo4j 5** | Graph database (author networks, paper similarity) |
| **Qdrant** | Vector database (semantic search embeddings) |
| **Redis 7** | Caching layer |
| **GROBID 0.8.1** | PDF parsing and metadata extraction |
| **Sentence-Transformers** | Embedding model (`all-MiniLM-L6-v2`, 384-dim) |
| **Google Gemini API** | LLM for analysis, literature review, gap detection |
| **OpenAlex API** | External metadata enrichment (venue, year) |
| **PyTorch** | Embedding model backend |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite 5** | Build tool and dev server |
| **Tailwind CSS 3** | Utility-first CSS framework |
| **Axios** | HTTP client |
| **Framer Motion** | Animations and transitions |
| **Recharts** | Data visualization / charts |
| **Lucide React** | Icon library |

---

## Prerequisites

Make sure you have the following installed on your machine:

| Tool | Version | Installation |
|---|---|---|
| **Docker** & **Docker Compose** | Latest | [docker.com](https://docs.docker.com/get-docker/) |
| **Python** | 3.10 or higher | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ (LTS recommended) | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ (comes with Node.js) | Bundled with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **Google Gemini API Key** | — | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

---

## Project Structure

```
final-year-project/
├── backend/
│   ├── main.py                  # FastAPI application (all routes & logic)
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Environment variables (DO NOT commit)
│   ├── .env.example             # Template for environment variables
│   ├── uploads/                 # Uploaded PDF files (auto-created)
│   └── sample_papers/           # Sample PDFs for testing
│
├── frontend/
│   ├── index.html               # HTML entry point
│   ├── package.json             # Node.js dependencies & scripts
│   ├── vite.config.js           # Vite config (dev server, proxy)
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Root component (routing & layout)
│       ├── index.css            # Global styles
│       ├── context/
│       │   ├── AuthContext.jsx       # Authentication state
│       │   └── WorkspaceContext.jsx  # Workspace/project state
│       ├── services/
│       │   └── api.js               # Axios API client & service layers
│       ├── components/
│       │   └── layout/
│       │       ├── Sidebar.jsx       # Dashboard sidebar navigation
│       │       └── Navbar.jsx        # Top navigation bar
│       └── views/
│           ├── LandingPage.jsx            # Public landing page
│           ├── AuthPage.jsx               # Login / Signup page
│           ├── WorkspacePage.jsx          # Workspace selection
│           ├── PdfUploadPage.jsx          # PDF upload interface
│           ├── ProcessingScreen.jsx       # Upload processing animation
│           ├── DashboardHome.jsx          # Dashboard overview
│           ├── ResearchPapersView.jsx     # Paper library browser
│           ├── ComparisonTableView.jsx    # Paper comparison table
│           ├── SemanticSearchView.jsx     # Semantic search interface
│           ├── AiChatView.jsx             # AI Q&A chat
│           ├── KnowledgeGraphView.jsx     # Knowledge graph visualization
│           ├── CitationRecommendationView.jsx  # Citation suggestions
│           ├── LiteratureReviewView.jsx   # Literature review generator
│           ├── ResearchTrendsView.jsx     # Upload timeline chart
│           ├── ResearchGapsView.jsx       # Research gap analysis
│           ├── AuthorAnalyticsView.jsx    # Author network analytics
│           ├── AnalyticsView.jsx          # General analytics
│           └── SettingsView.jsx           # App settings & theme toggle
│
├── docker-compose.yml           # Docker services (Postgres, Neo4j, Qdrant, Redis, GROBID)
└── .gitignore
```

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/final-year-project.git
cd final-year-project
```

### 2. Start Infrastructure Services (Docker)

All 5 infrastructure services are defined in `docker-compose.yml`. Start them with:

```bash
docker compose up -d
```

This will pull and start:

| Service | Container Name | Port(s) |
|---|---|---|
| **PostgreSQL 16** | `research_postgres` | `5432` |
| **Neo4j 5** | `research_neo4j` | `7474` (browser), `7687` (bolt) |
| **Qdrant** | `research_qdrant` | `6333` |
| **Redis 7** | `research_redis` | `6379` |
| **GROBID 0.8.1** | `research_grobid` | `8070` |

Verify all containers are running:

```bash
docker compose ps
```

> **Note:** GROBID may take 30–60 seconds to fully initialize. Wait until all containers show `healthy` or `running` status.

### 3. Initialize the PostgreSQL Database

Connect to the PostgreSQL container and create the required tables:

```bash
docker exec -it research_postgres psql -U research_user -d research_db
```

Then run the following SQL:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Projects (Workspaces) table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Papers table
CREATE TABLE IF NOT EXISTS papers (
    id SERIAL PRIMARY KEY,
    unique_id VARCHAR(100) NOT NULL,
    filename VARCHAR(500),
    file_path TEXT,
    file_hash VARCHAR(64),
    title TEXT,
    authors TEXT[],
    abstract TEXT,
    full_text TEXT,
    venue TEXT,
    publication_year VARCHAR(10),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Exit psql
\q
```

### 4. Set Up the Backend

```bash
cd backend
```

#### a) Create a Python virtual environment

```bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Windows (CMD)
python -m venv venv
venv\Scripts\activate.bat
```

#### b) Install Python dependencies

```bash
pip install -r requirements.txt
```

> **Important:** The following packages are required but may not be listed in `requirements.txt`. Install them manually if you get import errors:
>
> ```bash
> pip install google-genai passlib python-jose[cryptography] python-multipart
> ```

#### c) Configure environment variables

```bash
# Copy the template and fill in your values
cp .env.example .env
```

Open `.env` and set your **Gemini API Key** and a **JWT Secret Key**:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
JWT_SECRET_KEY=your_random_secret_string_here
```

You can generate a secure JWT secret with:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

> **Tip:** Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

#### d) Create the uploads directory

```bash
mkdir -p uploads
```

### 5. Set Up the Frontend

```bash
cd ../frontend
```

#### a) Install Node.js dependencies

```bash
npm install
```

---

## Running the Application

You need **two terminal windows** — one for the backend, one for the frontend.

### Terminal 1 — Start the Backend

```bash
cd backend
source venv/bin/activate    # (or the Windows equivalent)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The first startup will take a minute to download the `all-MiniLM-L6-v2` embedding model (~80 MB).

Once ready, you'll see:

```
Embedding model loaded!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2 — Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start at:

```
http://localhost:3000
```

### Verify Everything Works

1. Open **http://localhost:3000** in your browser.
2. Create an account on the signup page.
3. Create a new workspace (project).
4. Upload a research paper (PDF).
5. Explore the dashboard features!

You can also check backend health at:

```
http://localhost:8000/health
```

This returns the connection status of all infrastructure services:

```json
{
  "postgres": "connected",
  "neo4j": "connected",
  "qdrant": "connected",
  "redis": "connected"
}
```

---

## Environment Variables

All backend environment variables are defined in `backend/.env`. Here's the full reference:

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DB` | PostgreSQL database name | `research_db` |
| `POSTGRES_USER` | PostgreSQL username | `research_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `research_pass` |
| `NEO4J_URI` | Neo4j Bolt connection URI | `bolt://localhost:7687` |
| `NEO4J_USER` | Neo4j username | `neo4j` |
| `NEO4J_PASSWORD` | Neo4j password | `abc12345678` |
| `QDRANT_HOST` | Qdrant vector DB host | `localhost` |
| `QDRANT_PORT` | Qdrant vector DB port | `6333` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `GROBID_URL` | GROBID service URL | `http://localhost:8070` |
| `GEMINI_API_KEY` | Google Gemini API key | *(required — get from Google)* |
| `JWT_SECRET_KEY` | Secret key for JWT signing | *(required — generate a strong key)* |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/signup` | Register a new user |
| `POST` | `/login` | Login and receive a JWT token |

### Projects / Workspaces
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/projects` | Create a new project |
| `GET` | `/projects` | List all projects for the logged-in user |

### Papers
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload?project_id=<id>` | Upload a PDF to a project |
| `GET` | `/papers?project_id=<id>` | List all papers in a project |

### Search & Analysis
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/search?query=<q>&project_id=<id>` | Semantic search across papers |
| `GET` | `/ask?question=<q>&project_id=<id>` | Ask an AI question about your papers |
| `GET` | `/literature-review?topic=<t>&project_id=<id>` | Generate a literature review |
| `GET` | `/recommend-citations?paper_id=<id>&project_id=<id>` | Get citation recommendations |
| `GET` | `/research-gaps?project_id=<id>` | Detect research gaps in your collection |
| `GET` | `/comparison-table?project_id=<id>` | Generate a paper comparison table |

### Network & Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/author-network?project_id=<id>` | Get co-authorship network data |
| `GET` | `/paper-similarity-network?project_id=<id>` | Get paper similarity graph |
| `GET` | `/timeline?project_id=<id>` | Get paper upload timeline |

### System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check (basic) |
| `GET` | `/health` | Detailed infrastructure health check |

> **Note:** All endpoints (except `/`, `/health`, `/signup`, `/login`) require a valid JWT Bearer token in the `Authorization` header.

---

## Troubleshooting

### Docker containers not starting
```bash
# Check container logs
docker compose logs <service-name>

# Example:
docker compose logs postgres
docker compose logs grobid
```

### Port conflicts
If a port (e.g., 5432) is already in use:
```bash
# Find the process using the port
lsof -i :5432    # macOS/Linux
netstat -ano | findstr :5432    # Windows

# Kill the process or change the port in docker-compose.yml
```

### GROBID not responding
GROBID takes 30–60 seconds to initialize. Check if it's ready:
```bash
curl http://localhost:8070/api/isalive
```

### "ModuleNotFoundError" on backend startup
Install any missing packages:
```bash
pip install google-genai passlib python-jose[cryptography] python-multipart
```

### Embedding model download hangs
The `all-MiniLM-L6-v2` model is downloaded on first run (~80 MB). Ensure you have a stable internet connection. The model is cached in `~/.cache/torch/sentence_transformers/` for subsequent runs.

### Frontend proxy errors (502 / ECONNREFUSED)
Make sure the backend is running on port `8000` before starting the frontend. The Vite dev server proxies API calls to `http://localhost:8000`.

### Neo4j authentication failed
The default password set in `docker-compose.yml` is `abc12345678`. Ensure `NEO4J_PASSWORD` in your `.env` matches. You can also access the Neo4j Browser at `http://localhost:7474` to verify.

### Resetting all data
To wipe all databases and start fresh:
```bash
docker compose down -v    # Removes containers AND volumes
docker compose up -d      # Recreate everything
```
Then re-run the PostgreSQL table creation SQL from [Step 3](#3-initialize-the-postgresql-database).

---

## License

This project was developed as a **Final Year Project**. Please contact the repository owner for licensing inquiries.
