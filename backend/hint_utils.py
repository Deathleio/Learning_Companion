import re


def sanitize_gap_analysis(gap_analysis: str, expected_answer: str = "") -> str:
    """Remove leaked correct answers from diagnostic text shown to students."""
    if not gap_analysis:
        return "Review how the quantities in this problem relate to each other."

    sanitized = gap_analysis
    if expected_answer:
        for variant in {expected_answer, expected_answer.lower(), expected_answer.upper()}:
            sanitized = re.sub(
                rf"expected answer\s+is\s+['\"]?{re.escape(variant)}['\"]?",
                "your result does not yet match the required form",
                sanitized,
                flags=re.IGNORECASE,
            )
            sanitized = sanitized.replace(f"'{variant}'", "the required value")

    sanitized = re.sub(
        r"the (?:correct|expected|right) answer (?:is|was)\s+[^\n.]+",
        "your submission still needs adjustment",
        sanitized,
        flags=re.IGNORECASE,
    )
    sanitized = re.sub(
        r"but the expected answer[^\n.]*",
        "but the approach or result needs revision",
        sanitized,
        flags=re.IGNORECASE,
    )
    return sanitized.strip()


def sanitize_hint_text(hint: str, expected_answer: str = "") -> str:
    """Strip final-answer leaks from tutor hints while preserving guidance."""
    if not hint:
        return hint

    sanitized = hint
    if expected_answer:
        for variant in {expected_answer, expected_answer.lower(), expected_answer.upper()}:
            patterns = [
                rf"(?:the\s+)?(?:correct|final|expected)\s+answer\s+is\s+['\"]?{re.escape(variant)}['\"]?",
                rf"=\s*{re.escape(variant)}\b",
                rf"therefore[,]?\s+(?:the\s+answer\s+is\s+)?{re.escape(variant)}\b",
            ]
            for pattern in patterns:
                sanitized = re.sub(pattern, "[work through the final step yourself]", sanitized, flags=re.IGNORECASE)

    sanitized = re.sub(
        r"(?:the\s+)?(?:correct|final|expected)\s+answer\s+is\s+[^\n.]+",
        "complete the remaining steps to reach the result",
        sanitized,
        flags=re.IGNORECASE,
    )
    return sanitized.strip()


HINT_FORMAT_DIRECTIVE = (
    "\n\nFORMATTING REQUIREMENT:\n"
    "- Respond in clean markdown using short section headers (##), bullet lists (-), and **bold** for key terms.\n"
    "- NEVER state the final numerical result, exact answer string, or completed substitution.\n"
    "- Guide the student to discover the answer themselves."
)
