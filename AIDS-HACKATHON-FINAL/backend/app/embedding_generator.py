from sentence_transformers import SentenceTransformer

# Load the SPECTER model
model = SentenceTransformer("allenai/specter")

def get_embedding(text):    
    """Generates a vector embedding for the given text."""
    embedding = model.encode(text)
    return embedding

# # Example research paper text
# text = """Deep learning has significantly advanced NLP. Transformer-based architectures like BERT, GPT, and T5 have achieved state-of-the-art results in various NLP tasks. These models require large datasets and significant computational power. In this paper, we explore more efficient transformer architectures that reduce computational costs while maintaining high accuracy."""

# # Get the embedding
# embedding = get_embedding(text)

# print("Embedding shape:", embedding.shape)  # Example output: (768,)
# print("First 5 values:", embedding)  # Print first few values for preview
