class FuzzyMarkingSystem:
    @staticmethod
    def evaluate_performance(accuracy_pct: float, latency_seconds: int) -> dict:
        """
        Advanced Mamdani-style Fuzzy Inference System.
        Fuses continuous semantic accuracy with latency parameter sets 
        to calculate a mathematically blended score and performance tier.
        """
        # 1. Input Fuzzification: Accuracy Membership Sets [0.0 - 1.0]
        # High Mastery Curve [40% to 100%]
        mu_mastery = max(0.0, min((accuracy_pct - 40) / 60, 1.0)) if accuracy_pct > 40 else 0.0
        
        # Developing Trajectory Tri-curve [20% to 80%]
        if 20 <= accuracy_pct <= 50:
            mu_developing = (accuracy_pct - 20) / 30
        elif 50 < accuracy_pct <= 80:
            mu_developing = (80 - accuracy_pct) / 30
        else:
            mu_developing = 0.0
            
        # Intervention Required Curve [0% to 50%]
        mu_intervention = max(0.0, min((50 - accuracy_pct) / 50, 1.0)) if accuracy_pct <= 50 else 0.0

        # 2. Input Fuzzification: Latency (Pacing Efficiency) [0.0 - 1.0]
        # Fast Pacing (Low friction response) [0s to 90s]
        mu_fast = max(0.0, min((90 - latency_seconds) / 45, 1.0)) if latency_seconds <= 90 else 0.0
        # Slow Pacing (High friction processing) [45s to 120s+]
        mu_slow = max(0.0, min((latency_seconds - 45) / 75, 1.0)) if latency_seconds >= 45 else 0.0

        # 3. Fuzzy Inference Matrix Rules (Mamdani Intersection)
        # Rule 1: High Accuracy AND Fast Pacing -> Upper-tier Mastery
        r1_weight = min(mu_mastery, mu_fast)
        # Rule 2: Developing Accuracy OR Slow Pacing -> Mid-tier Proficiency
        r2_weight = max(mu_developing, min(mu_mastery, mu_slow))
        # Rule 3: High Intervention Need OR Extreme Latency -> Lower-tier Scaffolding Needs
        r3_weight = max(mu_intervention, min(mu_developing, mu_slow))

        # 4. Defuzzification: Centroid Center-of-Gravity (CoG) Approximation
        # Maps active rule intersections to explicit score output singletons
        numerator = (r1_weight * 95.0) + (r2_weight * 72.5) + (r3_weight * 35.0)
        denominator = r1_weight + r2_weight + r3_weight + 1e-9

        calculated_base = numerator / denominator if denominator > 1e-5 else accuracy_pct
        
        # Apply absolute anchors for perfect/null inputs
        if accuracy_pct == 100.0:
            final_score = max(85.0, min(100.0, round(100.0 - (latency_seconds * 0.1), 1)))
        elif accuracy_pct == 0.0:
            final_score = max(10.0, min(40.0, round(10.0 + (90 / max(1, latency_seconds)), 1)))
        else:
            final_score = max(10.0, min(100.0, round(calculated_base, 1)))

        # 5. Continuous Score Group Mapping Matrix
        if final_score >= 85.0:
            tier = "High Mastery"
            remark = "Exemplary Performance: Displays outstanding analytical command, rapid conceptual retrieval, and error-free execution."
        elif final_score >= 70.0:
            tier = "Moderate Mastery"
            remark = "Proficient with Methodical Focus: Strong core conceptual grasp, though pacing or minor structural calculation adjustments are advised."
        elif final_score >= 50.0:
            tier = "Developing"
            remark = "Developing Analytical Trajectory: Understands high-level themes, but exhibits execution gaps under timed testing constraints."
        else:
            tier = "Intervention Required"
            remark = "Targeted Foundational Review Recommended: Shows significant cognitive blockages or high friction under independent evaluation."

        return {
            "fuzzy_score": final_score,
            "performance_tier": tier,
            "linguistic_remark": remark
        }