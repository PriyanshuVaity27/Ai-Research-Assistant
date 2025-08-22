import google.generativeai as genai
import os
import sys # Import sys for better error handling output

# --- Configuration ---
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Error: GENAI_API_KEY environment variable not set.")
    sys.exit(1) # Exit if the key is missing

try:
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"Error configuring Generative AI: {e}")
    sys.exit(1)

MODEL_NAME = "gemini-1.5-flash"
try:
    model = genai.GenerativeModel(MODEL_NAME)
except Exception as e:
    print(f"Error creating Generative Model ({MODEL_NAME}): {e}")
    sys.exit(1)


def call_gemini_api(query: str, context: str) -> str:
    """
    Sends the user query along with relevant research paper context to the Gemini API.

    Args:
        query: The user's question.
        context: The relevant text from research papers.

    Returns:
        The text response from the Gemini model or an error message.
    """
    # --- Construct the Prompt ---
    # This prompt structure clearly separates context and the specific user query.
    full_prompt = f"""
**Enhanced RAG Prompt (Paragraph Format):**  

*"You are an AI research assistant tasked with answering user queries based **strictly** on the provided research paper context. Your response must be **precise, detailed, and well-structured**, ensuring that all information comes **exclusively** from the retrieved content. If the answer exists within the context, extract relevant details, maintaining technical accuracy while explaining key concepts, methodologies, and findings clearly. Use **exact terminology** from the research paper to ensure alignment with the original text and avoid rephrasing technical terms unless necessary for clarity. If applicable, reference equations, figures, or tables to support your response. Responses should be **informative yet concise**, avoiding unnecessary length while preserving essential technical details. If the context does **not** contain the answer, clearly state: *'The provided research context does not contain information on this topic.'* Do **not** generate information beyond what is available. Additionally, if the query contains terms slightly different from the research paper, attempt to **map them to the closest matching terms** without distorting meaning. If partial information is available, acknowledge the gap and suggest relevant keywords or topics for further research. Your goal is to provide **accurate, structured, and contextually aligned responses**, ensuring that engineering students can fully grasp the concepts without any misinformation."*  

This version ensures **strong alignment with RAG**, maintains **strict retrieval-based accuracy**, and improves **technical clarity**. Let me know if you need further refinements! 🚀

--- Research Paper Context ---
{context}
--- End of Context ---

--- User Query ---
{query}
--- End of Query ---

Answer:
"""

    # --- Call the API ---
    try:
        # Use the generate_content method with the constructed prompt
        response = model.generate_content(full_prompt)

        # --- Process the Response ---
        # Basic text extraction. For more complex scenarios (multiple candidates, safety ratings),
        # you might need to inspect response.candidates, response.prompt_feedback etc.
        if response.text:
            return response.text
        else:
            # Handle cases where the response might be blocked or empty
            # You can inspect response.prompt_feedback for reasons like safety blocks
            reason = "Unknown reason (response text is empty)"
            if response.prompt_feedback:
                reason = f"Blocked due to: {response.prompt_feedback.block_reason}"
            return f"Error: Gemini API did not return text. {reason}"

    except Exception as e:
        # Catch potential errors during the API call (network issues, invalid requests, etc.)
        print(f"Error calling Gemini API: {e}") # Print for debugging
        return f"Error calling Gemini API: {str(e)}"

# --- Example Usage (Optional) ---
if __name__ == "__main__":
    # Example context and query
    example_context = """
    Abstract: Large Language Models (LLMs) have shown remarkable capabilities in various tasks.
    Training these models often involves pre-training on vast amounts of text data followed by
    fine-tuning on specific tasks. The Transformer architecture, particularly the attention mechanism,
    is central to their success.

    Section 2: The attention mechanism allows the model to weigh the importance of different words
    in the input sequence when generating an output. This enables handling long-range dependencies.
    """
    example_query = "What mechanism is central to the success of LLMs according to the context?"

    # Call the function
    result = call_gemini_api(example_query, example_context)

    # Print the result
    print("\n--- Gemini Response ---")
    print(result)
    print("--- End of Response ---")

    print("\n--- Example: Query not in context ---")
    query_not_in_context = "What is the capital of France?"
    result_not_in_context = call_gemini_api(query_not_in_context, example_context)
    print(result_not_in_context)
    print("--- End of Response ---")