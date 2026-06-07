import React, { useState } from 'react';
import { BookOpen, HelpCircle, GraduationCap, ChevronRight, BrainCircuit, Database, Network, Activity, ArrowRight } from 'lucide-react';

// Unified Academic Data Matrix (Fully Self-Contained Theory & Matching Test Banks)
const CLASSROOM_DATABASE = {
  Physics: {
    'Class 10': {
      modules: [
        { id: 'p10_m1', title: "Chapter 1: Dynamic Forces, Friction, & Newton's Second Law", content: "A force is any push or pull acting upon an object resulting from its interaction with another object. When a net external force acts on an object, it causes the object to accelerate (change its velocity). Isaac Newton formalised this in his Second Law of Motion, which states that Force equals Mass times Acceleration (F = m × a). For example, if you apply a net force to a 10 kg box and it speeds up with an acceleration of 5 m/s², the net force required is exactly 50 Newtons (10 kg × 5 m/s² = 50 N). Friction is a specific type of contact force that acts in the direction exactly opposite to the direction of intended motion, resisting the push." },
        { id: 'p10_m2', title: 'Chapter 2: Motion Profiles & Constant Velocity Dynamics', content: "Kinematics is the study of objects in motion. Velocity describes both the speed and the directional path of a moving object. Acceleration is defined as the rate of change of velocity over time. If an object's velocity is altering, it is accelerating. Crucially, if an object or vehicle travels at a completely constant velocity—meaning it stays at a steady speed without changing direction (such as a car travelling at a constant velocity of 20 m/s for 10 seconds)—the change in velocity is exactly zero. Because the velocity does not vary, its acceleration during that time period is mathematically 0 m/s²." },
        { id: 'p10_m3', title: 'Chapter 3: Work, Mechanical Energy, and Power Rules', content: "In physics, work is done when a constant force applied to an object causes that object to move a specific distance in the direction of the force. Mechanical energy is the capacity to do this work and is split into two primary forms: Kinetic Energy (the energy of an object in motion) and Potential Energy (the stored energy an object possesses due to its position or state). Power measures the time rate at which this work is performed or energy is transferred. Power is calculated by dividing the total work done by the time taken to do it (Power = Work / time)." }
      ],
      quizzes: [
        { id: "p10_q1", text: "A 10kg object experiences an acceleration of 5 m/s². What net force is acting on it?", concept: "Newton's Second Law" },
        { id: "p10_q2", text: "If a car travels at a constant velocity of 20 m/s for 10 seconds, what is its acceleration?", concept: "Kinematics" }
      ]
    },
    'Class 11-12': {
      modules: [
        { id: 'p12_m1', title: 'Chapter 1: Two-Dimensional Kinematics & Projectile Motion', content: "Projectile motion models an object launched into a two-dimensional plane experiencing only the downward acceleration of gravity (g = 9.8 m/s²). The motion is decoupled into independent horizontal (x) and vertical (y) vector components. Horizontally, there is no acceleration (ax = 0), so horizontal velocity remains perfectly constant. Vertically, the object decelerates until it reaches its peak trajectory. At the absolute maximum height of its flight, the vertical component of velocity drops precisely to zero (vy = 0), while the horizontal component remains active." },
        { id: 'p12_m2', title: 'Chapter 2: Rotational Dynamics, Torque & Angular Momentum', content: "Rotational mechanics governs rigid bodies spinning about a fixed axis. The rotational analogue to linear force is torque, which is the measure of a force's tendency to cause rotational acceleration. Just as linear force changes linear momentum, torque changes a system's angular momentum. The resistance of a rigid body to changes in its rotational state is quantified by its moment of inertia, which depends directly on how the object's mass is distributed relative to its axis of rotation." },
        { id: 'p12_m3', title: 'Chapter 3: Thermodynamics & Entropy Bounds', content: "Thermodynamics governs heat energy transfers and thermal system work equations. The First Law establishes energy conservation within closed boundaries. The Second Law introduces entropy, stating that the total entropy of an isolated thermal system must always increase over time during spontaneous processes, dictating that heat energy cannot spontaneously flow from a colder body to a warmer body." }
      ],
      quizzes: [
        { id: "p12_q1", text: "A projectile is launched at an angle of 30 degrees with an initial velocity of 50 m/s. At its maximum height, what is its vertical velocity component?", concept: "Projectile Motion" }
      ]
    },
    'Undergraduate': {
      modules: [
        { id: 'pug_m1', title: 'Chapter 1: Lagrangian Mechanics & Generalized Coordinates', content: "Lagrangian mechanics replaces vector forces with scalar energy tracking within holonomic constraints. By defining a set of generalized coordinates, we construct the Lagrangian function (L) as Kinetic Energy (T) minus Potential Energy (V), written as L = T - V. The true equations of motion for any physical system are derived by plugging L into the Euler-Lagrange differential equations. For a double pendulum system, this analytical principle yields a system of coupled second-order differential equations." },
        { id: 'pug_m2', title: 'Chapter 2: Hamiltonian Mechanics & State Spaces', content: "Hamiltonian mechanics reformulates mechanics by transitioning from generalized velocities to conjugate momenta. The Hamiltonian (H) represents the total mechanical energy of a conservative system (H = T + V). It converts a single set of second-order Euler-Lagrange equations into a symmetrical system of first-order partial differential equations, mapping the exact structural evolution of a system across phase space." },
        { id: 'pug_m3', title: 'Chapter 3: Electrodynamics & Maxwell\'s Systems', content: "Advanced electrodynamics unifies electrical charges and magnetic phenomena using vector calculus fields. Maxwell's four core field equations mathematically define how electric fields (E) and magnetic fields (B) are produced, interact, and propagate as electromagnetic waves through space, governed by boundary flux conditions." }
      ],
      quizzes: [
        { id: "pug_q1", text: "What fundamental formula connects Kinetic Energy (T) and Potential Energy (V) to define the system Lagrangian (L)?", concept: "Lagrangian Mechanics" }
      ]
    }
  },
  Biology: {
    'Class 10': {
      modules: [
        { id: 'b10_m1', title: 'Chapter 1: Cell Structure & Cellular Respiration Basics', content: "Cells are the fundamental functional building blocks of all living organisms. Within eukaryotic plant and animal cells, specialized membrane-bound structures called organelles carry out targeted tasks. Mitochondria are the specific organelles responsible for cellular respiration. They act as microscopic power plants, capturing chemical energy extracted from digested food nutrients and transforming it into a high-energy compound called ATP, which powers cellular work." },
        { id: 'b10_m2', title: 'Chapter 2: The Human Digestive System & Digestive Enzymes', content: "The human digestive tract is a specialized pipeline designed to chemically and physically break down ingestion matter into small, absorbable molecular packages. This chemical breakdown is accelerated by biological catalysts called digestive enzymes. Specialized enzymes located in the stomach and small intestines break down long protein and carbohydrate chains into basic molecules like glucose, which enter the bloodstream." },
        { id: 'b10_m3', title: 'Chapter 3: Plant Nutrition & Chlorophyll Dynamics', content: "Autotrophic plants produce their own nutritional energy through a chemical pathway called photosynthesis. Chlorophyll is the specialized green pigment located inside plant chloroplasts that actively traps light energy from the sun. This trapped light energy fuels the biochemical reaction that combines water and carbon dioxide to create glucose sugars, releasing oxygen gas as an atmospheric byproduct." }
      ],
      quizzes: [
        { id: "b10_q1", text: "What is the primary function of mitochondria in a eukaryotic cell?", concept: "Cellular Respiration" }
      ]
    },
    'Class 11-12': {
      modules: [
        { id: 'b12_m1', title: 'Chapter 1: Molecular Genetics & RNA Transcription Pathways', content: "Gene expression is the multi-step pathway by which genetic instructions are converted into functional proteins. The primary step is transcription, which occurs inside the cell nucleus. During transcription, a specific enzyme called RNA polymerase binds to a promoter DNA region, unzips the double helix, and builds a single-stranded messenger RNA (mRNA) molecule that accurately mirrors the code of the target gene template." },
        { id: 'b12_m2', title: 'Chapter 2: Translation Factories & Ribosomal Mechanisms', content: "Following transcription, the synthesized mRNA strand exits the nucleus to undergo translation inside ribosomes. Ribosomes act as molecular factories that decode the linear mRNA nucleotide sequence. Transfer RNA (tRNA) molecules match specific three-letter genetic sequences (codons) on the mRNA to corresponding amino acids, linking them together to create a growing protein chain." },
        { id: 'b12_m3', title: 'Chapter 3: Mendelian Genetics & Inheritance Probability', content: "Genetics tracks how hereditary characteristics are passed down across generations. Gregor Mendel established the baseline rules of inheritance by tracking pea plants. His structural models proved that traits are governed by individual alleles that separate during gamete formation, creating predictable mathematical ratio distributions for dominant and recessive traits." }
      ],
      quizzes: [
        { id: "b12_q1", text: "What specific enzyme binds to DNA to synthesize the single-stranded mRNA molecule during transcription?", concept: "Transcription" }
      ]
    },
    'Undergraduate': {
      modules: [
        { id: 'bug_m1', title: 'Chapter 1: Epigenetics & Chromatin Remodeling Networks', content: "Epigenetics explores stable, heritable changes in gene expression that do not involve altering the underlying primary DNA sequence. This is regulated by modifying chromatin architecture. A critical mechanism is histone methylation, which is catalyzed by specialized enzymes known as histone methyltransferases. Adding methyl groups to specific amino acid residues on histone tails alters chromatin packaging, compressing the DNA structure to enforce heterochromatin silencing and shut down gene transcription profiles." },
        { id: 'bug_m2', title: 'Chapter 2: Recombinant DNA & Genetic Engineering Vectors', content: "Undergraduate biotechnology explores methods to edit genomic targets. This involves using restriction enzymes to isolate specific target sequences, cloning plasmids to act as transport vectors, and implementing CRISPR-Cas9 mechanics to introduce highly targeted modifications into host cellular DNA frameworks." },
        { id: 'bug_m3', title: 'Chapter 3: Intracellular Transduction & Signaling Cascades', content: "Cells process environmental stimuli through complex cell signaling pathways. When an external signaling molecule binds to a cell surface receptor, it initiates an intracellular phosphorylation cascade. This multi-protein amplification loop carries the signal across the cytoplasm and into the nucleus to modify transcription profiles." }
      ],
      quizzes: [
        { id: "bug_q1", text: "What group of specialized enzymes catalyzes the addition of methyl groups to histone tails to enforce heterochromatin silencing?", concept: "Epigenetics" }
      ]
    }
  },
  Mathematics: {
    'Class 10': {
      modules: [
        { id: 'm10_m1', title: 'Chapter 1: Linear Equations & Isolation Methods', content: "Algebra uses variable symbols like x to represent unknown numerical values. A linear equation represents a perfectly balanced scale. To solve for x, you must isolate the variable on one side of the equals sign by performing inverse operations on both sides. For example, in the equation 3x + 7 = 22, you first perform the inverse of addition by subtracting 7 from both sides, which simplifies to 3x = 15. Next, you perform the inverse of multiplication by dividing both sides by 3, isolating the variable to reveal that x = 5." },
        { id: 'm10_m2', title: 'Chapter 2: Geometric Coordinate Systems & Area Spaces', content: "Geometry focuses on mapping coordinate planes and calculating the properties of shapes. It provides formulas to find the perimeter (the distance around the outside of a shape) and the area (the amount of flat space inside a shape) for simple polygons like rectangles and triangles." },
        { id: 'm10_m3', title: 'Chapter 3: Right-Triangle Trigonometric Ratios', content: "Trigonometry evaluates the mathematical ratios connecting side lengths to angles within right-angled triangles. The three fundamental ratios are Sine (Opposite divided by Hypotenuse), Cosine (Adjacent divided by Hypotenuse), and Tangent (Opposite divided by Adjacent)." }
      ],
      quizzes: [
        { id: "m10_q1", text: "Solve for x in the equation: 3x + 7 = 22.", concept: "Linear Equations" }
      ]
    },
    'Class 11-12': {
      modules: [
        { id: 'm12_m1', title: 'Chapter 1: Differential Calculus & The Power Rule Matrix', content: "Calculus evaluates how variables change continuously relative to one another. The derivative of a function calculates its instantaneous rate of change or instantaneous slope at any given point. To find a derivative algebraically, we apply standard operational patterns. The foundational rule is the Power Rule, which states that the derivative of x to the power of n is n times x to the power of n-1. For a polynomial function like f(x) = 3x² + 2x, applying the power rule to each term individually yields a derivative function of exactly 6x + 2." },
        { id: 'm12_m2', title: 'Chapter 2: Integral Calculus & Accumulation Bounded Zones', content: "Integral calculus operates as the exact inverse transformation of differential calculus. While differentiation breaks a curve down into instantaneous slopes, integration aggregates these small pieces back together. It tracks total area accumulation bounded beneath a function curve between two explicit vertical coordinate limits." },
        { id: 'm12_m3', title: 'Chapter 3: Probability Distribution Functions', content: "Higher mathematical statistics tracks random systems using continuous variable charts. It models probable outcomes across populations using normal distribution curves, calculating confidence limits and variance equations." }
      ],
      quizzes: [
        { id: "m12_q1", text: "What is the derivative of f(x) = 3x² + 2x with respect to x?", concept: "Power Rule" }
      ]
    },
    'Undergraduate': {
      modules: [
        { id: 'mug_m1', title: 'Chapter 1: Real Analysis & Bounded Riemann Integrals', content: "Advanced mathematical analysis formalizes calculus using rigorous limit proofs. It defines the Riemann Integral of a continuous function over a closed interval [a, b] by building upper and lower bounds using fine partitions. The Fundamental Theorem of Calculus connects differentiation and integration, proving that if F(x) is the antiderivative of f(x), then the definite integral of f(x) from a to b can be evaluated simply by calculating F(b) - F(a)." },
        { id: 'mug_m2', title: 'Chapter 2: Linear Vector Fields & Eigenvalue Extraction', content: "Linear algebra evaluates multidimensional vector spaces using matrix transformations. It models structural coordinate adjustments to isolate invariant vectors, extracting specific scalar factors called eigenvalues." },
        { id: 'mug_m3', title: 'Chapter 3: Complex Analysis & Contour Integration Paths', content: "Complex analysis extends standard calculus functions into the complex number plane. It introduces powerful integration shortcut rules, such as the Cauchy Residue Theorem, which solves highly advanced definite integrals along closed contour paths." }
      ],
      quizzes: [
        { id: "mug_q1", text: "What fundamental theorem states that a definite integral over [a,b] can be resolved by calculating F(b) - F(a) using the antiderivative?", concept: "Fundamental Theorem of Calculus" }
      ]
    }
  }
};

