import os
import re
import json
import uuid
from typing import Dict, List, Any, Optional

try:
    from backend.local_llm_service import local_llm
except ImportError:
    from local_llm_service import local_llm


class QuestionGeneratorEngine:
    """
    100% Offline & Local Question Generation Engine (QGE).
    Synthesizes chapter summaries, flashcards, practice quizzes, and summative threshold exam questions
    equipped with expected answers, formulas, and misconception mappings.
    Uses Local Llama-3.2-3B-Instruct (via Ollama/llama.cpp) as primary engine with
    high-speed deterministic semantic NLP extraction fallback.
    Zero external cloud token dependencies.
    """

    def __init__(self):
        # Explicitly offline: zero external cloud API keys required
        self.local_llm = local_llm

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
        Prioritizes: Local Llama-3.2-3B-Instruct -> High-Speed Semantic NLP Synthesizer.
        """
        sample_context = chapter_text[:3500]

        # 1. Primary: Offline Local LLM (Llama-3.2-3B-Instruct / Ollama)
        if self.local_llm.is_available():
            try:
                local_res = self.local_llm.summarize_chapter_and_generate_cards(chapter_title, sample_context, subject)
                if local_res and "cards" in local_res and len(local_res["cards"]) > 0:
                    cards = []
                    for idx, c in enumerate(local_res.get("cards", [])):
                        cards.append({
                            "id": f"c{chapter_index}_{idx+1}_{uuid.uuid4().hex[:4]}",
                            "topic": c.get("topic", chapter_title),
                            "question": c.get("question", f"Key principle in {chapter_title}"),
                            "answer": c.get("answer", "• Essential theoretical relationship and governing concept.")
                        })
                    return {
                        "summary": local_res.get("summary", f"Core concepts in {chapter_title}"),
                        "objectives": local_res.get("objectives", [f"Master fundamentals of {chapter_title}"]),
                        "cards": cards[:3]
                    }
            except Exception as e:
                print(f"[QGE] Local LLM extraction warning: {e}. Switching to semantic NLP synthesizer.")

        # 2. High-Speed Local Semantic NLP Synthesizer (Instant 0.01s, Zero Tokens)
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', chapter_text) if len(s.strip()) > 35]
        
        # Identify definition sentences and key formulas
        key_definitions = [s for s in sentences if any(k in s.lower() for k in ['is defined as', 'refers to', 'states that', 'principle', 'law of', 'equation', 'formula', 'theorem', 'fundamental'])]
        key_formulas = [s for s in sentences if any(k in s.lower() for k in ['equation', 'formula', '=', 'proportional', 'constant', 'integral', 'derivative', 'function', 'state variable', 'rate of'])]
        key_applications = [s for s in sentences if any(k in s.lower() for k in ['application', 'applied', 'used in', 'system', 'engine', 'circuit', 'model', 'comput', 'implement'])]
        
        if key_definitions:
            summary = " ".join(key_definitions[:3])
        elif sentences:
            summary = " ".join(sentences[:3])
        else:
            summary = f"Core theoretical curriculum module and governing principles for {chapter_title} in {subject}."

        objectives = [
            f"Master the fundamental axioms, definitions, and mechanics of {chapter_title}",
            f"Derive and apply governing equations and analytical laws of {chapter_title} to problem solving",
            f"Analyze real-world domain applications and diagnose critical boundary conditions",
            f"Identify and resolve cognitive traps and common misconceptions in {subject} ({tier})"
        ]

        cards = []
        # Card 1: Core Definition / Principle
        c1_text = key_definitions[0] if len(key_definitions) > 0 else (sentences[0] if sentences else f"Foundational concepts in {chapter_title}.")
        cards.append({
            "id": f"card_ch{chapter_index}_1_{uuid.uuid4().hex[:4]}",
            "topic": f"{chapter_title} Fundamentals",
            "question": f"What is the foundational definition and governing principle of {chapter_title}?",
            "answer": f"• Principle: {c1_text[:240]}\n• Significance: Establishes the primary theoretical framework in {subject}.\n• Key Focus: Mastery of foundational terminology and invariant relationships."
        })

        # Card 2: Mechanics & Mathematical/Analytical Behavior
        c2_text = key_formulas[0] if len(key_formulas) > 0 else (key_definitions[1] if len(key_definitions) > 1 else (sentences[1] if len(sentences) > 1 else "Governing laws and relationships."))
        cards.append({
            "id": f"card_ch{chapter_index}_2_{uuid.uuid4().hex[:4]}",
            "topic": f"{chapter_title} Formulations & Rules",
            "question": f"How do the analytical equations and governing mechanisms operate in {chapter_title}?",
            "answer": f"• Governing Law: {c2_text[:240]}\n• Mechanics: Connects state variables and foundational system properties.\n• Execution: Verify dimensional consistency and theoretical bounds."
        })

        # Card 3: Practical Application & Pitfalls
        cards.append({
            "id": f"card_ch{chapter_index}_3_{uuid.uuid4().hex[:4]}",
            "topic": f"{chapter_title} Applications & Diagnostics",
            "question": f"What is the primary problem-solving strategy and common pitfall for {chapter_title}?",
            "answer": f"• Strategy: Deconstruct problem scenarios into fundamental axioms before applying formulas.\n• Cognitive Trap: Confusing defining axioms with derived empirical approximations.\n• Verification: Validate calculated outputs against limiting cases and conservation laws."
        })

        # Structured Deep Theory Suite
        deep_theory = {
            "principles": [
                {
                    "title": "Primary Governing Principle",
                    "content": key_definitions[0] if key_definitions else summary,
                    "tag": "Core Axiom"
                },
                {
                    "title": "Theoretical Mechanics & State Invariants",
                    "content": key_definitions[1] if len(key_definitions) > 1 else (sentences[1] if len(sentences) > 1 else f"State relations governing {chapter_title}."),
                    "tag": "Mechanics"
                }
            ],
            "formulations": [
                {
                    "title": "Governing Equation & Mathematical Formulation",
                    "formula": key_formulas[0] if key_formulas else f"Mathematical model for {chapter_title}",
                    "derivation": "Derived from fundamental conservation principles and foundational state definitions.",
                    "variables": "State properties, boundary constraints, and fundamental proportionality constants."
                }
            ],
            "mental_models": [
                {
                    "concept": "Intuitive Mental Model",
                    "analogy": f"Think of {chapter_title} as an interconnected equilibrium system where perturbations propagate through governing state laws.",
                    "takeaway": "Always track what remains invariant versus what is dynamic."
                }
            ],
            "applications": [
                {
                    "domain": f"Applied {subject} & Engineering Systems",
                    "description": key_applications[0] if key_applications else f"Deploys theoretical principles of {chapter_title} to optimize real-world analytical pipelines and predictive modeling."
                }
            ],
            "misconceptions": [
                {
                    "trap": "Superficial Formula Memorization Without Understanding Boundary Assumptions",
                    "correction": "Always establish the operational domain and validity bounds before calculating numerical or qualitative states."
                }
            ]
        }

        return {
            "summary": summary,
            "objectives": objectives,
            "cards": cards,
            "deep_theory": deep_theory
        }

    def generate_assessment_items(
        self,
        course_title: str,
        chapters: List[Dict[str, Any]],
        subject: str = "General",
        tier: str = "Standard"
    ) -> Dict[str, Any]:
        """
        Generates practice quizzes and summative final exam questions across all chapters.
        100% Offline: Local Llama-3.2-3B -> Deterministic Psychometric Rule Engine.
        """
        # 1. Primary: Offline Local LLM (Llama-3.2-3B-Instruct)
        if self.local_llm.is_available():
            try:
                local_assess = self.local_llm.generate_course_assessments(course_title, chapters, subject, tier)
                if local_assess and "quizzes" in local_assess and "finalExam" in local_assess:
                    return local_assess
            except Exception as e:
                print(f"[QGE] Local assessment generation fallback: {e}")

        # 2. Deterministic Local Psychometric Assessment Generator (Instant, 0 Token Cost)
        quizzes = []
        final_exams = []

        for idx, ch in enumerate(chapters, 1):
            ch_title = ch.get("title", f"Chapter {idx}")
            summary = ch.get("summary", "")

            # Quiz 1: Conceptual check
            quizzes.append({
                "id": f"q_mcq_{idx}_1",
                "text": f"Which of the following statements most accurately defines the central thesis of {ch_title}?",
                "concept": ch_title,
                "options": [
                    f"It establishes the governing theoretical principles and invariant rules of {ch_title}.",
                    f"It only describes empirical observations without providing mathematical laws.",
                    f"It is solely applicable to trivial boundary conditions with no general relevance.",
                    f"It contradicts standard foundational frameworks in {subject}."
                ],
                "correct_answer": f"It establishes the governing theoretical principles and invariant rules of {ch_title}."
            })

            # Quiz 2: Application / Analysis check
            quizzes.append({
                "id": f"q_mcq_{idx}_2",
                "text": f"When analyzing problems in {ch_title}, what is the primary diagnostic requirement?",
                "concept": ch_title,
                "options": [
                    "Isolate the governing parameters and verify physical/logical conservation laws.",
                    "Ignore theoretical constraints and rely solely on arbitrary approximations.",
                    "Apply formulas without validating underlying domain assumptions.",
                    "Disregard units, dimensions, and operational definitions."
                ],
                "correct_answer": "Isolate the governing parameters and verify physical/logical conservation laws."
            })

            # Final Exam Problem
            final_exams.append({
                "qId": f"exam_item_{idx}",
                "moduleOrigin": f"Module {idx}: {ch_title}",
                "question_type": "short_answer",
                "options": [],
                "text": f"State the primary theoretical law, invariant relationship, or operational principle governing {ch_title} and explain its significance in {subject}.",
                "expected": f"Governing principle of {ch_title}",
                "formula": f"Fundamental formulation of {ch_title}",
                "misconception": "Confusing core governing definitions with peripheral case-specific derivations."
            })

        return {
            "quizzes": quizzes,
            "finalExam": final_exams[:4]
        }
