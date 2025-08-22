import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
import requests
import os
from dotenv import load_dotenv

# Load environment variables from the same .env file as app.py
load_dotenv()

# Supabase credentials (same as in app.py)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_pdf_text(pdf_path: str) -> str:
    """Extract text from PDF file."""
    try:
        pdf_document = fitz.open(pdf_path)
        full_text = ""
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            full_text += f"\n=== Page {page_num + 1} ===\n{page.get_text()}"
        pdf_document.close()
        return full_text
    except Exception as e:
        print(f"Error extracting text: {e}")
        return None

def create_embeddings(text: str) -> tuple:
    """Create vector embeddings from text."""
    try:
        chunks = [chunk for chunk in text.split('\n=== Page ') if chunk.strip()]
        chunks = [f"=== Page {chunk}" for chunk in chunks]
        embeddings = embedding_model.encode(chunks, convert_to_numpy=True)
        return embeddings, chunks
    except Exception as e:
        print(f"Error creating embeddings: {e}")
        return None, None

def store_in_supabase(embeddings, chunks):
    """Store embeddings and text in Supabase."""
    try:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        
        for chunk, embedding in zip(chunks, embeddings):
            data = {
                "content": chunk,
                "embedding": embedding.tolist()
            }
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/pdf_embeddings",
                headers=headers,
                json=data
            )
            if response.status_code == 201:
                print(f"Successfully stored chunk: {chunk[:50]}...")
            else:
                print(f"Failed to store chunk: {response.text}")
    except Exception as e:
        print(f"Error storing in Supabase: {e}")

def process_pdf(pdf_path: str):
    """Main function to process PDF and store in Supabase."""
    # Extract text
    text = extract_pdf_text(pdf_path)
    if not text:
        print("Failed to extract text from PDF")
        return
    
    # Create embeddings
    embeddings, chunks = create_embeddings(text)
    if embeddings is None or chunks is None:
        print("Failed to create embeddings")
        return
    
    # Store in Supabase
    store_in_supabase(embeddings, chunks)
    print(f"Processed PDF: {pdf_path}")

if __name__ == "__main__":
    # Example usage
    pdf_file_path = "refpap.pdf"
    if os.path.exists(pdf_file_path):
        process_pdf(pdf_file_path)
    else:
        print(f"PDF file not found: {pdf_file_path}")