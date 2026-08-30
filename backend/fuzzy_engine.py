class FuzzyMarkingSystem:
    @staticmethod
    def evaluate_performance(
        accuracy_pct: float,
        latency_seconds: int,
        attempts_count: int = 1,
        error_severity: float = 0.0,
        hints_requested: int = 0
    ) -> dict:
        """
        Advanced Multi-Parameter Mamdani-style Fuzzy Inference System.
        Fuses:
          1. Continuous semantic / mathematical accuracy [0.0 - 100.0]
          2. Latency / pacing efficiency [seconds]
          3. Attempt count / persistence [1, 2, 3, 4, 5+]
          4. Error severity [0.0 (minor slip/typo) to 1.0 (fundamental misconception)]
          5. Scaffolding / Hint dependency [0, 1, 2, 3+]
        to calculate a mathematically blended score, performance tier, and pedagogical remark.
        Strictly enforces monotonic penalties for retries and hint requests.
        """
        accuracy_pct = max(0.0, min(100.0, float(accuracy_pct)))
        latency_seconds = max(1, int(latency_seconds))
        attempts_count = max(1, int(attempts_count))
        error_severity = max(0.0, min(1.0, float(error_severity)))
        hints_requested = max(0, int(hints_requested))

        # -------------------------------------------------------------
        # 1. Input Fuzzification
        # -------------------------------------------------------------
        # A. Accuracy Membership Sets [0.0 - 1.0]
        mu_mastery = max(0.0, min((accuracy_pct - 50) / 50, 1.0)) if accuracy_pct > 50 else 0.0
        
        if 25 <= accuracy_pct <= 55:
            mu_developing = (accuracy_pct - 25) / 30
        elif 55 < accuracy_pct <= 85:
            mu_developing = (85 - accuracy_pct) / 30
        else:
            mu_developing = 0.0
            
        mu_intervention = max(0.0, min((50 - accuracy_pct) / 50, 1.0)) if accuracy_pct <= 50 else 0.0

        # B. Latency (Pacing Efficiency) Membership Sets [0.0 - 1.0]
        # Fast pacing (0 - 75s)
        mu_fast = max(0.0, min((75 - latency_seconds) / 45, 1.0)) if latency_seconds <= 75 else 0.0
        # Slow pacing (45s - 120s+)
        mu_slow = max(0.0, min((latency_seconds - 45) / 75, 1.0)) if latency_seconds >= 45 else 0.0

        # C. Attempt Count (Fluency vs. Guessing) Membership Sets [0.0 - 1.0]
        if attempts_count == 1:
            mu_first_try = 1.0
            mu_retry = 0.0
            mu_brute_force = 0.0
        elif attempts_count == 2:
            mu_first_try = 0.25
            mu_retry = 1.0
            mu_brute_force = 0.0
        elif attempts_count == 3:
            mu_first_try = 0.0
            mu_retry = 0.65
            mu_brute_force = 0.35
        elif attempts_count == 4:
            mu_first_try = 0.0
            mu_retry = 0.15
            mu_brute_force = 0.90
        else:
            mu_first_try = 0.0
            mu_retry = 0.0
            mu_brute_force = 1.0

        # D. Error Severity Membership Sets [0.0 - 1.0]
        # Minor slip / rounding / typo: severity 0.0 - 0.35
        mu_minor_slip = max(0.0, min((0.35 - error_severity) / 0.35, 1.0)) if error_severity <= 0.35 else 0.0
        # Procedural / algebraic / distractor error: severity 0.2 - 0.75
        if 0.2 <= error_severity <= 0.5:
            mu_procedural = (error_severity - 0.2) / 0.3
        elif 0.5 < error_severity <= 0.75:
            mu_procedural = (0.75 - error_severity) / 0.25
        else:
            mu_procedural = 0.0
        # Fundamental conceptual flaw: severity 0.4 - 1.0
        mu_critical_flaw = max(0.0, min((error_severity - 0.4) / 0.6, 1.0)) if error_severity >= 0.4 else 0.0

        # E. Hint Dependency Membership Sets [0.0 - 1.0]
        if hints_requested == 0:
            mu_autonomous = 1.0
            mu_hint_assisted = 0.0
            mu_hint_dependent = 0.0
        elif hints_requested == 1:
            mu_autonomous = 0.15
            mu_hint_assisted = 1.0
            mu_hint_dependent = 0.2
        else:
            mu_autonomous = 0.0
            mu_hint_assisted = 0.2
            mu_hint_dependent = 1.0

        # -------------------------------------------------------------
        # 2. Fuzzy Inference Matrix Rules (Mamdani Intersection)
        # -------------------------------------------------------------
        # Rule 1: High Mastery & (First Try OR Fast) & Minor Slip/No Flaw & Autonomous
        r1_weight = min(
            mu_mastery,
            max(mu_first_try, mu_fast * 0.7),
            max(mu_minor_slip, 1.0 - error_severity),
            mu_autonomous
        )

        # Rule 2: Moderate Mastery: (Mastery with Autonomous Retries OR Developing with Fast Pacing)
        r2_weight = max(
            min(mu_mastery, mu_retry, mu_autonomous),
            min(mu_developing, max(mu_first_try, mu_fast), mu_autonomous)
        )

        # Rule 3: Developing / Scaffolding: Retries + Hints OR Procedural errors
        r3_weight = max(
            min(mu_mastery, mu_retry, mu_hint_assisted),
            min(mu_mastery, mu_hint_assisted, max(mu_first_try, mu_retry)),
            min(mu_developing, max(mu_retry, mu_hint_assisted, mu_slow)),
            min(mu_procedural, max(mu_retry, mu_developing))
        )

        # Rule 4: Critical Intervention: High Error Flaw OR Brute-Force (>=4 attempts) OR Heavy Scaffolding Dependency
        r4_weight = max(
            mu_critical_flaw,
            min(mu_intervention, 1.0),
            min(mu_brute_force, max(mu_hint_dependent, mu_hint_assisted * 0.9, 1.0 - mu_first_try)),
            min(mu_hint_dependent, max(mu_retry, mu_brute_force)),
            min(mu_hint_dependent, 1.0 - mu_first_try),
            1.0 if attempts_count >= 5 else 0.0
        )

        # -------------------------------------------------------------
        # 3. Defuzzification: Centroid Center-of-Gravity (CoG) Approximation
        # -------------------------------------------------------------
        numerator = (r1_weight * 96.0) + (r2_weight * 82.0) + (r3_weight * 55.0) + (r4_weight * 22.0)
        denominator = r1_weight + r2_weight + r3_weight + r4_weight + 1e-9

        centroid_score = numerator / denominator if denominator > 1e-5 else accuracy_pct

        # -------------------------------------------------------------
        # 4. Calibration Blend & Final Continuous Score
        # -------------------------------------------------------------
        if accuracy_pct >= 80.0:
            # Full/High correctness: deduct for retries, hints, latency, and minor phrasing delta
            attempt_penalty = (attempts_count - 1) * 14.0
            hint_penalty = hints_requested * 23.0
            latency_penalty = min(4.0, latency_seconds * 0.025)
            acc_adjustment = (100.0 - accuracy_pct) * 0.25

            direct_score = 100.0 - attempt_penalty - hint_penalty - latency_penalty - acc_adjustment
            
            # Explicit anchors requested:
            # Anchor 1: 2 attempts + 0 hints in [80.0, 85.0]
            if attempts_count == 2 and hints_requested == 0:
                direct_score = max(80.0, min(85.0, direct_score))
            # Anchor 2: 2 attempts + 1 hint in [55.0, 60.0]
            elif attempts_count == 2 and hints_requested == 1:
                direct_score = max(55.0, min(60.0, direct_score))

            final_score = round(0.35 * centroid_score + 0.65 * direct_score, 1)

            if attempts_count == 2 and hints_requested == 0:
                final_score = max(80.0, min(85.0, final_score))
            elif attempts_count == 2 and hints_requested == 1:
                final_score = max(55.0, min(60.0, final_score))

            final_score = max(15.0, min(100.0, final_score))
        elif accuracy_pct == 0.0:
            # Zero correctness: scale by error severity, attempts, and hint load
            if error_severity <= 0.3:
                final_score = max(15.0, min(40.0, round(30.0 - (error_severity * 15.0) - (attempts_count * 2.0) - (hints_requested * 3.0), 1)))
            else:
                final_score = max(5.0, min(25.0, round(20.0 - (error_severity * 10.0) - (attempts_count * 1.5) - (hints_requested * 2.0), 1)))
        else:
            # Partial correctness from diagnostic engine (< 80%)
            acc_scaled = (accuracy_pct / 100.0) * centroid_score
            penalty = ((attempts_count - 1) * 10.0) + (hints_requested * 15.0) + (latency_seconds * 0.03)
            final_score = max(10.0, min(100.0, round(acc_scaled - penalty, 1)))

        # -------------------------------------------------------------
        # 5. Continuous Score Group & Pedagogical Diagnostic Mapping
        # -------------------------------------------------------------
        if final_score >= 85.0:
            tier = "High Mastery"
            remark = "Exemplary Performance: Displays outstanding analytical command, rapid conceptual retrieval, and error-free execution."
        elif final_score >= 70.0:
            tier = "Moderate Mastery"
            remark = "Proficient with Methodical Focus: Strong core conceptual grasp, though pacing, minor calculation adjustments, or retries were noted."
        elif final_score >= 50.0:
            tier = "Developing"
            remark = "Developing Analytical Trajectory: Understands high-level themes, but exhibits procedural gaps or trial-and-error under constraints."
        else:
            tier = "Intervention Required"
            remark = "Targeted Foundational Review Recommended: Shows significant conceptual blockages, high error severity, or heavy scaffolding dependency."

        degree_of_failure = max(0.0, min(100.0, round(100.0 - final_score, 1)))

        return {
            "fuzzy_score": final_score,
            "performance_tier": tier,
            "linguistic_remark": remark,
            "degree_of_failure": degree_of_failure,
            "metrics": {
                "accuracy_pct": accuracy_pct,
                "latency_seconds": latency_seconds,
                "attempts_count": attempts_count,
                "error_severity": error_severity,
                "hints_requested": hints_requested
            }
        }