export default function App() {
  // Navigation State Configuration
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [activeTier, setActiveTier] = useState('Class 10');
  const [activeView, setActiveView] = useState('theory'); // 'theory' or 'quiz'
  
  // Localized Component Target Reference Arrays
  const activeClassroom = CLASSROOM_DATABASE[activeSubject][activeTier];
  const [currentQuestion, setCurrentQuestion] = useState(activeClassroom.quizzes[0]);
  const [studentAnswer, setStudentAnswer] = useState('');
  
  // Mock Metric Controls
  const [latency, setLatency] = useState(25);
  const [failures, setFailures] = useState(0); 
  
  // Real-time Response Storage State Loops
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [telemetry, setTelemetry] = useState({ activeNode: 'Idle', remedialPathActive: false, retrievedContext: [] });

  const swapSubjectContext = (subject) => {
    setActiveSubject(subject);
    setActiveTier('Class 10');
    setActiveView('theory');
    setCurrentQuestion(CLASSROOM_DATABASE[subject]['Class 10'].quizzes[0]);
    setChatLog([]);
    setTelemetry({ activeNode: 'Idle', remedialPathActive: false, retrievedContext: [] });
  };

  const swapTierContext = (tier) => {
    setActiveTier(tier);
    setActiveView('theory');
    setCurrentQuestion(CLASSROOM_DATABASE[activeSubject][tier].quizzes[0] || { text: "No questions configured." });
    setChatLog([]);
    setTelemetry({ activeNode: 'Idle', remedialPathActive: false, retrievedContext: [] });
  };

  const routeToCheckpointQuiz = () => {
    setChatLog([]);
    setActiveView('quiz');
    if (activeClassroom.quizzes.length > 0) {
      setCurrentQuestion(activeClassroom.quizzes[0]);
    }
  };

  const submitQuizAnswer = async () => {
    if (!studentAnswer.trim()) return;
    setLoading(true);

    const userMessage = { text: studentAnswer, sender: 'student' };
    const nextHistory = [...chatLog, userMessage];
    setChatLog(nextHistory);
    setStudentAnswer('');
    setTelemetry(prev => ({ ...prev, activeNode: 'Retrieving Context...' }));

    try {
      const response = await fetch('http://127.0.0.1:8000/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Question: ${currentQuestion.text} | Answer Attempt: ${userMessage.text}`,
          time_taken: parseInt(latency),
          consecutive_errors: parseInt(failures),
          current_tier: activeTier,
          current_subject: activeSubject,
          current_mode: activeView,
          history: chatLog
        })
      });

      const result = await response.json();
      setChatLog([...nextHistory, { text: result.response, sender: 'tutor' }]);
      setTelemetry({
        activeNode: result.active_node,
        remedialPathActive: result.remedial_triggered,
        retrievedContext: result.context_pulled || []
      });
    } catch (error) {
      console.error("Communication channel exception:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans antialiased">
      
      {/* BRANDING HEADER CONTAINER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            INTELLIGENT LEARNING PLATFORM <span className="text-xs bg-blue-500/10 text-blue-400 font-mono px-2 py-0.5 rounded border border-blue-500/20">Full-Course Hub</span>
          </h1>
          
          {/* TOP PRIMARY SUBJECT NAVIGATION */}
          <div className="flex gap-2 mt-4">
            {Object.keys(CLASSROOM_DATABASE).map(subject => (
              <button 
                key={subject}
                onClick={() => swapSubjectContext(subject)}
                className={`text-xs px-4 py-1.5 rounded-lg border font-bold tracking-wide transition ${activeSubject === subject ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* METRICS CONFIGURATION PANELS */}
        <div className="flex flex-col gap-1.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs w-full lg:w-auto">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Simulation Analytics Controls</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Latency (sec):</span>
              <input type="number" value={latency} onChange={(e) => setLatency(e.target.value)} className="w-14 bg-slate-950 border border-slate-800 rounded p-1 font-mono text-center text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Errors:</span>
              <input type="number" value={failures} onChange={(e) => setFailures(e.target.value)} className="w-12 bg-slate-950 border border-slate-800 rounded p-1 font-mono text-center text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* THREE SECTION SEGREGATION ROW */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-3 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
        {['Class 10', 'Class 11-12', 'Undergraduate'].map(tier => (
          <button
            key={tier}
            onClick={() => swapTierContext(tier)}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTier === tier ? 'bg-slate-800 text-white border border-slate-700 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <GraduationCap className="w-4 h-4"/> {tier}
          </button>
        ))}
      </div>

      {/* TWO COLUMN INTERACTION FIELD */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* INTERACTION AREA (THEORY WORKSPACE / ACTIVE TESTING APP) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col h-[650px]">
          
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <button 
              onClick={() => setActiveView('theory')}
              className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded transition ${activeView === 'theory' ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'text-slate-500'}`}
            >
              Theory Manual
            </button>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <button 
              onClick={() => setActiveView('quiz')}
              className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded transition ${activeView === 'quiz' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-500'}`}
              disabled={activeClassroom.quizzes.length === 0}
            >
              Checkpoint Quiz
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {activeView === 'theory' ? (
              <div className="space-y-4">
                {activeClassroom.modules.map((mod, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-400"/> {mod.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">{mod.content}</p>
                  </div>
                ))}
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={routeToCheckpointQuiz}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition"
                  >
                    Take Chapter Test <ArrowRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl border-l-2 border-l-emerald-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">Target Prompt Objective</span>
                    <p className="text-sm text-slate-200 font-medium">{currentQuestion.text}</p>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                    {chatLog.length === 0 && (
                      <div className="text-center py-12 text-slate-600 flex flex-col items-center justify-center gap-2">
                        <HelpCircle className="w-8 h-8 stroke-1" />
                        <p className="text-xs italic">Submit your logical analysis below to evaluate your metric routing.</p>
                      </div>
                    )}
                    {chatLog.map((chat, idx) => (
                      <div key={idx} className={`flex ${chat.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] text-xs p-3 rounded-xl border leading-relaxed ${chat.sender === 'student' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                          <span className={`block font-black tracking-widest text-[9px] uppercase mb-1 ${chat.sender === 'student' ? 'text-emerald-400' : 'text-blue-400'}`}>
                            {chat.sender === 'student' ? 'Student Input' : 'Tutor Engine'}
                          </span>
                          {chat.text}
                        </div>
                      </div>
                    ))}
                    {loading && <div className="text-[10px] font-mono text-slate-500 animate-pulse flex items-center gap-2"><BrainCircuit className="w-4 h-4"/> Graph routing computing loops...</div>}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex gap-2">
                  <input 
                    type="text"
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitQuizAnswer()}
                    placeholder="Provide your solution approach here..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={submitQuizAnswer}
                    disabled={loading || !studentAnswer.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold px-4 rounded-lg text-xs uppercase tracking-wider transition"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: GRAPH VISUALIZATION PIPELINE */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-[650px]">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5"><Network className="w-4 h-4 text-blue-400"/> Graph Routing Telemetry Mapping</h2>
            
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 flex flex-col gap-1.5 font-mono text-[11px]">
              <div className={`p-1.5 rounded border flex justify-between items-center transition-all ${telemetry.activeNode.includes('Retriever') ? 'bg-purple-950/40 border-purple-500 text-purple-300 scale-[1.01]' : 'border-slate-900 text-slate-600'}`}>
                <span>1. Metadata Context RAG</span> <Database className="w-3 h-3"/>
              </div>
              <div className={`p-1.5 rounded border flex justify-between items-center transition-all ${telemetry.activeNode.includes('Analyzer') ? 'bg-blue-950/40 border-blue-500 text-blue-300 scale-[1.01]' : 'border-slate-900 text-slate-600'}`}>
                <span>2. Cognitive Load Analyzer</span> <Activity className="w-3 h-3"/>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className={`p-1.5 rounded border text-[10px] text-center transition-all ${telemetry.activeNode.includes('Socratic') ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-950/40' : 'border-slate-900 text-slate-700 opacity-40'}`}>
                  IF Errors &lt; 2<br/>Socratic Hint
                </div>
                <div className={`p-1.5 rounded border text-[10px] text-center transition-all ${telemetry.activeNode.includes('Direct') ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold shadow-lg shadow-amber-950/40' : 'border-slate-900 text-slate-700 opacity-40'}`}>
                  IF Errors &ge; 2<br/>Direct Explanation
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex-1 flex flex-col min-h-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2.5 flex items-center gap-1.5"><BookOpen className="w-4 h-4"/> Bounded Context Vectors Isolated</h2>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-purple-300 flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {(telemetry.retrievedContext || []).length === 0 ? (
                <span className="text-slate-600 italic">No localized vector payload active. Read the chapter layout or trigger a checkpoint assessment.</span>
              ) : (
                telemetry.retrievedContext.map((text, idx) => (
                  <p key={idx} className="bg-purple-950/10 border border-purple-900/30 p-2 rounded-md leading-normal">{text}</p>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}