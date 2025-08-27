import os
import json
import traceback
from pathlib import Path
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import uvicorn

# Import the existing app.py functions
from app import extract_data_from_w9_documents, get_access_token, get_llm

# Create the FastAPI app
app = FastAPI(title="W9 Data Extraction API", version="1.0.0")

# Configure CORS - this allows the React app to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain instead of "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory for uploads if it doesn't exist
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Path to the React build directory
REACT_BUILD_DIR = Path("dist")  # This is where Vite builds the React app


class ExtractionResponse(BaseModel):
    """Response model for extraction results"""
    results: List[dict]
    success: bool
    message: str


@app.get("/api/health")
async def health_check():
    """Simple health check endpoint to verify the API is running"""
    return {"status": "healthy", "message": "W9 Extraction API is running"}


@app.post("/api/extract", response_model=ExtractionResponse)
async def extract_w9_data(files: List[UploadFile] = File(...)):
    """
    Extract data from uploaded W9 PDF files.
    
    This endpoint:
    1. Receives multiple PDF files
    2. Saves them temporarily
    3. Processes them through the W9 extraction pipeline
    4. Returns the extracted data as JSON
    """
    
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Check that all files are PDFs
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400, 
                detail=f"File {file.filename} is not a PDF. Only PDF files are accepted."
            )
    
    temp_file_paths = []
    
    try:
        # Save uploaded files temporarily
        for upload_file in files:
            # Create a safe filename
            safe_filename = f"{upload_file.filename}"
            file_path = UPLOAD_DIR / safe_filename
            
            # Write the file to disk
            with open(file_path, "wb") as buffer:
                content = await upload_file.read()
                buffer.write(content)
            
            temp_file_paths.append(str(file_path))
        
        # Get Azure access token and initialize LLM
        print("Getting Azure access token...")
        access_token = get_access_token()
        llm = get_llm(access_token)
        
        # Process the files through the extraction pipeline
        print(f"Processing {len(temp_file_paths)} files...")
        extraction_results = extract_data_from_w9_documents(temp_file_paths, llm)
        
        # Format the results for the frontend
        formatted_results = []
        for result in extraction_results:
            formatted_results.append({
                "filename": Path(result["file"]).name,
                "data": result["response"],
                "success": "error" not in result["response"]
            })
        
        return ExtractionResponse(
            results=formatted_results,
            success=True,
            message=f"Successfully processed {len(formatted_results)} files"
        )
    
    except Exception as e:
        # Log the full error for debugging
        print(f"Error during extraction: {str(e)}")
        print(traceback.format_exc())
        
        # Return a user-friendly error message
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during extraction: {str(e)}"
        )
    
    finally:
        # Clean up temporary files
        for file_path in temp_file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Warning: Could not delete temporary file {file_path}: {e}")


# Serve the React app - this must come after API routes
if REACT_BUILD_DIR.exists():
    # Mount the static files (JS, CSS, images, etc.)
    app.mount("/assets", StaticFiles(directory=str(REACT_BUILD_DIR / "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """Serve the React app for all non-API routes"""
        # If requesting the root or any route, serve index.html
        # React Router will handle client-side routing
        index_path = REACT_BUILD_DIR / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        else:
            raise HTTPException(status_code=404, detail="React app not built yet")
else:
    @app.get("/")
    async def root():
        """Fallback when React app is not built"""
        return {
            "message": "React app not built yet. Run 'npm run build' to build the frontend.",
            "api_status": "API is running",
            "endpoints": ["/api/health", "/api/extract"]
        }


if __name__ == "__main__":
    # Run the server
    # In production, you might want to use a production ASGI server like Gunicorn
    port = int(os.getenv("PORT", 8000))
    
    print(f"Starting W9 Extraction API server on port {port}")
    print(f"API docs available at: http://localhost:{port}/docs")
    print(f"Health check at: http://localhost:{port}/api/health")
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=port,
        reload=True  # Set to False in production
    )