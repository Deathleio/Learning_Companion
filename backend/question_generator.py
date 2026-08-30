import os
import re
import json
import uuid
from typing import Dict, List, Any, Optional

try:
    from langchain_core.messages import HumanMessage
    from langchain_google_genai import ChatGoogleGenerativeAI
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False


try:
    from backend.local_llm_service import local_llm
except ImportError:
    from local_llm_service import local_llm

class QuestionGeneratorEngine:
    """
    Enterprise Question Generation Engine (QGE).
    Synthesizes chapter summaries, flashcards, practice quizzes, and summative threshold exam questions
    equipped with expected answers, formulas, and misconception mappings.
    Supports both Google Gemini and offline Local LLM (Llama-3.2-3B-Instruct).
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def _get_llm(self, temperature: float = 0.3):
        if not (LANGCHAIN_AVAILABLE and self.api_key):
            return None
        try:
            return ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                temperature=temperature,
                google_api_key=self.api_key
            )
        except Exception as e:
            print(f"[QGE] Warning initializing Gemini LLM: {e}")
            return None

    def generate_chapter_theory_and_cards(
        self,
        chapter_title: str,
        chapter_text: str,
        subject: str = "General",
        tier: str = "Standard",
        chapter_index: int = 1
    ) -> Dict[str, Any]:
        """
        Generates theory summary, objectives, and structured flashcards for a specific chapter.
        Prioritizes Gemini -> Local Llama-3.2-3B -> Heuristic fallback.
        """
        llm = self._get_llm(temperature=0.3)
        sample_context = chapter_text[:3500]

        # 1. Primary: Cloud LLM (Gemini)
        if llm:
            try:
                prompt = (
                    f"You are an elite instructional designer in {subject} ({tier}).\n"
                    f"Analyze the following textbook/document content for chapter '{chapter_title}':\n\n"
                    f"\"\"\"{sample_context}\"\"\"\n\n"
                    "Synthesize this chapter into:\n"
                    "1. A concise 2-3 sentence theory summary.\n"
                    "2. 2-3 key learning objectives.\n"
                    "3. Exactly 3 high-impact study flashcards. Each flashcard must have a 'topic', 'question', and 'answer' (structured with 2-3 clear bullet points).\n\n"
                    "Format response as strict JSON:\n"
                    "{\n"
                    '  "summary": "...",\n'
                    '  "objectives": ["...", "..."],\n'
                    '  "cards": [\n'
                    '    {"topic": "...", "question": "...", "answer": "• ...\\n• ..."}\n'
                    "  ]\n"
                    "}\n"
                    "Output ONLY valid raw JSON."
                )
                res = llm.invoke([HumanMessage(content=prompt)])
                clean_json = res.content.strip().lstrip("```json").rstrip("```").strip()
                parsed = json.loads(clean_json)
                
                cards = []
                for idx, c in enumerate(parsed.get("cards", [])):
                    cards.append({
                        "id": f"c{chapter_index}_{idx+1}_{uuid.uuid4().hex[:4]}",
                        "topic": c.get("topic", chapter_title),
                        "question": c.get("question", f"Key principle in {chapter_title}"),
                        "answer": c.get("answer", "• Essential theoretical relationship and governing concept.")
                    })
                    
                return {
                    "summary": parsed.get("summary", f"Core concepts in {chapter_title}"),
                    "objectives": parsed.get("objectives", [f"Master fundamentals of {chapter_title}"]),
                    "cards": cards[:3]
                }
            except Exception as e:
                print(f"[QGE] Gemini synthesis failed: {e}. Checking local LLM fallback.")

        # 2. Secondary: Offline Local LLM (Llama-3.2-3B-Instruct)
        if local_llm.is_available():
            try:
                local_res = local_llm.summarize_chapter_and_generate_cards(chapter_title, sample_context, subject)
                if local_res and "cards" in local_res:
                    cards = []
                    for idx, c in enumerate(local_res.get("cards", [])):
                        cards.append({
                            "id": f"c{chapter_index}_{idx+1}_{uuid.uuid4().hex[:4]}",
                            "topic": c.get("topic", chapter_title),
                            "question": c.get("question", f"Key principle in {chapter_title}"),
                            "answer": c.get("answer", "• Essential theoretical relationship.")
                        })
                    return {
                        "summary": local_res.get("summary", f"Core concepts in {chapter_title}"),
                        "objectives": local_res.get("objectives", [f"Master fundamentals of {chapter_title}"]),
                        "cards": cards[:3]
                    }
            except Exception as e:
                print(f"[QGE] Local LLM fallback failed: {e}")

        # Heuristic Fallback
        lines = [line.strip() for line in chapter_text.split("\n") if len(line.strip()) > 30]
        summary = lines[0] if lines else f"Comprehensive study module covering {chapter_title}."
        objectives = [f"Understand core principles of {chapter_title}", "Apply fundamental relationships to solve problems"]
        
        fallback_cards = []
        for i in range(min(3, max(1, len(lines)))):
            excerpt = lines[i] if i < len(lines) else lines[0]
            fallback_cards.append({
                "id": f"card_ch{chapter_index}_{i+1}_{uuid.uuid4().hex[:4]}",
                "topic": f"{chapter_title} - Part {i+1}",
                "question": f"What are the core fundamentals and significance of {chapter_title}?",
                "answer": f"• Key Principle: {excerpt[:200]}...\n• Application: Essential foundation in {subject}.",
                "source": "heuristic_fallback"
            })
            
        while len(fallback_cards) < 3:
            idx = len(fallback_cards) + 1
            fallback_cards.append({
                "id": f"card_ch{chapter_index}_{idx}_{uuid.uuid4().hex[:4]}",
                "topic": f"{chapter_title} Application {idx}",
                "question": f"How do practitioners apply {chapter_title} in practice?",
                "answer": f"• Analytical Framework: Governs core behavior in {subject}.\n• Rule: Always balance theoretical laws with empirical observation.",
                "source": "heuristic_fallback"
            })

        return {
            "summary": summary,
            "objectives": objectives,
            "cards": fallback_cards
        }

    def generate_assessment_items(
        self,
        course_title: str,
        chapters: List[Dict[str, Any]],
        subject: str = "General",
        tier: str = "Standard"
    ) -> Dict[str, Any]:
        """
        Generates practice quizzes and summative final exam questions across all chapters of a course.
        """
        llm = self._get_llm(temperature=0.2)
        
        context_snippets = []
        for ch in chapters:
            context_snippets.append(f"Chapter {ch.get('chapter_index')}: {ch.get('title')}\nSummary: {ch.get('summary', '')}\nText: {ch.get('content', '')[:1000]}")
            
        full_context = "\n\n---\n\n".join(context_snippets)

        if llm:
            prompt = (
                f"You are a psychometrician and test design authority for {subject} ({tier}).\n"
                f"Based on the following course material for '{course_title}':\n\n"
                f"\"\"\"{full_context[:5000]}\"\"\"\n\n"
                "Create two sets of assessment items:\n"
                "1. 'quizzes': 1-2 formative quiz questions per chapter. Each has 'id', 'text', 'concept' (chapter title), 'options' (array of 4 choices, or empty for short answer), and 'correct_answer'.\n"
                "2. 'finalExam': Exactly 3-5 rigorous summative threshold exam questions spanning key chapters.\n"
                "   Each exam question MUST have:\n"
                "   - 'qId': string (e.g. 'exam_1')\n"
                "   - 'moduleOrigin': 'Module X: Chapter Title'\n"
                "   - 'question_type': 'short_answer' or 'mcq'\n"
                "   - 'options': 4 distinct choices if MCQ, otherwise empty array []\n"
                "   - 'text': clear, unambiguous problem or scenario\n"
                "   - 'expected': deterministic single answer (number, short word, or exact option text)\n"
                "   - 'formula': governing law, theorem, or method\n"
                "   - 'misconception': common cognitive trap or error students make\n\n"
                "Return ONLY a valid JSON object matching this schema without markdown fences:\n"
                "{\n"
                '  "quizzes": [\n'
                '    {"id": "q_1", "text": "...", "concept": "...", "options": ["A", "B", "C", "D"], "correct_answer": "A"}\n'
                '  ],\n'
                '  "finalExam": [\n'
                '    {\n'
                '      "qId": "exam_1",\n'
                '      "moduleOrigin": "Module 1: ...",\n'
                '      "question_type": "short_answer",\n'
                '      "options": [],\n'
                '      "text": "...",\n'
                '      "expected": "...",\n'
                '      "formula": "...",\n'
                '      "misconception": "..."\n'
                '    }\n'
                '  ]\n'
                "}"
            )
            try:
                response = llm.invoke([HumanMessage(content=prompt)])
                clean_json = response.content.replace("```json", "").replace("```", "").strip()
                data = json.loads(clean_json)
                
                quizzes = data.get("quizzes", [])
                exams = data.get("finalExam", [])
                
                if quizzes and exams:
                    return {
                        "quizzes": quizzes,
                        "finalExam": exams
                    }
            except Exception as e:
                print(f"[QGE] Fallback for assessment generation: {e}")

        # Heuristic / Deterministic Fallback
        quizzes = []
        final_exams = []
        
        for idx, ch in enumerate(chapters, 1):
            ch_title = ch.get("title", f"Chapter {idx}")
            quizzes.append({
                "id": f"q_auto_{idx}",
                "text": f"What is the foundational concept and role of {ch_title} in {subject}?",
                "concept": ch_title,
                "options": [],
                "correct_answer": "Core governing principle"
            })
            
            final_exams.append({
                "qId": f"exam_auto_{idx}",
                "moduleOrigin": f"Module {idx}: {ch_title}",
                "question_type": "short_answer",
                "options": [],
                "text": f"State the primary theoretical law or invariant mechanism underpinning {ch_title}.",
                "expected": ch_title,
                "formula": f"Fundamental theorem of {ch_title}",
                "misconception": "Confusing foundational definitions with peripheral applications."
            })

        return {
            "quizzes": quizzes,
            "finalExam": final_exams[:4]
        }
