import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import { 
  BookOpen, 
  HelpCircle, 
  GraduationCap, 
  ChevronRight, 
  BrainCircuit, 
  ArrowRight, 
  Zap, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Database, 
  Activity, 
  Network, 
  Sparkles,
  Bookmark,
  MessageSquare,
  Send
} from 'lucide-react';

/** Lightweight markdown renderer for tutor hints (headers, bullets, bold). */
function formatInlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-200">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function HintMarkdown({ text, className = '' }) {
  if (!text) return null;

  const blocks = [];
  let listItems = [];
  let listType = null;

  const flushList = () => {
    if (!listItems.length) return;
    const ListTag = listType === 'ordered' ? 'ol' : 'ul';
    const listClass = listType === 'ordered' ? 'list-decimal' : 'list-disc';
    blocks.push(
      <ListTag key={`list-${blocks.length}`} className={`${listClass} ml-4 space-y-1 my-1.5`}>
        {listItems.map((item, idx) => (
          <li key={idx} className="leading-relaxed">{formatInlineMarkdown(item)}</li>
        ))}
      </ListTag>
    );
    listItems = [];
    listType = null;
  };

  text.split('\n').forEach((rawLine, lineIdx) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith('### ')) {
      flushList();
      blocks.push(<h5 key={lineIdx} className="font-bold text-[11px] mt-2 mb-1 text-slate-200">{formatInlineMarkdown(line.slice(4))}</h5>);
    } else if (line.startsWith('## ')) {
      flushList();
      blocks.push(<h4 key={lineIdx} className="font-bold text-xs mt-2 mb-1 text-slate-100">{formatInlineMarkdown(line.slice(3))}</h4>);
    } else if (line.startsWith('# ')) {
      flushList();
      blocks.push(<h3 key={lineIdx} className="font-bold text-sm mt-2 mb-1">{formatInlineMarkdown(line.slice(2))}</h3>);
    } else if (/^[-*]\s+/.test(line)) {
      if (listType && listType !== 'unordered') flushList();
      listType = 'unordered';
      listItems.push(line.replace(/^[-*]\s+/, ''));
    } else if (/^\d+\.\s+/.test(line)) {
      if (listType && listType !== 'ordered') flushList();
      listType = 'ordered';
      listItems.push(line.replace(/^\d+\.\s+/, ''));
    } else {
      flushList();
      blocks.push(<p key={lineIdx} className="leading-relaxed">{formatInlineMarkdown(line)}</p>);
    }
  });
  flushList();

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
}

