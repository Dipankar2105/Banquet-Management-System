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
                    "You are the Lead Business Strategist for 'Prasad Food Divine' - a premium hospitality and banquet brand.\n\n"
                    "Your job is to provide high-fidelity, data-driven advisor insights. You are NOT a generic AI; you are a sharp, strategic partner who understands the specific brand value of Prasad Food Divine.\n\n"
                    "You must:\n"
                    "• Use actual data from the provided analytics context.\n"
                    "• Refer to specific Prasad Food Divine branches by name.\n"
                    "• Focus on high-impact metrics (Revenue growth, Inventory efficiency, Lead conversion rates).\n"
                    "• Avoid all fluff, filler, and generic advice like \"improve marketing\" or \"monitor trends\".\n"
                    "• Provide specific, implementable tactics (e.g., \"Shift inventory from Branch X to Y\", \"Increase Wedding lead follow-up frequency by 30%\").\n"
                    "• Maintain a tone that is professional, authoritative, and growth-oriented.\n\n"
                    "Response style:\n"
                    "1. Strategic Diagnosis: 2-3 sentences max on what the data reveals.\n"
                    "2. Focused Advisor Insights: 3-4 bullet points of high-fidelity, non-generic strategies.\n"
                    "3. Immediate Action Plan: Concrete, time-bound steps to drive revenue and efficiency.\n\n"
                    "Keep everything premium and executive-ready. No generic solutions."
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