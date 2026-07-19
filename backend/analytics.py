class PathPerformanceAnalytics:
    @staticmethod
    def calculate_pathway_improvement(mock_history: list, exam_score: float, exam_latency: float) -> dict:
        """
        Computes the performance delta and learning curve trajectory differences
        between a guided interactive pathway and direct, unstructured student evaluation.
        """
        # Condition 1: Direct Evaluation Pathway (Skipped Mock Scaffolding)
        if not mock_history:
            return {
                "pathway_taken": "Pathway B: Direct Evaluation (No Mock Test)",
                "score_delta_pct": 0.0,
                "analytical_insight": "Student skipped the Socratic mock scaffolding layer and proceeded directly to final evaluation."
            }
        
        # Condition 2: Guided Learning Pathway (Theory + Mock Practice + Final Exam)
        total_mock_turns = len(mock_history)
        
        # Extrapolate a baseline estimate from the intensity of the mock turns interaction trace
        estimated_baseline_score = max(30.0, 100.0 - (total_mock_turns * 12.5))
        score_delta = round(exam_score - estimated_baseline_score, 1)
        
        # Quantitative mapping to qualitative progression insights
        if score_delta > 15:
            insight = "Significant upward trajectory. The Socratic hinting loop successfully resolved core cognitive bottlenecks before final grading."
        elif score_delta > 0:
            insight = "Moderate improvement. Scaffolding provided a steady conceptual foundation."
        else:
            insight = "Negligible variance. Performance remained static between testing environments."

        return {
            "pathway_taken": "Pathway A: Guided Scaffolding (Theory + Mock Test + Final Exam)",
            "score_delta_pct": score_delta,
            "analytical_insight": insight
        }