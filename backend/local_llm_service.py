import os
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List

class LocalLLMService:
    """
    Offline Local LLM Inference Engine for Llama-3.2-3B-Instruct / Qwen.
    Connects to local Ollama instance (http://localhost:11434) or llama-cpp server
    with zero cloud token dependency and zero API costs.
    """
    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "llama3.2:3b"):
        self.base_url = os.getenv("LOCAL_LLM_URL", base_url)
        self.model_name = os.getenv("LOCAL_LLM_MODEL", model_name)

    def is_available(self) -> bool:
        """Checks if local Ollama or llama-cpp server is actively running."""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags", method="GET")
            with urllib.request.urlopen(req, timeout=1.5) as res:
                return res.status == 200
        except Exception:
            return False

    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.3) -> Optional[str]:
        """Generates text from local Llama-3.2-3B-Instruct instance."""
        if not self.is_available():
            return None

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": 1024
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            req = urllib.request.Request(
                f"{self.base_url}/api/generate",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=45) as res:
                if res.status == 200:
                    data = json.loads(res.read().decode("utf-8"))
                    return data.get("response", "").strip()
        except Exception as e:
            print(f"[LocalLLMService] Inference failed: {e}")
            return None

        return None

    def summarize_chapter_and_generate_cards(self, chapter_title: str, chapter_content: str, subject: str) -> Optional[Dict[str, Any]]:
        """Generates structured summary and 3 flashcards using local model."""
        prompt = f"""You are an expert curriculum summarizer for {subject}.
Analyze the following section:
Title: {chapter_title}
Content:
{chapter_content[:3000]}

Generate a valid JSON object with EXACTLY this structure:
{{
  "summary": "2-3 sentence overview of governing principles",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "cards": [
    {{
      "topic": "{chapter_title}",
      "question": "Clear conceptual question",
      "answer": "• Core Principle: ...\\n• Governing Rule: ...\\n• Application: ..."
    }},
    {{
      "topic": "{chapter_title}",
      "question": "Another conceptual or formula question",
      "answer": "• Key Takeaway: ...\\n• Mechanism: ...\\n• Common Pitfall: ..."
    }},
    {{
      "topic": "{chapter_title}",
      "question": "Third critical question",
      "answer": "• Definition: ...\\n• Mathematical/Physical Intuition: ...\\n• Impact: ..."
    }}
  ]
}}
Respond ONLY with the raw JSON object, no Markdown backticks or commentary."""

        response_text = self.generate(prompt=prompt, system_prompt="You are a JSON-only curriculum generator.")
        if not response_text:
            return None

        try:
            # Clean markdown wrappers if any
            clean_json = response_text.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            return json.loads(clean_json.strip())
        except Exception as e:
            print(f"[LocalLLMService] JSON parsing failed: {e}")
            return None

# Global instance
local_llm = LocalLLMService()
