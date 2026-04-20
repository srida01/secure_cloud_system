from fastapi import FastAPI, UploadFile, File
from kurse_engine import ask, ingest_pdf, delete_pdf

app = FastAPI()

@app.get("/")
def home():
    return {"message": "NITK Assist AI Service Running"}

@app.post("/ask")
async def ask_question(data: dict):
    question = data["question"]
    response = ask(question)
    return {"answer": response}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as f:
        f.write(await file.read())

    result = ingest_pdf(file_location)

    return {"status": "success", "message": result}


@app.post("/delete")
async def delete_document(data: dict):

    doc_id = data["doc_id"]

    result = delete_pdf(doc_id)

    return {"status": "deleted", "doc_id": doc_id}