import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import all_routes
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="SafeSpend API",
    description="Islamic Finance Calculator API",
    version="1.0.0"
)

# CORS setup - allow local development and Vercel deployments
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    # Vercel deployments - add your frontend URL after deployment
    os.getenv("FRONTEND_URL", ""),
]

# Filter out empty strings
origins = [o for o in origins if o]

# Also allow any Vercel preview deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {"status": "healthy", "message": "SafeSpend API is running"}

# Include all API routers
for router in all_routes:
    app.include_router(router, prefix="/api")