from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from the backend folder's .env file
backend_dir = Path(__file__).resolve().parent.parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter(tags=["chat"])

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print(f"Warning: GEMINI_API_KEY not found. Checked: {env_path}")


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str


SYSTEM_PROMPT = """You are an Islamic finance assistant.
Only answer questions about Islamic financial calculators, Shariah-compliant finance, and related financial topics.
If the question is unrelated, respond with exactly: "I can only assist with Islamic finance and related topics."
Be concise and helpful."""


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint that proxies requests to Gemini API.
    Keeps API key secure on the server side.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Chat service is not configured. Please set GEMINI_API_KEY environment variable."
        )
    
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        
        # Build conversation history for context
        history_text = ""
        for msg in request.history:
            role = "User" if msg.role == "user" else "Assistant"
            history_text += f"{role}: {msg.text}\n"
        
        # Create the prompt with system instruction and history
        full_prompt = f"""{SYSTEM_PROMPT}

Conversation history:
{history_text}

User: {request.message}

Please respond helpfully:"""
        
        response = model.generate_content(full_prompt)
        reply = response.text.strip()
        
        return ChatResponse(reply=reply)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )