import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routes import all_routes
from dotenv import load_dotenv

# Get the project root (parent of backend folder)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend folder
PROJECT_ROOT = os.path.dirname(BASE_DIR)  # project root (parent of backend)

app = FastAPI()

# CORS setup (moved up to be applied first)
origins = [
    os.getenv("AWS_DOMAIN", "http://localhost:5173")
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to frontend dist folder (parallel to backend)
frontend_dist_path = os.path.join(PROJECT_ROOT, "frontend", "dist")

# Check if the dist folder exists before mounting
if os.path.exists(frontend_dist_path):
    # Serve Vite assets
    assets_path = os.path.join(frontend_dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    
    # Catch-all for SPA
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index_path = os.path.join(frontend_dist_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Frontend not built yet"}
else:
    print(f"Warning: Frontend dist folder not found at {frontend_dist_path}")
    print("Please run 'npm run build' in your frontend folder first")

# Include all API routers
for router in all_routes:
    app.include_router(router, prefix="/api")