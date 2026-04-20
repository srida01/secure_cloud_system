import chromadb
from sentence_transformers import SentenceTransformer
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

# embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')

# vector db
client = chromadb.Client(
    chromadb.config.Settings(
        persist_directory="./chroma_db"
    )
)
collection = client.get_or_create_collection(name="nitk_docs")

# groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ingest_pdf(file_path):

    loader = PyPDFLoader(file_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_documents(docs)

    for i, chunk in enumerate(chunks):

        embedding = model.encode(chunk.page_content).tolist()

        collection.add(
            documents=[chunk.page_content],
            embeddings=[embedding],
            ids=[f"{file_path}_{i}"]
        )

    return f"{len(chunks)} chunks indexed"


def ask(question):

    query_embedding = model.encode(question).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    # ✅ check if DB has any documents
    if not results["documents"] or not results["documents"][0]:
        return "No documents found. Please upload PDFs."

    context = "\n".join(results["documents"][0])

    prompt = f"""
    Answer the question using the context below.

    Context:
    {context}

    Question:
    {question}
    """

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


def delete_pdf(doc_id):

    collection.delete(ids=[doc_id])

    return "deleted"