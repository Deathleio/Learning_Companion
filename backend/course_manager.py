import os
import json
import uuid
from typing import Dict, List, Any, Optional

from theory_repo import FLASHCARD_REPOSITORY

COURSES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "courses")
os.makedirs(COURSES_DIR, exist_ok=True)


class CourseManager:
    """
    Enterprise Course & Curriculum Manager.
    Handles persistence, lifecycle, and indexing of built-in subjects and user-ingested custom courses.
    """

    @staticmethod
    def get_builtin_courses() -> List[Dict[str, Any]]:
        """Returns standard built-in courses derived from FLASHCARD_REPOSITORY."""
        courses = []
        for subject, tiers in FLASHCARD_REPOSITORY.items():
            for tier, data in tiers.items():
                course_id = f"builtin_{subject.lower()}_{tier.replace(' ', '_').replace('-', '_').lower()}"
                cards = data.get("cards", [])
                quizzes = data.get("quizzes", [])
                exams = data.get("finalExam", [])
                
                # Derive logical chapters from card topics
                chapters = []
                for idx, c in enumerate(cards, 1):
                    chapters.append({
                        "chapter_id": f"ch_{idx}",
                        "chapter_index": idx,
                        "title": c.get("topic", f"Chapter {idx}"),
                        "summary": c.get("answer", ""),
                        "objectives": [c.get("question", "")],
                        "cards": [c],
                        "quizzes": [q for q in quizzes if q.get("concept") == c.get("topic")] or (quizzes[idx-1:idx] if idx-1 < len(quizzes) else [])
                    })

                courses.append({
                    "course_id": course_id,
                    "title": f"{subject} ({tier})",
                    "subject": subject,
                    "academic_tier": tier,
                    "is_builtin": True,
                    "description": f"Standard curriculum repository for {subject} at the {tier} academic level.",
                    "chapters_count": len(chapters),
                    "flashcards_count": len(cards),
                    "quizzes_count": len(quizzes),
                    "exam_questions_count": len(exams),
                    "chapters": chapters,
                    "finalExam": exams
                })
        return courses

    @staticmethod
    def list_all_courses() -> List[Dict[str, Any]]:
        """Lists all courses (built-in + ingested user courses)."""
        courses = CourseManager.get_builtin_courses()
        
        # Load user-created courses from COURSES_DIR
        for filename in os.listdir(COURSES_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(COURSES_DIR, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        courses.append(data)
                except Exception as e:
                    print(f"Error loading course {filename}: {e}")
                    
        return courses

    @staticmethod
    def get_course_by_id(course_id: str) -> Optional[Dict[str, Any]]:
        """Fetches a specific course by its unique ID."""
        for c in CourseManager.list_all_courses():
            if c.get("course_id") == course_id:
                return c
        return None

    @staticmethod
    def save_custom_course(course_data: Dict[str, Any]) -> str:
        """Saves a custom ingested course to disk."""
        if not course_data.get("course_id"):
            course_data["course_id"] = f"custom_{uuid.uuid4().hex[:8]}"
            
        course_data["is_builtin"] = False
        course_id = course_data["course_id"]
        filepath = os.path.join(COURSES_DIR, f"{course_id}.json")
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(course_data, f, indent=2, ensure_ascii=False)
            
        return course_id

    @staticmethod
    def delete_custom_course(course_id: str) -> bool:
        """Deletes a custom course from disk."""
        filepath = os.path.join(COURSES_DIR, f"{course_id}.json")
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False
