import requests
import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

API_KEY = os.getenv("OPENROUTER_API_KEY")

def get_ai_response(request, analytics_data):
    """Accepts the request object and analytics dict from main.py"""
    prompt = request.message
    role = request.role

    if not API_KEY:
        return "OPENROUTER_API_KEY not configured."

    # Build analytics context
    context = (
        f"Total Revenue: ${analytics_data.get('total_revenue', 0):.2f}\n"
        f"Strongest Branch: {analytics_data.get('strong_branch', 'N/A')}\n"
        f"Weakest Branch: {analytics_data.get('weak_branch', 'N/A')}\n"
    )

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost"
    }

    data = {
        "model": "meta-llama/llama-3-8b-instruct",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a professional banquet revenue strategist and AI operations expert.\n"
                    "Your goal is to provide high-impact, data-driven revenue insights.\n\n"
                    "STRICT FORMATTING RULES:\n"
                    "1. Respond with EXTREME BREVITY. Use only short, punchy sentences.\n"
                    "2. Use Markdown headers (###) for sections.\n"
                    "3. Use standard bullet points (-) for lists.\n"
                    "4. MAXIMUM 2 points per section.\n\n"
                    "REQUIRED STRUCTURE:\n"
                    "### 📊 Executive Insight\n"
                    "- [One-sentence strategic summary of the overall portfolio status]\n"
                    "### 🎯 Key Branch Focus\n"
                    "- [Identify one specific branch and what it needs most]\n"
                    "### ⚡ Immediate Actions\n"
                    "- [Action item 1: High priority]\n"
                    "- [Action item 2: Quick win]\n"
                    "### 🚀 Growth Opportunity\n"
                    "- [One sentence on a long-term potential for scaling revenue]\n\n"
                    "Do not repeat exact numbers from analytics data unless providing a specific relative comparison."
                )
            },
            {
                "role": "user",
                "content": f"User Role: {role}\nAnalytics Data:\n{context}\n\n{prompt}"
            }
        ],
        "temperature": 0.4,
        "max_tokens": 300
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=60
        )

        if response.status_code != 200:
            return f"AI service error: {response.text}"

        return response.json()["choices"][0]["message"]["content"]

    except Exception as e:
        return f"AI service exception: {str(e)}"