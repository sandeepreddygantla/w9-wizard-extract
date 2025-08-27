#!/usr/bin/env python3
"""
Simple script to start the W9 Extractor API server.
This script is for testing - in production you'd use a proper WSGI server.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Change to backend directory so imports work correctly
os.chdir(backend_dir)

# Import and run the server
from api_server import app
import uvicorn

if __name__ == "__main__":
    print("Starting W9 Extractor API Server...")
    print("Make sure you have:")
    print("1. Built the React app with 'npm run build'")
    print("2. Set up your .env file with Azure credentials")
    print("3. Installed Python dependencies with 'pip install -r requirements.txt'")
    print("")
    
    # Start the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False  # Set to True for development
    )