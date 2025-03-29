from fastapi import FastAPI
app = FastAPI()
# Root endpoint
@app.get("/")
async def home():
    return {"message": "Welcome to the API!"}
