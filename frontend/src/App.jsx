import React, { useState } from 'react';
import { BookOpen, HelpCircle, GraduationCap, ChevronRight, BrainCircuit, ArrowRight, Zap, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

// Re-engineered Knowledge Base Mapping Exactly 1 Final Exam Question to 1 Module with High-Fidelity Context Vectors
const MODULE_FLASHCARDS_DATABASE = {
  Physics: {
    'Class 10': {
      cards: [
        { id: 'p10_c1', topic: "Newton's Second Law", question: "What is the core formula for Newton's Second Law and how does force interact with mass?", answer: "• Fundamental Relation: Force is directly proportional to the product of mass and acceleration (F = m × a).\n• Core Mechanical Metric: Applying an external net force to an object causes its velocity profile to shift over time.\n• Empirical Proof: A 10 kg object accelerating at 5 m/s² requires a continuous horizontal thrust of exactly 50 Newtons (10 kg × 5 m/s² = 50 N)." },
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
          formula: "Force = Mass × Acceleration (F = m × a)",
          misconception: "Student might be dividing the variables (8/4 or 4/8) instead of applying multiplication metrics."
        },
        { 
          qId: "p10_f2", 
          moduleOrigin: "Module 2: Friction Dynamics",
          text: "An automated storage block is dragged along a straight conveyor belt line toward the north direction. In what vector heading direction does the surface friction force operate?", 
          expected: "south",
          formula: "Friction Vector = -1 × (Active Vector Path Heading Direction)",
          misconception: "Student might think friction assists movement or acts downward alongside gravity parameters."
        },
        { 
          qId: "p10_f3", 
          moduleOrigin: "Module 3: Kinematics & Constant Velocity",
          text: "A high-speed tracking train operates along a straight route at a perfectly constant velocity of 45 m/s for a duration of 60 seconds. What is the active acceleration rate in m/s²?", 
          expected: "0",
          formula: "Acceleration (a) = Delta Velocity / Delta Time (Δv / Δt)",
          misconception: "Student might try to calculate a change by multiplying 45 × 60, forgetting that constant velocity means acceleration is absolute zero."
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
  Biology: { 'Class 10': { cards: [], quizzes: [], finalExam: [] }, 'Class 11-12': { cards: [], quizzes: [], finalExam: [] }, 'Undergraduate': { cards: [], quizzes: [], finalExam: [] } },
  Mathematics: { 'Class 10': { cards: [], quizzes: [], finalExam: [] }, 'Class 11-12': { cards: [], quizzes: [], finalExam: [] }, 'Undergraduate': { cards: [], quizzes: [], finalExam: [] } }
};

export default function App() {
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [activeTier, setActiveTier] = useState('Class 10');
  const [activeView, setActiveView] = useState('theory'); 
  
  const activeClassroom = MODULE_FLASHCARDS_DATABASE[activeSubject]?.[activeTier] || { cards: [], quizzes: [], finalExam: [] };
  
  // Flashcard Interface Index States
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Socratic Mock Test Communication States
  const [currentQuestion, setCurrentQuestion] = useState(activeClassroom.quizzes?.[0] || null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [telemetry, setTelemetry] = useState({ activeNode: 'Idle', remedialPathActive: false, retrievedContext: [] });
  const [retainedMockHistory, setRetainedMockHistory] = useState([]);

  // Final Exam Open-Ended Short Answer State Machinery
  const [activeExamQuestionIndex, setActiveExamQuestionIndex] = useState(0);
  const [examTextInputs, setExamTextInputs] = useState({});
  const [currentAttemptsCount, setCurrentAttemptsCount] = useState(1);
  const [questionScoreRegistry, setQuestionScoreRegistry] = useState({});
  const [examReport, setExamReport] = useState(null);

  // On-Demand Real-Time Side Hint Tracking Registers
  const [serverEvaluatedHint, setServerEvaluatedHint] = useState(null);
  const [showSideHintBox, setShowSideHintBox] = useState(false);
  const [lastQuestionEvaluated, setLastQuestionEvaluated] = useState(false);
  const [isQuestionPassed, setIsQuestionPassed] = useState(false);
  const [currentDegreeOfFailure, setCurrentDegreeOfFailure] = useState(0);

  const [latency, setLatency] = useState(25);
  const [failures, setFailures] = useState(0); 
  const [loading, setLoading] = useState(false);

  const swapSubjectContext = (subject) => {
    setActiveSubject(subject); setActiveTier('Class 10'); setActiveView('theory');
    const targetClassroom = MODULE_FLASHCARDS_DATABASE[subject]?.['Class 10'] || { cards: [], quizzes: [], finalExam: [] };
    setCurrentQuestion(targetClassroom.quizzes?.length > 0 ? targetClassroom.quizzes[0] : null);
    clearSessions();
  };

  const swapTierContext = (tier) => {
    setActiveTier(tier); setActiveView('theory');
    const targetClassroom = MODULE_FLASHCARDS_DATABASE[activeSubject]?.[tier] || { cards: [], quizzes: [], finalExam: [] };
    setCurrentQuestion(targetClassroom.quizzes?.length > 0 ? targetClassroom.quizzes[0] : null);
    clearSessions();
  };

  const clearSessions = () => {
    setChatLog([]); setExamTextInputs({}); setExamReport(null); setRetainedMockHistory([]);
    setCardIndex(0); setIsFlipped(false); setActiveExamQuestionIndex(0);
    setServerEvaluatedHint(null); setShowSideHintBox(false); setLastQuestionEvaluated(false);
    setIsQuestionPassed(false); setCurrentDegreeOfFailure(0); setCurrentAttemptsCount(1);
    setQuestionScoreRegistry({});
    setTelemetry({ activeNode: 'Idle', remedialPathActive: false, retrievedContext: [] });
  };

  const nextFlashcard = () => {
    if (activeClassroom.cards && cardIndex < activeClassroom.cards.length - 1) {
      setIsFlipped(false);
      setCardIndex(prev => prev + 1);
    }
  };

  const prevFlashcard = () => {
    if (cardIndex > 0) {
      setIsFlipped(false);
      setCardIndex(prev => prev - 1);
    }
  };

  const handleShortAnswerEvaluation = async () => {
    const currentTarget = activeClassroom.finalExam[activeExamQuestionIndex];
    const studentText = examTextInputs[currentTarget.qId] || "";
    if (!studentText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tutor/evaluate-short-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: currentTarget.text,
          student_raw_input: studentText,
          expected_answer: currentTarget.expected,
          seconds_spent: parseInt(latency),
          attempts_count: currentAttemptsCount,
          current_tier: activeTier,
          current_subject: activeSubject,
          hint_formula: currentTarget.formula || "",
          hint_misconception: currentTarget.misconception || ""
        })
      });

      const result = await response.json();
      setCurrentDegreeOfFailure(result.degree_of_failure);
      setQuestionScoreRegistry(prev => ({
        ...prev, [currentTarget.qId]: { score: result.fuzzy_score, tier: result.performance_tier, correct: result.is_correct }
      }));

      if (!result.is_correct) {
        setServerEvaluatedHint(result.assigned_hint);
        setLastQuestionEvaluated(true);
        setIsQuestionPassed(false);
      } else {
        setIsQuestionPassed(true);
        setLastQuestionEvaluated(true);
        setServerEvaluatedHint(null);
        setShowSideHintBox(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerRetakeAttemptLoop = () => {
    setLastQuestionEvaluated(false);
    setIsQuestionPassed(false);
    setCurrentAttemptsCount(prev => prev + 1);
    setExamTextInputs(prev => ({ ...prev, [activeClassroom.finalExam[activeExamQuestionIndex].qId]: "" }));
  };

  const forceAdvanceNextItem = () => {
    setServerEvaluatedHint(null); setShowSideHintBox(false); setLastQuestionEvaluated(false);
    setIsQuestionPassed(false); setCurrentDegreeOfFailure(0); setCurrentAttemptsCount(1);

    const nextIdx = activeExamQuestionIndex + 1;
    if (nextIdx < activeClassroom.finalExam.length) {
      setActiveExamQuestionIndex(nextIdx);
    } else {
      let combinedCorrect = 0;
      Object.keys(questionScoreRegistry).forEach(k => { if (questionScoreRegistry[k].correct) combinedCorrect++; });
      triggerFinalEvaluationReport(combinedCorrect);
    }
  };

  const triggerFinalEvaluationReport = async (finalCorrect) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tutor/evaluate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correct_answers: finalCorrect, total_questions: activeClassroom.finalExam.length,
          total_elapsed_time: parseInt(latency) * activeClassroom.finalExam.length,
          current_tier: activeTier, current_subject: activeSubject, mock_chat_history: retainedMockHistory
        })
      });
      const result = await response.json();
      setExamReport(result);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const submitQuizAnswer = async () => {
    if (!studentAnswer.trim() || !currentQuestion) return;
    setLoading(true);
    const userMessage = { text: studentAnswer, sender: 'student' };
    const nextHistory = [...chatLog, userMessage];
    setChatLog(nextHistory); setStudentAnswer('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Question: ${currentQuestion.text} | Answer Attempt: ${userMessage.text}`,
          time_taken: parseInt(latency), consecutive_errors: parseInt(failures),
          current_tier: activeTier, current_subject: activeSubject, current_mode: 'quiz', history: chatLog
        })
      });
      const result = await response.json();
      const updatedLog = [...nextHistory, { text: result.response, sender: 'tutor' }];
      setChatLog(updatedLog); setRetainedMockHistory(updatedLog);
      setTelemetry({ activeNode: result.active_node, remedialPathActive: result.remedial_triggered, retrievedContext: result.context_pulled || [] });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const activeQuizzes = activeClassroom.quizzes || [];
  const activeExams = activeClassroom.finalExam || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans antialiased">
      {/* BRANDING HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col lg:flex-row justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black text-white">STUDENT COMPANION PLATFORM</h1>
          <div className="flex gap-2 mt-4">
            {Object.keys(MODULE_FLASHCARDS_DATABASE).map(sub => (
              <button key={sub} onClick={() => swapSubjectContext(sub)} className={`text-xs px-4 py-1.5 rounded-lg border font-bold transition ${activeSubject === sub ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>{sub}</button>
            ))}
          </div>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs items-center h-fit">
          <span>Latency Track:</span><input type="number" value={latency} onChange={(e) => setLatency(e.target.value)} className="w-12 bg-slate-950 text-center text-emerald-400 font-mono rounded ml-2 p-1" />
        </div>
      </div>

      {/* CLASSIFICATION TIER MATRIX */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-3 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
        {['Class 10', 'Class 11-12', 'Undergraduate'].map(tier => (
          <button key={tier} onClick={() => swapTierContext(tier)} className={`py-2 text-xs font-bold rounded-lg ${activeTier === tier ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}><GraduationCap className="w-4 h-4 mr-1 inline"/>{tier}</button>
        ))}
      </div>

      {/* SYSTEM CORE VIEW SPLIT CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col h-[600px]">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <button onClick={() => setActiveView('theory')} className={`text-xs font-bold px-3 py-1 rounded ${activeView === 'theory' ? 'bg-slate-800 text-blue-400' : 'text-slate-500'}`}>Study Deck</button>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <button onClick={() => { if(activeQuizzes.length > 0) { setCurrentQuestion(activeQuizzes[0]); setActiveView('quiz'); } }} className={`text-xs font-bold px-3 py-1 rounded ${activeView === 'quiz' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`} disabled={activeQuizzes.length === 0}>Mock Practice Test</button>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <button onClick={() => { clearSessions(); setActiveView('final_exam'); }} className={`text-xs font-bold px-3 py-1 rounded ${activeView === 'final_exam' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`} disabled={activeExams.length === 0}>Final Examination Threshold</button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 justify-between">
            {activeView === 'theory' && activeClassroom.cards?.length > 0 && (
              <div className="h-full flex flex-col justify-between flex-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-2 text-right">Card {cardIndex + 1} of {activeClassroom.cards.length}</span>
                <div onClick={() => setIsFlipped(!isFlipped)} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center cursor-pointer min-h-[300px] select-none relative">
                  <div className="absolute top-3 left-4 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-blue-400 font-mono tracking-wide uppercase">{activeClassroom.cards[cardIndex].topic}</div>
                  {!isFlipped ? <p className="text-sm font-semibold text-slate-200 px-4">{activeClassroom.cards[cardIndex].question}</p> : <p className="text-xs text-slate-300 font-mono leading-relaxed text-left whitespace-pre-wrap w-full">{activeClassroom.cards[cardIndex].answer}</p>}
                </div>
                <div className="flex justify-between mt-4 border-t border-slate-950 pt-4">
                  <div className="flex gap-2">
                    <button onClick={prevFlashcard} disabled={cardIndex === 0} className="px-3 py-1.5 bg-slate-950 rounded border border-slate-800 text-xs font-bold disabled:opacity-30">Previous</button>
                    <button onClick={nextFlashcard} disabled={cardIndex === activeClassroom.cards.length - 1} className="px-3 py-1.5 bg-slate-950 rounded border border-slate-800 text-xs font-bold disabled:opacity-30">Next Card</button>
                  </div>
                  <button onClick={() => { clearSessions(); setActiveView('final_exam'); }} className="bg-slate-950 text-purple-400 font-bold border border-slate-800 text-xs uppercase px-4 py-2 rounded-lg" disabled={activeExams.length === 0}>Skip to Exam →</button>
                </div>
              </div>
            )}

            {activeView === 'quiz' && currentQuestion && (
              <div className="flex flex-col h-full justify-between flex-1">
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl border-l-2 border-l-emerald-500">
                    <p className="text-sm text-slate-200 font-medium">{currentQuestion.text}</p>
                  </div>
                  <div className="space-y-3 max-h-[240px] overflow-y-auto custom-scrollbar">
                    {chatLog.map((chat, idx) => (
                      <div key={idx} className={`flex ${chat.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] text-xs p-3 rounded-xl border ${chat.sender === 'student' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>{chat.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  <input type="text" value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitQuizAnswer()} placeholder="Ask the Socratic agent for a guidance hint code..." className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none" />
                  <button onClick={submitQuizAnswer} className="bg-emerald-600 text-white font-bold px-4 rounded-lg text-xs uppercase">{loading ? "..." : "Chat"}</button>
                </div>
              </div>
            )}

            {activeView === 'final_exam' && activeClassroom.finalExam?.length > 0 && (
              <div className="h-full flex flex-col justify-between flex-1">
                {!examReport ? (
                  <div className="space-y-4">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                      <div className="flex justify-between text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-2"><span>{activeClassroom.finalExam[activeExamQuestionIndex].moduleOrigin}</span><span>Attempt Count: {currentAttemptsCount}</span></div>
                      <p className="text-xs font-bold text-slate-200">{activeClassroom.finalExam[activeExamQuestionIndex].text}</p>
                      <input type="text" value={examTextInputs[activeClassroom.finalExam[activeExamQuestionIndex].qId] || ""} onChange={(e) => setExamTextInputs(p => ({ ...p, [activeClassroom.finalExam[activeExamQuestionIndex].qId]: e.target.value }))} disabled={lastQuestionEvaluated || loading} placeholder="Type your literal fill-in-the-blank text response..." className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 mt-4 focus:outline-none focus:border-purple-500 transition" />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                      <div>
                        {lastQuestionEvaluated && !isQuestionPassed && <span className="text-xs font-mono text-rose-400 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Incorrect entry sequence. Tap side button to deploy guidance hint.</span>}
                        {lastQuestionEvaluated && isQuestionPassed && <span className="text-xs font-mono text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Success pattern identified. Advance.</span>}
                      </div>
                      <div className="flex gap-2">
                        {lastQuestionEvaluated && !isQuestionPassed && <button onClick={triggerRetakeAttemptLoop} className="bg-amber-600/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Retake</button>}
                        {lastQuestionEvaluated ? <button onClick={forceAdvanceNextItem} className="bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Next Question →</button> : <button onClick={handleShortAnswerEvaluation} disabled={loading || !(examTextInputs[activeClassroom.finalExam[activeExamQuestionIndex].qId] || "").trim()} className="bg-purple-600 px-5 py-1.5 rounded-lg text-xs font-bold uppercase">{loading ? "..." : "Verify"}</button>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-4">
                    <div className="text-2xl font-mono font-black">{examReport.calculated_score}% Final Score</div>
                    <span className="bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">{examReport.rating_tier}</span>
                    <p className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg text-left">{examReport.mentor_remark}</p>
                    <div className="bg-slate-900/60 text-xs p-3 rounded-lg text-slate-400 font-mono tracking-normal text-left">{examReport.growth_metrics.analytical_insight}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR ON-DEMAND HINT LOGS PANEL */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 h-[600px] flex flex-col justify-between">
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div>
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5 pb-1 border-b border-slate-800">On-Demand Assistance</h2>
              <button onClick={() => setShowSideHintBox(!showSideHintBox)} disabled={!serverEvaluatedHint} className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs uppercase transition ${serverEvaluatedHint ? 'bg-amber-600/10 border-amber-500/30 text-amber-400 hover:bg-amber-600/20 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'}`}>Request Core Hint</button>
              {showSideHintBox && serverEvaluatedHint && (
                <div className="mt-3 bg-slate-950 border border-amber-900/30 p-3 rounded-xl text-xs space-y-1">
                  <div className="text-[9px] font-mono tracking-wider text-amber-500 font-black uppercase">Fuzzy Deficiency Index: {currentDegreeOfFailure}%</div>
                  <p className="text-slate-300 leading-relaxed font-normal">{serverEvaluatedHint}</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col min-h-0 border-t border-slate-800 pt-3">
              <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-2">Live Question Score Ledger</h3>
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 overflow-y-auto space-y-1.5 font-mono text-[11px] custom-scrollbar">
                {activeClassroom.finalExam?.length > 0 ? (
                  activeClassroom.finalExam.map((q, i) => {
                    const record = questionScoreRegistry[q.qId];
                    return (
                      <div key={q.qId} className="flex justify-between items-center bg-slate-900/40 p-2 rounded">
                        <span className="text-slate-400 font-bold">Q{i + 1} State:</span>
                        {record ? <span className={`font-black ${record.correct ? 'text-emerald-400' : 'text-rose-400'}`}>{record.score} pts ({record.tier.split(' ')[0]})</span> : <span className="text-slate-600 italic">Unattempted</span>}
                      </div>
                    );
                  })
                ) : <span className="text-slate-600 italic block text-center pt-4">No active trace configurations.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}