const FALLBACK_CURRICULUM = {
  Physics: {
    'Class 10': {
      cards: [
        { id: 'p10_c1', topic: "Newton's Second Law", question: "What is the core formula for Newton's Second Law and how does force interact with mass?", answer: "• Core Equation: Force = Mass x Acceleration (F = m x a).\n• Core Metric: Applying an unbalanced external force to an object causes it to change its velocity over time.\n• Computational Breakdown: A 10 kg object accelerating at 5 m/s² experiences a net force of exactly 50 Newtons (10 kg x 5 m/s² = 50 N)." },
        { id: 'p10_c2', topic: "Friction Dynamics", question: "What is friction and how does its vector orientation behave relative to motion?", answer: "• Contact Force Parameters: Friction is an electromagnetic contact force arising between surface micro-irregularities.\n• Vector Boundary Law: It operates as a resistive vector directed exactly 180 degrees opposite to the object's active or intended motion vector." },
        { id: 'p10_c3', topic: "Kinematics & Constant Velocity", question: "What is the mathematical value of acceleration when a vehicle travels at a constant velocity?", answer: "• Constant Velocity Definition: Implies that the speed value and directional heading remain invariant over a discrete time frame.\n• Zero Variance Law: Since acceleration is defined as dV/dt (change in velocity over time), an object maintaining a steady 20 m/s holds an acceleration of precisely 0 m/s²." }
      ],
      quizzes: [
        { id: "p10_q1", text: "A 10kg structural mass experiences a constant acceleration of 5 m/s². Calculate the active net force vector acting on it in Newtons.", concept: "Newton's Second Law" },
        { id: "p10_q2", text: "If an automated transport vehicle moves at a perfectly uniform constant velocity of 20 m/s for 10 seconds, what is its rate of acceleration in m/s²?", concept: "Kinematics" }
      ],
      finalExam: [
        { 
          qId: "p10_f1", 
          moduleOrigin: "Module 1: Newton's Second Law",
          text: "A mechanical component with an exact mass of 8 kg accelerates uniformly across a smooth linear track at 4 m/s². Compute the total active horizontal force applied in Newtons (Provide numerical integer only).", 
          expected: "32",
          formula: "Force = Mass x Acceleration (F = m x a)",
          misconception: "Student might be dividing the variables (8/4 or 4/8) instead of applying multiplication metrics."
        },
        { 
          qId: "p10_f2", 
          moduleOrigin: "Module 2: Friction Dynamics",
          text: "An automated storage block is dragged along a straight conveyor belt line toward the north direction. In what vector heading direction does the surface friction force operate?", 
          expected: "south",
          formula: "Friction Vector = -1 x (Active Vector Path Heading Direction)",
          misconception: "Student might think friction assists movement or acts downward alongside gravity parameters."
        },
        { 
          qId: "p10_f3", 
          moduleOrigin: "Module 3: Kinematics & Constant Velocity",
          text: "A high-speed tracking train operates along a straight route at a perfectly constant velocity of 45 m/s for a duration of 60 seconds. What is the active acceleration rate in m/s²?", 
          expected: "0",
          formula: "Acceleration (a) = Delta Velocity / Delta Time (Δv / Δt)",
          misconception: "Student might try to calculate a change by multiplying 45 x 60, forgetting that constant velocity means acceleration is absolute zero."
        }
      ]
    },
    'Class 11-12': {
      cards: [
        { id: 'p12_c1', topic: "Two-Dimensional Projectiles", question: "How is a projectile's motion vector decoupled in an idealized ballistic flight plane?", answer: "• Vector Decomposition: Split into independent horizontal (x) and vertical (y) component axes under gravitational field acceleration (g = 9.8 m/s²).\n• Spatial Inertia Axiom: Neglecting drag, horizontal acceleration is zero (ax = 0), establishing a constant uniform velocity along the x-axis throughout flight." },
        { id: 'p12_c2', topic: "Peak Trajectory Constraints", question: "What specific boundary condition occurs to a projectile's velocity components at its maximum height?", answer: "• Peak Coordinates Boundary: At the vertex of the parabolic flight path, the vertical velocity vector drops precisely to zero (vy = 0).\n• Active Horizontal Velocity: The horizontal velocity vector remains entirely active and unmodified." }
      ],
      quizzes: [
        { id: "p12_q1", text: "A research payload is launched ballistically into a parabolic path. When it reaches its absolute maximum peak height, what is the value of its vertical velocity component in m/s?", concept: "Projectile Motion" }
      ],
      finalExam: [
        { 
          qId: "p12_f1", 
          moduleOrigin: "Module 1: Projectile Component Systems",
          text: "During an idealized ballistic flight tracking projectile dynamics, calculate the value of the vertical velocity component vector in m/s at the absolute peak height coordinates.", 
          expected: "0",
          formula: "Vertical Velocity at Peak Vertex (v_y) = 0",
          misconception: "Student might mistake total velocity for zero, or try to factor in the active horizontal speed value."
        }
      ]
    },
    'Undergraduate': {
      cards: [
        { id: 'pug_c1', topic: "Lagrangian Formulations", question: "What is the structural definition of the Lagrangian function (L) in analytical mechanics?", answer: "• Scalar Energy Mapping: Transitions dynamic tracking away from traditional vector forces into scalar energy spaces.\n• Foundational System Relation: It is defined as the difference between the system's kinetic energy and potential energy, modeled explicitly as L = T - V." }
      ],
      quizzes: [
        { id: "pug_q1", text: "What fundamental scalar energy formula connects Kinetic Energy (T) and Potential Energy (V) to define the system Lagrangian (L)?", concept: "Lagrangian Mechanics" }
      ],
      finalExam: [
        { 
          qId: "pug_f1", 
          moduleOrigin: "Module 1: Analytical Mechanics",
          text: "Input the baseline scalar equation defining the system state Lagrangian (L) as a function of kinetic energy (T) and potential energy (V) using standard notation.", 
          expected: "l=t-v",
          formula: "Lagrangian Function (L) = Kinetic Energy (T) - Potential Energy (V)",
          misconception: "Student might inadvertently add the metrics (T+V), which instead characterizes the system Hamiltonian function."
        }
      ]
    }
  },
  Biology: {
    'Class 10': {
      cards: [
        { id: 'b10_c1', topic: "Cellular Energy", question: "What is the primary function of mitochondria in a eukaryotic cell?", answer: "• Cellular Organelles: Mitochondria are specialized membrane-bound subunits inside cells.\n• Power Generation: They act as cellular power plants, running respiration processes to convert nutrients into high-energy ATP molecules." }
      ],
      quizzes: [
        { id: "b10_q1", text: "Which membrane-bound organelle acts as the main power plant of eukaryotic cells by generating ATP?", concept: "Cellular Energy" }
      ],
      finalExam: [
        { 
          qId: "b10_f1", 
          moduleOrigin: "Module 1: Cellular Power Plants",
          text: "What is the primary chemical compound that mitochondria produce to store and transfer energy within eukaryotic cells? (Provide the 3-letter abbreviation only)", 
          expected: "ATP",
          formula: "Adenosine Triphosphate Synthesis",
          misconception: "Student might think of glucose or ADP instead of the immediate energy currency."
        }
      ]
    },
    'Class 11-12': {
      cards: [
        { id: 'b12_c1', topic: "Transcription Enzymes", question: "What specific enzyme binds to DNA to synthesize single-stranded mRNA during transcription?", answer: "• Transcription Boundary: Transcription converts genetic data from DNA into a complementary RNA sequence.\n• Active Enzyme: RNA Polymerase binds to a promoter region, unzips the helix, and matches nucleotides to build the single-stranded mRNA." }
      ],
      quizzes: [
        { id: "b12_q1", text: "Name the enzyme that unzips the DNA double helix and binds to the promoter region to synthesize mRNA.", concept: "Transcription Enzymes" }
      ],
      finalExam: [
        { 
          qId: "b12_f1", 
          moduleOrigin: "Module 1: Transcription Dynamics",
          text: "Identify the primary enzyme responsible for synthesizing single-stranded RNA from a DNA template during transcription. (Provide the standard multi-word name)", 
          expected: "RNA Polymerase",
          formula: "DNA transcription to mRNA pathway",
          misconception: "Student might mistake it for DNA Polymerase or Helicase."
        }
      ]
    },
    'Undergraduate': {
      cards: [
        { id: 'bug_c1', topic: "Epigenetic Modification", question: "What group of specialized enzymes catalyzes the addition of methyl groups to histone tails to enforce silencing?", answer: "• Chromatin Alterations: Epigenetics adjusts gene expression without changing the core underlying DNA sequence.\n• Silencing Mechanism: Histone Methyltransferases add methyl groups to histone tails, compressing chromatin to silence transcription." }
      ],
      quizzes: [
        { id: "bug_q1", text: "Which class of enzymes catalyzes the transfer of methyl groups to histone proteins, causing chromatin condensation?", concept: "Epigenetic Modification" }
      ],
      finalExam: [
        { 
          qId: "bug_f1", 
          moduleOrigin: "Module 1: Chromatin Remodeling",
          text: "What class of enzymes is responsible for adding methyl groups to histone proteins to compact chromatin and silence gene expression? (Provide the plural name, e.g., histone methyltransferases)", 
          expected: "histone methyltransferases",
          formula: "Histone Modification Cascade",
          misconception: "Student might mistake it for DNA methyltransferases or histone acetyltransferases."
        }
      ]
    }
  },
  Mathematics: {
    'Class 10': {
      cards: [
        { id: 'm10_c1', topic: "Linear Equations", question: "How do you solve for x in a linear equation like 3x + 7 = 22?", answer: "• Balance Rule: A linear equation must remain balanced by applying equal transformations to both sides.\n• Isolation Sequence: Subtract 7 from both sides to clear addition (3x = 15), then apply inverse multiplication by dividing by 3 to find x = 5." }
      ],
      quizzes: [
        { id: "m10_q1", text: "In the linear algebraic equation 2x - 5 = 11, what is the value of x?", concept: "Linear Equations" }
      ],
      finalExam: [
        { 
          qId: "m10_f1", 
          moduleOrigin: "Module 1: Linear Algebraic Transformations",
          text: "Solve for the variable x in the linear algebraic equation: 5x + 12 = 47. (Provide numerical integer only)", 
          expected: "7",
          formula: "x = (C - B) / A for Ax + B = C",
          misconception: "Student might add 12 to 47 instead of subtracting, or divide incorrectly."
        }
      ]
    },
    'Class 11-12': {
      cards: [
        { id: 'm12_c1', topic: "The Power Rule", question: "What is the derivative of the polynomial function f(x) = 3x² + 2x using the Power Rule?", answer: "• Derivative Definition: Calculates the instantaneous rate of change or slope of a function at an exact coordinate point.\n• Calculation: Applying the Power Rule (the derivative of x^n is n * x^(n-1)) to each term independently yields exactly 6x + 2." }
      ],
      quizzes: [
        { id: "m12_q1", text: "Using the power rule, find the derivative of the function f(x) = 4x³ - 5x.", concept: "The Power Rule" }
      ],
      finalExam: [
        { 
          qId: "m12_f1", 
          moduleOrigin: "Module 1: Power Rule Differentiation",
          text: "Find the derivative of the function f(x) = 2x³ + 4x with respect to x. (Provide the resulting algebraic expression without spaces, using ^ for powers, e.g. 6x^2+4)", 
          expected: "6x^2+4",
          formula: "d/dx [x^n] = n * x^(n-1)",
          misconception: "Student might forget to subtract 1 from the exponent or ignore the constant multiplier."
        }
      ]
    },
    'Undergraduate': {
      cards: [
        { id: 'mug_c1', topic: "Fundamental Theorem of Calculus", question: "How does the Fundamental Theorem of Calculus simplify bounded continuous integration?", answer: "• Fundamental Link: Formally connects differentiation and integration as inverse structural operations.\n• Resolution Rule: Proves that the definite integral of f(x) from a to b can be resolved by tracking the anti-derivative boundaries: F(b) - F(a)." }
      ],
      quizzes: [
        { id: "mug_q1", text: "Evaluate the definite integral of f(x) = 2x from x = 1 to x = 3 using the Fundamental Theorem of Calculus.", concept: "Fundamental Theorem of Calculus" }
      ],
      finalExam: [
        { 
          qId: "mug_f1", 
          moduleOrigin: "Module 1: Bounded Integration Limits",
          text: "Evaluate the definite integral of the function f(x) = 3x² from x = 1 to x = 3. (Provide numerical integer only)", 
          expected: "26",
          formula: "Integral(a to b) f(x)dx = F(b) - F(a) where F'(x) = f(x)",
          misconception: "Student might evaluate the boundary as F(3) - F(0) or perform the integration power rule incorrectly."
        }
      ]
    }
  }
};

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [activeTier, setActiveTier] = useState('Class 10');
  const [activeView, setActiveView] = useState('theory'); 
  
  // Curriculum States Loaded Dynamically from API
  const [cards, setCards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [finalExams, setFinalExams] = useState([]);
  
  // Flashcard Flip State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [isAiGeneratedCards, setIsAiGeneratedCards] = useState(false);
  const [isCardsCached, setIsCardsCached] = useState(false);

  // Socratic Mock Test States
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [telemetry, setTelemetry] = useState({ activeNode: 'Idle', remedialPathActive: false, retrievedContext: [] });
  const [retainedMockHistory, setRetainedMockHistory] = useState([]);
  const [mockErrors, setMockErrors] = useState(0);

  // Final Exam State
  const [activeExamQuestionIndex, setActiveExamQuestionIndex] = useState(0);
  const [examTextInputs, setExamTextInputs] = useState({});
  const [currentAttemptsCount, setCurrentAttemptsCount] = useState(1);
  const [questionScoreRegistry, setQuestionScoreRegistry] = useState({});
  const [examReport, setExamReport] = useState(null);

  // Live Timer for final exam questions (Stopwatch)
  const [questionTimer, setQuestionTimer] = useState(0);

  // Hints
  const [serverEvaluatedHint, setServerEvaluatedHint] = useState(null);
  const [mamdaniTier, setMamdaniTier]       = useState(null);
  const [mamdaniRemark, setMamdaniRemark]   = useState(null);
  const [mamdaniGapAnalysis, setMamdaniGapAnalysis] = useState(null);
  const [showSideHintBox, setShowSideHintBox] = useState(false);
  const [lastQuestionEvaluated, setLastQuestionEvaluated] = useState(false);
  const [isQuestionPassed, setIsQuestionPassed] = useState(false);
  const [currentDegreeOfFailure, setCurrentDegreeOfFailure] = useState(0);

  const [loading, setLoading] = useState(false);

  // Load curriculum on start or change
  useEffect(() => {
    loadCurriculum(activeSubject, activeTier);
  }, [activeSubject, activeTier]);

  // Handle ticking stopwatch timer for final exam
  useEffect(() => {
    let interval = null;
    if (activeView === 'final_exam' && !examReport && !lastQuestionEvaluated && !loading && finalExams.length > 0) {
      interval = setInterval(() => {
        setQuestionTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeView, examReport, lastQuestionEvaluated, loading, activeExamQuestionIndex, finalExams]);

  const loadCurriculum = async (subject, tier) => {
    setLoading(true);
    clearSessions();
    setIsAiGeneratedCards(false);
    setIsCardsCached(false);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tutor/load-theory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_subject: subject, current_tier: tier })
      });
      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setCards((data.cards || []).slice(0, 3));
      setQuizzes(data.quizzes || []);
      setFinalExams(data.finalExam || []);
      setIsAiGeneratedCards(!!data.is_ai_generated);
      setIsCardsCached(!!data.is_cached);
      
      if (data.quizzes && data.quizzes.length > 0) {
        setCurrentQuestion(data.quizzes[0]);
      }
    } catch (e) {
      console.warn("Backend API not reachable. Loading frontend fallback curriculum database...", e);
      // Fallback load
      const fallback = FALLBACK_CURRICULUM[subject]?.[tier] || { cards: [], quizzes: [], finalExam: [] };
      setCards((fallback.cards || []).slice(0, 3));
      setQuizzes(fallback.quizzes || []);
      setFinalExams(fallback.finalExam || []);
      if (fallback.quizzes && fallback.quizzes.length > 0) {
        setCurrentQuestion(fallback.quizzes[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateAiFlashcards = async () => {
    setIsGeneratingCards(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tutor/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_subject: activeSubject, current_tier: activeTier })
      });
      if (!response.ok) throw new Error("Failed to generate AI flashcards");
      const data = await response.json();
      if (data.cards && data.cards.length > 0) {
        setCards(data.cards.slice(0, 3));
        setCardIndex(0);
        setIsFlipped(false);
        setIsAiGeneratedCards(true);
        setIsCardsCached(!!data.cached);
      }
    } catch (e) {
      console.error("AI Flashcard generation error:", e);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const clearSessions = () => {
    setChatLog([]); setExamTextInputs({}); setExamReport(null); setRetainedMockHistory([]);
    setCardIndex(0); setIsFlipped(false); setActiveExamQuestionIndex(0);
    setServerEvaluatedHint(null); setShowSideHintBox(false); setLastQuestionEvaluated(false);
    setIsQuestionPassed(false); setCurrentDegreeOfFailure(0); setCurrentAttemptsCount(1);
    setQuestionScoreRegistry({}); setMockErrors(0); setQuestionTimer(0);
    setTelemetry({ activeNode: 'Idle', remedialPathActive: false, retrievedContext: [] });
  };

  const nextFlashcard = () => {
    if (cardIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCardIndex(prev => prev + 1), 150);
    }
  };

  const prevFlashcard = () => {
    if (cardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCardIndex(prev => prev - 1), 150);
    }
  };

  const handleShortAnswerEvaluation = async () => {
    if (finalExams.length === 0) return;
    const currentTarget = finalExams[activeExamQuestionIndex];
    const studentText = examTextInputs[currentTarget.qId] || "";
    if (!studentText.trim()) return;

    setLoading(true);
    const API_BASE = 'http://127.0.0.1:8000';
    try {
      const response = await fetch(`${API_BASE}/api/tutor/evaluate-short-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: currentTarget.text,
          student_raw_input: studentText,
          expected_answer: currentTarget.expected,
          seconds_spent: questionTimer,
          attempts_count: currentAttemptsCount,
          current_tier: activeTier,
          current_subject: activeSubject,
          hint_formula: currentTarget.formula || "",
          hint_misconception: currentTarget.misconception || ""
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend error ${response.status}: ${errText}`);
      }

      const result = await response.json();
      setCurrentDegreeOfFailure(result.degree_of_failure);
      setMamdaniTier(result.performance_tier || null);
      setMamdaniRemark(result.linguistic_remark || null);
      setMamdaniGapAnalysis(result.gap_analysis || null);
      
      // Save stats to registry
      setQuestionScoreRegistry(prev => ({
        ...prev, [currentTarget.qId]: { 
          score: result.fuzzy_score, 
          tier: result.performance_tier, 
          correct: result.is_correct,
          attempts: currentAttemptsCount,
          latency: questionTimer
        }
      }));

      // Update telemetry node to Socratic or Direct based on failure degree
      setTelemetry({
        activeNode: result.is_correct ? 'DiagnosticEvaluationNode' : (result.degree_of_failure >= 60.0 ? 'DirectExplanationNode' : 'SocraticScaffoldingNode'),
        remedialPathActive: !result.is_correct && result.degree_of_failure >= 60.0,
        retrievedContext: [currentTarget.formula || "No context formula available."]
      });

      if (!result.is_correct) {
        setServerEvaluatedHint(result.assigned_hint);
        setLastQuestionEvaluated(true);
        setIsQuestionPassed(false);
      } else {
        setIsQuestionPassed(true);
        setLastQuestionEvaluated(true);
        setServerEvaluatedHint(result.assigned_hint); // show the "Correct + Mamdani score" message
        setShowSideHintBox(false);
      }

    } catch (e) {
      console.error(e);
      // Client-side grade fallback if backend fails during test
      const isCorrect = studentText.trim().toLowerCase() === currentTarget.expected.trim().toLowerCase();
      const mockScore = isCorrect ? Math.max(50, 100 - (currentAttemptsCount - 1) * 20) : 20;
      const mockTier = mockScore >= 85 ? "High Mastery" : (mockScore >= 70 ? "Moderate Mastery" : "Developing");
      setQuestionScoreRegistry(prev => ({
        ...prev, [currentTarget.qId]: { 
          score: mockScore, 
          tier: mockTier, 
          correct: isCorrect,
          attempts: currentAttemptsCount,
          latency: questionTimer
        }
      }));
      setIsQuestionPassed(isCorrect);
      setLastQuestionEvaluated(true);
      setServerEvaluatedHint(isCorrect ? null : `Check the concept of ${currentTarget.moduleOrigin}.`);
    } finally {
      setLoading(false);
    }
  };

  const triggerRetakeAttemptLoop = () => {
    setLastQuestionEvaluated(false);
    setIsQuestionPassed(false);
    setCurrentAttemptsCount(prev => prev + 1);
    setExamTextInputs(prev => ({ ...prev, [finalExams[activeExamQuestionIndex].qId]: "" }));
  };

  const forceAdvanceNextItem = () => {
    setServerEvaluatedHint(null); setShowSideHintBox(false); setLastQuestionEvaluated(false);
    setIsQuestionPassed(false); setCurrentDegreeOfFailure(0); setCurrentAttemptsCount(1);
    setQuestionTimer(0);

    const nextIdx = activeExamQuestionIndex + 1;
    if (nextIdx < finalExams.length) {
      setActiveExamQuestionIndex(nextIdx);
    } else {
      triggerFinalEvaluationReport();
    }
  };

  const triggerFinalEvaluationReport = async () => {
    setLoading(true);
    const detailsList = finalExams.map(q => {
      const record = questionScoreRegistry[q.qId] || {};
      return {
        qId: q.qId,
        is_correct: record.correct || false,
        attempts: record.attempts || 1,
        latency_seconds: record.latency || 0,
        fuzzy_score: record.score || 0.0
      };
    });

    try {
      let response = await fetch('http://127.0.0.1:8000/api/tutor/evaluate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_tier: activeTier,
          current_subject: activeSubject,
          mock_chat_history: retainedMockHistory,
          question_details: detailsList
        })
      });
      const result = await response.json();
      setExamReport(result);
    } catch (e) { 
      console.error(e);
      // Frontend fallback report calculation
      const avgScore = detailsList.reduce((acc, curr) => acc + curr.fuzzy_score, 0) / Math.max(1, detailsList.length);
      const ratingTier = avgScore >= 85 ? "High Mastery" : (avgScore >= 70 ? "Moderate Mastery" : (avgScore >= 50 ? "Developing" : "Intervention Required"));
      let fallbackHint = "";
      if (ratingTier === "High Mastery") {
        fallbackHint = "Exceptional results! Challenge yourself by applying these concepts to real-world multi-variable problems or exploring advanced mathematical derivations.";
      } else if (ratingTier === "Moderate Mastery") {
        fallbackHint = "Great job! Try to focus on pacing and reducing execution time on calculations to build stronger automatic recall.";
      } else if (ratingTier === "Developing") {
        fallbackHint = "Good effort! Go back to the flashcards and review the specific formulas you missed. Try to explain why each term is placed where it is.";
      } else {
        fallbackHint = "Review required. Work through the core textbook chapters and focus on understanding the governing formulas step-by-step before attempting the exam again.";
      }
      setExamReport({
        calculated_score: Math.round(avgScore),
        rating_tier: ratingTier,
        mentor_remark: "Evaluation compiled locally. Core analytical components resolved.",
        remediation_hint: fallbackHint,
        growth_metrics: {
          pathway_taken: "Pathway A: Guided Scaffolding",
          score_delta_pct: 12.5,
          analytical_insight: "Socratic hinting resolved major blockages."
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const submitQuizAnswer = async (overrideText = null) => {
    const queryText = (overrideText !== null ? overrideText : studentAnswer).trim();
    if (!queryText || !currentQuestion) return;

    setLoading(true);
    const userMessage = { text: queryText, sender: 'student' };
    const nextHistory = [...chatLog, userMessage];
    setChatLog(nextHistory);
    if (overrideText === null) setStudentAnswer('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Topic/Question: ${currentQuestion.concept} (${currentQuestion.text}) | Student Inquiry: ${queryText}`,
          time_taken: 15,
          consecutive_errors: mockErrors,
          current_tier: activeTier,
          current_subject: activeSubject,
          history: chatLog
        })
      });
      if (!response.ok) throw new Error("Chat API failed");
      const result = await response.json();
      
      const updatedLog = [
        ...nextHistory,
        {
          text: result.response,
          sender: 'tutor',
          node: result.active_node,
          depth: result.depth_level || 'surface',
          mamdani: result.mamdani_evaluation || { performance_tier: 'Developing', fuzzy_score: 60.0 }
        }
      ];
      setChatLog(updatedLog);
      setRetainedMockHistory(updatedLog);

      const isRemedial = result.remedial_triggered || (result.active_node && result.active_node.includes('Direct'));
      if (isRemedial) {
        setMockErrors(prev => prev + 1);
      } else {
        setMockErrors(0);
      }

      setTelemetry({
        activeNode: result.active_node || "Discussion Node",
        remedialPathActive: isRemedial,
        retrievedContext: result.context_pulled || []
      });
    } catch (error) {
      console.error("Discussion chat error:", error);
      const dynamicFallback = (
        `Great question about **${queryText}**!\n\n` +
        `In ${activeSubject} (${activeTier}), this concept ties directly into **${currentQuestion.concept}**.\n\n` +
        `• **Intuitive Overview**: Consider how energy and force vectors balance in this system.\n` +
        `• **Next Step**: Would you like a step-by-step formula breakdown or a real-world example?`
      );
      const updatedLog = [
        ...nextHistory,
        {
          text: dynamicFallback,
          sender: 'tutor',
          node: 'Discussion Node',
          depth: 'surface'
        }
      ];
      setChatLog(updatedLog);
      setTelemetry(prev => ({ ...prev, activeNode: "Discussion Node" }));
    } finally {
      setLoading(false);
    }
  };

  // Subject Colors mapping for highlights
  const getSubjectColor = (subject) => {
    if (subject === 'Physics') return { text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10', hover: 'hover:border-blue-500/50', btn: 'bg-blue-600 hover:bg-blue-500 text-white' };
    if (subject === 'Biology') return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', hover: 'hover:border-emerald-500/50', btn: 'bg-emerald-600 hover:bg-emerald-500 text-white' };
    return { text: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10', hover: 'hover:border-purple-500/50', btn: 'bg-purple-600 hover:bg-purple-500 text-white' };
  };

  const activeColor = getSubjectColor(activeSubject);

  if (showLanding) {
    return (
      <LandingPage 
        onSignUp={() => setShowLanding(false)} 
        onNavigateSubject={(subject) => {
          setActiveSubject(subject);
          setShowLanding(false);
        }}
        onNavigateTier={(tier) => {
          setActiveTier(tier);
          setShowLanding(false);
        }}
        onStartLearning={(subject, tier) => {
          setActiveSubject(subject);
          setActiveTier(tier);
          setShowLanding(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* GLOWING ORB DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header className="w-full glass-panel border-b border-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-950/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AURA COGNITIVE COMPANION</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Enterprise Educational System v2.1</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {['Physics', 'Biology', 'Mathematics'].map(sub => (
              <button 
                key={sub} 
                onClick={() => { setActiveSubject(sub); }} 
                className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all ${activeSubject === sub ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {['Class 10', 'Class 11-12', 'Undergraduate'].map(tier => (
              <button 
                key={tier} 
                onClick={() => { setActiveTier(tier); }} 
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${activeTier === tier ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                {tier}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* DASHBOARD MAIN LAYOUT */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT NAV PANEL - TABS SELECTOR */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel rounded-2xl p-4 space-y-2 glow-blue">
            <h2 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase px-2 mb-2">Workspace Modes</h2>
            
            <button 
              onClick={() => setActiveView('theory')} 
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${activeView === 'theory' ? activeColor.bg + ' ' + activeColor.border + ' ' + activeColor.text : 'border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-semibold">Study Deck</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button 
              onClick={() => setActiveView('quiz')} 
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${activeView === 'quiz' ? activeColor.bg + ' ' + activeColor.border + ' ' + activeColor.text : 'border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
              disabled={quizzes.length === 0}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">Practice Lab</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button 
              onClick={() => setActiveView('final_exam')} 
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${activeView === 'final_exam' ? activeColor.bg + ' ' + activeColor.border + ' ' + activeColor.text : 'border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
              disabled={finalExams.length === 0}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4" />
                <span className="text-xs font-semibold">Threshold Exam</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

          {/* ACTIVE STATUS DETAIL */}
          <div className="glass-panel rounded-2xl p-4 space-y-4 border border-slate-900 text-xs">
            <h3 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Context Metadata</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
                <span className="text-slate-500">Subject</span>
                <span className="font-semibold text-slate-300">{activeSubject}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
                <span className="text-slate-500">Academic Tier</span>
                <span className="font-semibold text-slate-300">{activeTier}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
                <span className="text-slate-500">Chroma RAG status</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER INTERACTION PANEL */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 glow-purple border border-slate-900 min-h-[600px] flex flex-col justify-between">
          
          {loading ? (
            <div className="flex-1 flex flex-col justify-center items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-purple-500 animate-spin"></div>
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Accessing Brain Nodes...</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              
              {/* STUDY DECK VIEW */}
              {activeView === 'theory' && (
                <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                  
                  {/* TOP CONTROL BAR */}
                  <div className="flex flex-wrap justify-between items-center border-b border-slate-900/80 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        Textbook Study Guides
                      </span>
                      {isAiGeneratedCards && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                          RAG AI Generated (3 Cards) {isCardsCached && <span className="text-emerald-400 font-bold ml-1">• Cached</span>}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-900">
                        Card {cards.length > 0 ? cardIndex + 1 : 0} of {cards.length}
                      </span>
                      
                      <button
                        onClick={generateAiFlashcards}
                        disabled={isGeneratingCards}
                        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-lg shadow-purple-950/50 hover:shadow-purple-900/60 transition-all flex items-center gap-1.5 disabled:opacity-50 border border-purple-400/30"
                      >
                        {isGeneratingCards ? (
                          <>
                            <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Generating RAG...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Generate AI Flashcards</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3D PERSPECTIVE FLIP CARD CONTAINER */}
                  {cards.length > 0 ? (
                    <>
                      <div className="flex-1 flex items-center justify-center py-2">
                        <div 
                          onClick={() => setIsFlipped(!isFlipped)} 
                          className="flip-card w-full max-w-[480px] h-[310px] cursor-pointer group"
                        >
                          <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                            
                            {/* FRONT SIDE */}
                            <div className="flip-card-front bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/40 border border-purple-900/30 hover:border-purple-500/50 p-6 flex flex-col justify-between items-center text-center shadow-2xl rounded-2xl relative overflow-hidden transition-all duration-300">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-inner">
                                {cards[cardIndex]?.topic}
                              </span>
                              <p className="text-base font-semibold leading-relaxed text-slate-100 max-w-[380px]">
                                {cards[cardIndex]?.question}
                              </p>
                              <span className="text-[11px] text-purple-300/70 flex items-center gap-1.5 font-medium group-hover:text-purple-300 transition-colors">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
                                Click to Flip Card
                              </span>
                            </div>

                            {/* BACK SIDE */}
                            <div className="flip-card-back bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-900/40 p-6 flex flex-col justify-between items-start text-left shadow-2xl rounded-2xl overflow-y-auto custom-scrollbar relative">
                              <div className="flex justify-between items-center w-full border-b border-indigo-900/30 pb-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                  Conceptual Breakdown
                                </span>
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                                  {cards[cardIndex]?.topic}
                                </span>
                              </div>
                              <div className="flex-1 w-full mt-3 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                                {cards[cardIndex]?.answer}
                              </div>
                              <span className="text-[10px] text-indigo-300/70 mt-2 font-medium">
                                Click to return
                              </span>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* CARD NAVIGATION */}
                      <div className="flex justify-between items-center border-t border-slate-900/80 pt-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={prevFlashcard} 
                            disabled={cardIndex === 0} 
                            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow"
                          >
                            Previous
                          </button>
                          <button 
                            onClick={nextFlashcard} 
                            disabled={cardIndex === cards.length - 1} 
                            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow"
                          >
                            Next Card
                          </button>
                        </div>
                        <button 
                          onClick={() => { clearSessions(); setActiveView('final_exam'); }} 
                          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-1.5"
                          disabled={finalExams.length === 0}
                        >
                          Skip to Exam
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-xs py-10">
                      <BookOpen className="w-8 h-8 mb-2 opacity-30 text-purple-400" />
                      No study guides loaded for this tier.
                    </div>
                  )}
                </div>
              )}

              {/* PRACTICE LAB (INTERACTIVE DISCUSSION & INQUIRY LAB) */}
              {activeView === 'quiz' && (
                <div className="flex-1 flex flex-col justify-between h-full space-y-3">
                  {currentQuestion ? (
                    <>
                      {/* HEADER BAR WITH THRESHOLD BADGES */}
                      <div className="border-b border-slate-900 pb-3 flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                            Discussion & Inquiry Lab: <span className="text-emerald-400 font-mono">{currentQuestion.concept}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {mockErrors >= 2 && (
                            <span className="text-[10px] font-mono text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full bg-amber-950/60 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                              Solution Threshold Unlocked (2+ Attempts)
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full bg-emerald-500/10 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                            Adaptive Depth AI Tutor
                          </span>
                        </div>
                      </div>

                      {/* CONCEPT QUESTION CARD */}
                      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30 border border-slate-800 p-4 rounded-xl border-l-4 border-l-emerald-500/80 shadow-md">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 block mb-1 font-bold">
                          Current Focus Concept
                        </span>
                        <p className="text-xs text-slate-100 font-semibold leading-relaxed">{currentQuestion.text}</p>
                      </div>

                      {/* CHAT LOGS AREA */}
                      <div className="flex-1 max-h-[290px] overflow-y-auto space-y-3.5 custom-scrollbar my-2 pr-1 min-h-[220px]">
                        {chatLog.length === 0 ? (
                          <div className="text-slate-400 italic text-[11px] text-center pt-8 space-y-2">
                            <p>Ask any question, test your intuition, or request a deeper breakdown...</p>
                            <p className="text-[10px] text-slate-600 font-mono">
                              💡 Solution Threshold Rule: Direct solution is unlocked if requested or after 2 failed attempts!
                            </p>
                          </div>
                        ) : (
                          chatLog.map((chat, idx) => (
                            <div key={idx} className={`flex w-full ${chat.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[88%] text-xs p-3.5 rounded-2xl border shadow-lg ${
                                chat.sender === 'student' 
                                  ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500/30 text-blue-100 rounded-br-none' 
                                  : 'bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 border-slate-800 text-slate-200 rounded-bl-none'
                              }`}>
                                <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-1.5 mb-2">
                                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                                    {chat.sender === 'student' ? 'Student Inquiry' : 'AI Discussion Mentor'}
                                  </span>
                                  
                                  {chat.sender !== 'student' && (
                                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full border ${
                                      chat.depth === 'deep' 
                                        ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                                        : chat.depth === 'remedial'
                                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                                        : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                    }`}>
                                      {chat.depth === 'deep' ? '🔮 Deep Inquiry' : chat.depth === 'remedial' ? '⚡ Direct Solution' : '🌱 Concept Guide'}
                                    </span>
                                  )}
                                </div>

                                <div className="leading-relaxed font-normal text-slate-200">
                                  <HintMarkdown text={chat.text} />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* QUICK INQUIRY PROMPT CHIPS */}
                      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-[10px] font-mono">
                        <span className="text-slate-500 whitespace-nowrap">Suggested Queries:</span>
                        <button
                          onClick={() => submitQuizAnswer("Explain the core intuitive concept simply with a real-world example.")}
                          disabled={loading}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-full text-emerald-300 whitespace-nowrap transition-all"
                        >
                          💡 Core Intuition
                        </button>
                        <button
                          onClick={() => submitQuizAnswer("Show the step-by-step formula derivation and mathematical relationship.")}
                          disabled={loading}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-full text-purple-300 whitespace-nowrap transition-all"
                        >
                          🔮 Mathematical Steps
                        </button>
                        <button
                          onClick={() => submitQuizAnswer("give me the answer please and show full solution")}
                          disabled={loading}
                          className="bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 px-2.5 py-1 rounded-full text-amber-300 whitespace-nowrap transition-all flex items-center gap-1"
                        >
                          ⚡ Unlock Full Solution (Threshold)
                        </button>
                      </div>

                      {/* CHAT INPUT PANEL */}
                      <div className="border-t border-slate-900/80 pt-3 flex gap-2">
                        <input 
                          type="text" 
                          value={studentAnswer} 
                          onChange={(e) => setStudentAnswer(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && submitQuizAnswer()} 
                          placeholder="Ask a question, test an answer, or request deeper derivations..." 
                          disabled={loading}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all font-mono placeholder:text-slate-600"
                        />
                        <button 
                          onClick={() => submitQuizAnswer()} 
                          disabled={loading || !studentAnswer.trim()}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {loading ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Send</span>
                              <Send className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-xs py-10">
                      <HelpCircle className="w-8 h-8 mb-2 opacity-30 text-emerald-400" />
                      No Practice Quizzes available.
                    </div>
                  )}
                </div>
              )}

              {/* THRESHOLD FINAL EXAM VIEW */}
              {activeView === 'final_exam' && (
                <div className="flex-1 flex flex-col justify-between h-full">
                  {finalExams.length > 0 ? (
                    <>
                      {!examReport ? (
                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                          
                          <div>
                            {/* HEADER STATS */}
                            <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                <Bookmark className="w-4 h-4 text-purple-400" />
                                Threshold evaluation
                              </span>
                              
                              <div className="flex items-center gap-3 text-xs font-mono">
                                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-purple-400 font-bold uppercase text-[10px]">
                                  {finalExams[activeExamQuestionIndex]?.moduleOrigin}
                                </span>
                                <span className="text-slate-500">Attempt: {currentAttemptsCount}</span>
                                <span className="text-slate-300 font-bold flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                  <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                                  {Math.floor(questionTimer / 60)}:{String(questionTimer % 60).padStart(2, '0')}
                                </span>
                              </div>
                            </div>

                            {/* QUESTION EXPOSITION */}
                            <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                              <p className="text-xs font-semibold leading-relaxed text-slate-200">
                                {finalExams[activeExamQuestionIndex]?.text}
                              </p>
                              
                              <div className="h-px bg-slate-900"></div>

                              <input 
                                type="text" 
                                value={examTextInputs[finalExams[activeExamQuestionIndex].qId] || ""} 
                                onChange={(e) => setExamTextInputs(p => ({ ...p, [finalExams[activeExamQuestionIndex].qId]: e.target.value }))} 
                                disabled={lastQuestionEvaluated || loading} 
                                placeholder="Input literal fill-in-the-blank answer..." 
                                className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all font-mono shadow-inner"
                              />
                            </div>
                          </div>

                          {/* FEEDBACK & CONTROLS FOOTER */}
                          <div className="pt-4 border-t border-slate-900 flex justify-between items-center mt-6">
                            <div className="flex-1">
                              {lastQuestionEvaluated && !isQuestionPassed && (
                                <span className="text-xs font-mono text-rose-400 flex items-center gap-1.5 animate-bounce">
                                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                  Deficiency identified. Tap side button to review hint.
                                </span>
                              )}
                              {lastQuestionEvaluated && isQuestionPassed && (
                                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  Correct answer logic verified.
                                </span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {lastQuestionEvaluated && !isQuestionPassed && (
                                <button 
                                  onClick={triggerRetakeAttemptLoop} 
                                  className="bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                  Retake
                                </button>
                              )}
                              {lastQuestionEvaluated ? (
                                <button 
                                  onClick={forceAdvanceNextItem} 
                                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                                >
                                  Next Question
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              ) : (
                                <button 
                                  onClick={handleShortAnswerEvaluation} 
                                  disabled={loading || !(examTextInputs[finalExams[activeExamQuestionIndex].qId] || "").trim()} 
                                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md"
                                >
                                  Verify
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      ) : (
                        
                        /* EXAM COMPLETED REPORT SCREEN */
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-6 text-center shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                          
                          <div className="space-y-1">
                            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Threshold Assessment Complete</h3>
                            <p className="text-lg font-extrabold text-slate-100">{activeSubject} Final Scorecard</p>
                          </div>

                          <div className="flex flex-col items-center justify-center gap-2 py-4">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-900">
                              <span className="text-2xl font-black bg-gradient-to-tr from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {examReport.calculated_score}%
                              </span>
                            </div>
                            <span className="bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow">
                              {examReport.rating_tier}
                            </span>
                          </div>

                          <div className="text-left space-y-4">
                            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850/50 space-y-1.5">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Academic Mentor Remarks</span>
                              <p className="text-xs text-slate-300 leading-relaxed">{examReport.mentor_remark}</p>
                            </div>

                            {examReport.remediation_hint && (
                              <div className={`p-4 rounded-xl border text-xs space-y-2 relative overflow-hidden bg-slate-900/60 transition-all ${
                                examReport.rating_tier === 'High Mastery'      ? 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' :
                                examReport.rating_tier === 'Moderate Mastery'  ? 'border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]' :
                                examReport.rating_tier === 'Developing'        ? 'border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.05)]' :
                                                                                'border-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
                              }`}>
                                <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-1">
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Sparkles className={`w-3.5 h-3.5 ${
                                      examReport.rating_tier === 'High Mastery'      ? 'text-emerald-400' :
                                      examReport.rating_tier === 'Moderate Mastery'  ? 'text-blue-400' :
                                      examReport.rating_tier === 'Developing'        ? 'text-yellow-400' :
                                                                                      'text-rose-400'
                                    }`} />
                                    Fuzzy-Calibrated Remediation Hint
                                  </span>
                                  <span className="text-[8px] font-mono text-slate-500">
                                    {examReport.rating_tier === 'High Mastery'      ? 'Level 4: Advanced Challenge' :
                                     examReport.rating_tier === 'Moderate Mastery'  ? 'Level 3: Calibration' :
                                     examReport.rating_tier === 'Developing'        ? 'Level 2: Socratic Study' :
                                                                                    'Level 1: Deep Walkthrough'}
                                  </span>
                                </div>
                                <HintMarkdown
                                  text={examReport.remediation_hint}
                                  className="text-slate-300 font-normal text-[11px] select-text"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850/30 text-xs">
                                <span className="text-slate-500 block mb-1">Pathway taken</span>
                                <span className="font-semibold text-slate-300 text-[11px] block">{examReport.growth_metrics.pathway_taken}</span>
                              </div>
                              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850/30 text-xs">
                                <span className="text-slate-500 block mb-1">Growth factor</span>
                                <span className="font-bold text-emerald-400 text-sm">+{examReport.growth_metrics.score_delta_pct}% Delta</span>
                              </div>
                            </div>

                            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850/50 text-[11px] font-mono text-slate-400 leading-normal">
                              {examReport.growth_metrics.analytical_insight}
                            </div>
                          </div>

                          <button 
                            onClick={clearSessions} 
                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-xs font-bold uppercase rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-1.5 text-slate-300"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Restart Evaluation
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-xs py-10">
                      <Bookmark className="w-8 h-8 mb-2 opacity-30" />
                      No final exam questions compiled for this curriculum tier.
                    </div>
                  )}
                </div>
              )}
              
            </div>
          )}

        </div>

        {/* RIGHT METRIC & GRAPH TELEMETRY COLUMN */}
        <div className="lg:col-span-3 space-y-6">

          {/* BOUNDED RAG CONTEXT TERMINAL */}
          <div className="glass-panel rounded-2xl p-4 shadow-xl border border-slate-900 flex flex-col min-h-[160px]">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-2 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> 
              RAG Vector Chunks
            </h2>
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 font-mono text-[10px] text-purple-300 flex-1 overflow-y-auto custom-scrollbar space-y-2 max-h-[160px]">
              {(!telemetry.retrievedContext || telemetry.retrievedContext.length === 0) ? (
                <span className="text-slate-600 italic block text-center py-4">No active context loaded from ChromaDB.</span>
              ) : (
                telemetry.retrievedContext.map((text, idx) => (
                  <p key={idx} className="bg-purple-950/10 border border-purple-900/10 p-2 rounded leading-normal">
                    {text}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* EXAM SCORE LEDGER CARD */}
          <div className="glass-panel rounded-2xl p-4 shadow-xl border border-slate-900 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2.5 mb-2.5">
              <h3 className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Live Exam Scoreboard</h3>
              
              {/* ON-DEMAND HINT LAUNCHER BUTTON */}
              {activeView === 'final_exam' && (
                <button 
                  onClick={() => setShowSideHintBox(!showSideHintBox)} 
                  disabled={!serverEvaluatedHint} 
                  className={`text-[9px] font-bold px-2 py-1 rounded transition-all border ${
                    serverEvaluatedHint 
                      ? 'bg-amber-600/10 hover:bg-amber-600/20 border-amber-500/30 text-amber-400' 
                      : 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed'
                  }`}
                >
                  Core Hint
                </button>
              )}
            </div>

            {/* EXPANDABLE POPUP SLIDE FOR HINT */}
            {showSideHintBox && serverEvaluatedHint && (
              <div className="mb-3 bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl text-xs space-y-2 glow-amber animate-fadeIn">
                {/* Mamdani System Header */}
                <div className="flex items-center gap-2 border-b border-amber-900/30 pb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-[8px] font-mono tracking-widest text-amber-400 font-bold uppercase">
                    Mamdani Fuzzy System Output
                  </span>
                </div>
                {/* Tier Badge + Remark Row */}
                {mamdaniTier && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                        mamdaniTier === 'High Mastery'      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        mamdaniTier === 'Moderate Mastery'  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        mamdaniTier === 'Developing'        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                                             'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>{mamdaniTier}</span>
                      <span className="text-[9px] text-amber-600 font-mono">
                        Failure: {currentDegreeOfFailure}%
                      </span>
                    </div>
                    {mamdaniRemark && (
                      <p className="text-[9px] text-slate-500 italic leading-snug">{mamdaniRemark}</p>
                    )}
                    {mamdaniGapAnalysis && (
                      <p className="text-[9px] text-amber-400/80 font-mono bg-amber-950/40 p-2 rounded border border-amber-900/30">{mamdaniGapAnalysis}</p>
                    )}
                  </div>
                )}
                {/* Gemini-Generated Hint Body */}
                <div className="border-t border-amber-900/20 pt-2">
                  <div className="text-[8px] font-mono tracking-wider text-amber-500 font-bold uppercase mb-1">
                    {currentDegreeOfFailure >= 60 ? 'Conceptual Walkthrough' : 'Socratic Nudge'}
                  </div>
                  <HintMarkdown text={serverEvaluatedHint} className="text-slate-300 font-normal text-[11px]" />
                </div>
              </div>
            )}

            {/* LEDGER GRID */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-2 overflow-y-auto space-y-1.5 font-mono text-[10px] custom-scrollbar max-h-[140px]">
              {finalExams.length > 0 ? (
                finalExams.map((q, i) => {
                  const record = questionScoreRegistry[q.qId];
                  return (
                    <div key={q.qId} className="flex justify-between items-center bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-slate-500 font-bold">Q{i + 1} State:</span>
                      {record ? (
                        <span className={`font-black ${record.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {Math.round(record.score)} pts ({record.attempts}a / {record.latency}s)
                        </span>
                      ) : (
                        <span className="text-slate-700 italic">Pending</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <span className="text-slate-700 italic block text-center py-4">Syllabus unselected.</span>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}