FLASHCARD_REPOSITORY = {
    "Physics": {
        "Class 10": {
            "cards": [
                {
                    "id": "p10_c1",
                    "topic": "Newton's Second Law",
                    "question": "What is the core formula for Newton's Second Law and how does force interact with mass?",
                    "answer": "• Core Equation: Force = Mass x Acceleration (F = m x a).\n• Core Metric: Applying an unbalanced external force to an object causes it to change its velocity over time.\n• Computational Breakdown: A 10 kg object accelerating at 5 m/s² experiences a net force of exactly 50 Newtons (10 kg x 5 m/s² = 50 N)."
                },
                {
                    "id": "p10_c2",
                    "topic": "Friction Dynamics",
                    "question": "What is friction and how does its vector orientation behave relative to motion?",
                    "answer": "• Definition: Friction is a specific contact force that opposes movement between surfaces.\n• Vector Boundary: It always acts in a path exactly opposite to the direction of intended or active motion, creating systemic resistance."
                },
                {
                    "id": "p10_c3",
                    "topic": "Kinematics & Constant Velocity",
                    "question": "What is the mathematical value of acceleration when a vehicle travels at a constant velocity?",
                    "answer": "• Constant Velocity Rule: Constant velocity means speed and direction remain perfectly steady over time.\n• Acceleration Profile: Because velocity variation is exactly zero, acceleration is mathematically 0 m/s² (e.g., a car traveling steadily at 20 m/s for 10 seconds has 0 acceleration)."
                },
                {
                    "id": "p10_c4",
                    "topic": "Mechanical Work & Power",
                    "question": "How do you calculate physical work and how is system power determined?",
                    "answer": "• Work Equation: Work is performed when force moves an object a distance in the direction of that force (Work = Force x Distance).\n• Power Metric: Power measures the time rate at which this energy is consumed or transformed (Power = Work / time)."
                }
            ],
            "quizzes": [
                { "id": "p10_q1", "text": "A 10kg structural mass experiences a constant acceleration of 5 m/s². Calculate the active net force vector acting on it in Newtons.", "concept": "Newton's Second Law" },
                { "id": "p10_q2", "text": "If an automated transport vehicle moves at a perfectly uniform constant velocity of 20 m/s for 10 seconds, what is its rate of acceleration in m/s²?", "concept": "Kinematics" }
            ],
            "finalExam": [
                { 
                  "qId": "p10_f1", 
                  "moduleOrigin": "Module 1: Newton's Second Law",
                  "text": "A mechanical component with an exact mass of 8 kg accelerates uniformly across a smooth linear track at 4 m/s². Compute the total active horizontal force applied in Newtons (Provide numerical integer only).", 
                  "expected": "32",
                  "formula": "Force = Mass x Acceleration (F = m x a)",
                  "misconception": "Student might be dividing the variables (8/4 or 4/8) instead of applying multiplication metrics."
                },
                { 
                  "qId": "p10_f2", 
                  "moduleOrigin": "Module 2: Friction Dynamics",
                  "text": "An automated storage block is dragged along a straight conveyor belt line toward the north direction. In what vector heading direction does the surface friction force operate?", 
                  "expected": "south",
                  "formula": "Friction Vector = -1 x (Active Vector Path Heading Direction)",
                  "misconception": "Student might think friction assists movement or acts downward alongside gravity parameters."
                },
                { 
                  "qId": "p10_f3", 
                  "moduleOrigin": "Module 3: Kinematics & Constant Velocity",
                  "text": "A high-speed tracking train operates along a straight route at a perfectly constant velocity of 45 m/s for a duration of 60 seconds. What is the active acceleration rate in m/s²?", 
                  "expected": "0",
                  "formula": "Acceleration (a) = Delta Velocity / Delta Time (Δv / Δt)",
                  "misconception": "Student might try to calculate a change by multiplying 45 x 60, forgetting that constant velocity means acceleration is absolute zero."
                }
            ]
        },
        "Class 11-12": {
            "cards": [
                {
                    "id": "p12_c1",
                    "topic": "Projectile Vector Splitting",
                    "question": "How is a projectile's motion vector decoupled in a two-dimensional ballistic plane?",
                    "answer": "• Decoupled Components: Motion is split into entirely independent horizontal (x) and vertical (y) vector streams under gravity (g = 9.8 m/s²).\n• Horizontal Trajectory: Air resistance is ignored, so horizontal acceleration is zero (ax = 0) and horizontal velocity stays completely constant."
                },
                {
                    "id": "p12_c2",
                    "topic": "Peak Flight Constraints",
                    "question": "What specific boundary condition occurs to a projectile's velocity components at its maximum height?",
                    "answer": "• Vertical Peak Value: At absolute maximum height of its flight path, vertical velocity drops precisely to zero (vy = 0).\n• Horizontal State: The horizontal velocity vector remains active, stable, and unchanged."
                },
                {
                    "id": "p12_c3",
                    "topic": "Rotational Torque Rules",
                    "question": "What acts as the rotational analogue to linear force and how is rotational inertia measured?",
                    "answer": "• Torque Analogue: Torque is the rotational equivalent of a linear force, measuring a force's capacity to induce angular acceleration around a pivot.\n• Moment of Inertia: Rotational resistance is quantified by Moment of Inertia (I), which depends on mass distribution relative to the axis."
                }
            ],
            "quizzes": [
                { "id": "p12_q1", "text": "A research payload is launched ballistically into a parabolic path. When it reaches its absolute maximum peak height, what is the value of its vertical velocity component in m/s?", "concept": "Projectile Motion" }
            ],
            "finalExam": [
                { 
                  "qId": "p12_f1", 
                  "moduleOrigin": "Module 1: Projectile Component Systems",
                  "text": "During an idealized ballistic flight tracking projectile dynamics, calculate the value of the vertical velocity component vector in m/s at the absolute peak height coordinates.", 
                  "expected": "0",
                  "formula": "Vertical Velocity at Peak Vertex (v_y) = 0",
                  "misconception": "Student might mistake total velocity for zero, or try to factor in the active horizontal speed value."
                }
            ]
        },
        "Undergraduate": {
            "cards": [
                {
                    "id": "pug_c1",
                    "topic": "The Lagrangian Function",
                    "question": "What is the structural definition of the Lagrangian function (L) in analytical mechanics?",
                    "answer": "• Energy Definition: The Lagrangian replaces vector tracking with scalar tracking models within constraints.\n• Fundamental Relation: It is calculated as Kinetic Energy (T) minus Potential Energy (V), resulting in the formula: L = T - V.\n• Equations of Motion: Plugged into Euler-Lagrange equations to resolve system tracking paths cleanly."
                },
                {
                    "id": "pug_c2",
                    "topic": "Hamiltonian Phase Spaces",
                    "question": "How does the Hamiltonian formulation shift mechanical tracking variables?",
                    "answer": "• Variable Shift: Transitions from generalized velocities to conjugate momenta parameters.\n• Total System Energy: Represents total mechanical energy (H = T + V), generating first-order partial differential equations across continuous phase space fields."
                }
            ],
            "quizzes": [
                { "id": "pug_q1", "text": "What fundamental scalar energy formula connects Kinetic Energy (T) and Potential Energy (V) to define the system Lagrangian (L)?", "concept": "Lagrangian Mechanics" }
            ],
            "finalExam": [
                { 
                  "qId": "pug_f1", 
                  "moduleOrigin": "Module 1: Analytical Mechanics",
                  "text": "Input the baseline scalar equation defining the system state Lagrangian (L) as a function of kinetic energy (T) and potential energy (V) using standard notation.", 
                  "expected": "l=t-v",
                  "formula": "Lagrangian Function (L) = Kinetic Energy (T) - Potential Energy (V)",
                  "misconception": "Student might inadvertently add the metrics (T+V), which instead characterizes the system Hamiltonian function."
                }
            ]
        }
    },
    "Biology": {
        "Class 10": {
            "cards": [
                {
                    "id": "b10_c1",
                    "topic": "Cellular Energy",
                    "question": "What is the primary function of mitochondria in a eukaryotic cell?",
                    "answer": "• Cellular Organelles: Mitochondria are specialized membrane-bound subunits inside cells.\n• Power Generation: They act as cellular power plants, running respiration processes to convert nutrients into high-energy ATP molecules."
                }
            ],
            "quizzes": [
                { "id": "b10_q1", "text": "Which membrane-bound organelle acts as the main power plant of eukaryotic cells by generating ATP?", "concept": "Cellular Energy" }
            ],
            "finalExam": [
                { 
                  "qId": "b10_f1", 
                  "moduleOrigin": "Module 1: Cellular Power Plants",
                  "text": "What is the primary chemical compound that mitochondria produce to store and transfer energy within eukaryotic cells? (Provide the 3-letter abbreviation only)", 
                  "expected": "ATP",
                  "formula": "Adenosine Triphosphate Synthesis",
                  "misconception": "Student might think of glucose or ADP instead of the immediate energy currency."
                }
            ]
        },
        "Class 11-12": {
            "cards": [
                {
                    "id": "b12_c1",
                    "topic": "Transcription Enzymes",
                    "question": "What specific enzyme binds to DNA to synthesize single-stranded mRNA during transcription?",
                    "answer": "• Transcription Boundary: Transcription converts genetic data from DNA into a complementary RNA sequence.\n• Active Enzyme: RNA Polymerase binds to a promoter region, unzips the helix, and matches nucleotides to build the single-stranded mRNA."
                }
            ],
            "quizzes": [
                { "id": "b12_q1", "text": "Name the enzyme that unzips the DNA double helix and binds to the promoter region to synthesize mRNA.", "concept": "Transcription Enzymes" }
            ],
            "finalExam": [
                { 
                  "qId": "b12_f1", 
                  "moduleOrigin": "Module 1: Transcription Dynamics",
                  "text": "Identify the primary enzyme responsible for synthesizing single-stranded RNA from a DNA template during transcription. (Provide the standard multi-word name)", 
                  "expected": "RNA Polymerase",
                  "formula": "DNA transcription to mRNA pathway",
                  "misconception": "Student might mistake it for DNA Polymerase or Helicase."
                }
            ]
        },
        "Undergraduate": {
            "cards": [
                {
                    "id": "bug_c1",
                    "topic": "Epigenetic Modification",
                    "question": "What group of specialized enzymes catalyzes the addition of methyl groups to histone tails to enforce silencing?",
                    "answer": "• Chromatin Alterations: Epigenetics adjusts gene expression without changing the core underlying DNA sequence.\n• Silencing Mechanism: Histone Methyltransferases add methyl groups to histone tails, compressing chromatin to silence transcription."
                }
            ],
            "quizzes": [
                { "id": "bug_q1", "text": "Which class of enzymes catalyzes the transfer of methyl groups to histone proteins, causing chromatin condensation?", "concept": "Epigenetic Modification" }
            ],
            "finalExam": [
                { 
                  "qId": "bug_f1", 
                  "moduleOrigin": "Module 1: Chromatin Remodeling",
                  "text": "What class of enzymes is responsible for adding methyl groups to histone proteins to compact chromatin and silence gene expression? (Provide the plural name, e.g., histone methyltransferases)", 
                  "expected": "histone methyltransferases",
                  "formula": "Histone Modification Cascade",
                  "misconception": "Student might mistake it for DNA methyltransferases or histone acetyltransferases."
                }
            ]
        }
    },
    "Mathematics": {
        "Class 10": {
            "cards": [
                {
                    "id": "m10_c1",
                    "topic": "Linear Equations",
                    "question": "How do you solve for x in a linear equation like 3x + 7 = 22?",
                    "answer": "• Balance Rule: A linear equation must remain balanced by applying equal transformations to both sides.\n• Isolation Sequence: Subtract 7 from both sides to clear addition (3x = 15), then apply inverse multiplication by dividing by 3 to find x = 5."
                }
            ],
            "quizzes": [
                { "id": "m10_q1", "text": "In the linear algebraic equation 2x - 5 = 11, what is the value of x?", "concept": "Linear Equations" }
            ],
            "finalExam": [
                { 
                  "qId": "m10_f1", 
                  "moduleOrigin": "Module 1: Linear Algebraic Transformations",
                  "text": "Solve for the variable x in the linear algebraic equation: 5x + 12 = 47. (Provide numerical integer only)", 
                  "expected": "7",
                  "formula": "x = (C - B) / A for Ax + B = C",
                  "misconception": "Student might add 12 to 47 instead of subtracting, or divide incorrectly."
                }
            ]
        },
        "Class 11-12": {
            "cards": [
                {
                    "id": "m12_c1",
                    "topic": "The Power Rule",
                    "question": "What is the derivative of the polynomial function f(x) = 3x² + 2x using the Power Rule?",
                    "answer": "• Derivative Definition: Calculates the instantaneous rate of change or slope of a function at an exact coordinate point.\n• Calculation: Applying the Power Rule (the derivative of x^n is n * x^(n-1)) to each term independently yields exactly 6x + 2."
                }
            ],
            "quizzes": [
                { "id": "m12_q1", "text": "Using the power rule, find the derivative of the function f(x) = 4x³ - 5x.", "concept": "The Power Rule" }
            ],
            "finalExam": [
                { 
                  "qId": "m12_f1", 
                  "moduleOrigin": "Module 1: Power Rule Differentiation",
                  "text": "Find the derivative of the function f(x) = 2x³ + 4x with respect to x. (Provide the resulting algebraic expression without spaces, using ^ for powers, e.g. 6x^2+4)", 
                  "expected": "6x^2+4",
                  "formula": "d/dx [x^n] = n * x^(n-1)",
                  "misconception": "Student might forget to subtract 1 from the exponent or ignore the constant multiplier."
                }
            ]
        },
        "Undergraduate": {
            "cards": [
                {
                    "id": "mug_c1",
                    "topic": "Fundamental Theorem of Calculus",
                    "question": "How does the Fundamental Theorem of Calculus simplify bounded continuous integration?",
                    "answer": "• Fundamental Link: Formally connects differentiation and integration as inverse structural operations.\n• Resolution Rule: Proves that the definite integral of f(x) from a to b can be resolved by tracking the anti-derivative boundaries: F(b) - F(a)."
                }
            ],
            "quizzes": [
                { "id": "mug_q1", "text": "Evaluate the definite integral of f(x) = 2x from x = 1 to x = 3 using the Fundamental Theorem of Calculus.", "concept": "Fundamental Theorem of Calculus" }
            ],
            "finalExam": [
                { 
                  "qId": "mug_f1", 
                  "moduleOrigin": "Module 1: Bounded Integration Limits",
                  "text": "Evaluate the definite integral of the function f(x) = 3x² from x = 1 to x = 3. (Provide numerical integer only)", 
                  "expected": "26",
                  "formula": "Integral(a to b) f(x)dx = F(b) - F(a) where F'(x) = f(x)",
                  "misconception": "Student might evaluate the boundary as F(3) - F(0) or perform the integration power rule incorrectly."
                }
            ]
        }
    }
}
