import os
import json
import numpy as np
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.embedding_generator import get_embedding
from app.pdf_extractor import extract_text_from_pdf
import supabase
from app.gemini_summary import call_gemini_api

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
print(SUPABASE_KEY)
supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

routes = Blueprint("routes", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"pdf"}

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@routes.route("/test-embedding/", methods=["POST"])
def test_embedding():
    text = None
    filename = None

    if request.content_type.startswith("multipart/form-data"):
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected for uploading"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Allowed file type is pdf"}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        try:
            text = extract_text_from_pdf(file_path)
        except Exception as e:
            return jsonify({"error": f"Error extracting text from PDF: {str(e)}"}), 500

    elif request.content_type.startswith("application/json"):
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        filename = data.get("filename", "sample.txt")
        text = data.get("text")
    else:
        return jsonify({"error": "Unsupported Media Type"}), 415

    if not text or not text.strip():
        return jsonify({"error": "No text provided or extracted"}), 400

    try:
        embedding = get_embedding(text)  # Get vector embedding
    except Exception as e:
        return jsonify({"error": f"Error generating embedding: {str(e)}"}), 500

    # Store in Supabase
    try:
        response = supabase_client.table("research_paper_embeddings").insert({
            "filename": filename,
            "content": text,
            "embedding": embedding.tolist(),  # Convert NumPy array to list
        }).execute()
        return jsonify({"message": "Embedding stored successfully", "data": response.data}), 200
    except Exception as e:
        return jsonify({"error": f"Supabase error: {str(e)}"}), 500

    

@routes.route("/query-gemini/", methods=["POST"])
def query_gemini():
    """
    1️⃣ Takes user query.
    2️⃣ Converts query into an embedding.
    3️⃣ Finds similar embeddings in Supabase.
    4️⃣ Passes retrieved context to Gemini AI.
    """
    try:
        data = request.get_json()
        if not data or "query" not in data:
            return jsonify({"error": "No query provided"}), 400

        query_text = data["query"]
        query_embedding = get_embedding(query_text)  # Generate embedding for query

        # 🔍 Search for similar embeddings using Supabase
        response = (
            supabase_client.rpc("match_research_papers", 
                {"query_embedding": query_embedding.tolist(), "match_threshold": 0.75, "match_count": 5}
            ).execute()
        )

        
        # Extract matched research papers
        matching_papers = response.data

        # 🧠 Prepare context for Gemini
        context = "\n\n".join([f"{paper['filename']}: {paper['content']}" for paper in matching_papers])

        # 🔥 Call Gemini API (implement this next)
        gemini_response = call_gemini_api(query_text, context)

        return jsonify({
            "query": query_text,
            "matching_papers": matching_papers,
            "gemini_response": gemini_response
        })

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
