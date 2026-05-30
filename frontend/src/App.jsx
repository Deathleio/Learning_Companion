import React, { useState } from 'react';
import { Terminal, Activity, BookOpen, AlertTriangle, ArrowRight, BrainCircuit, Database, Network } from 'lucide-react';

// Multi-Subject Quiz Bank
const QUIZ_BANK = {
  Physics: [
    { id: "p1", text: "A 10kg object experiences an acceleration of 5 m/s². What net force is acting on it?", concept: "Newton's Second Law" },
    { id: "p2", text: "If a car travels at a constant velocity of 20 m/s for 10 seconds, what is its acceleration?", concept: "Kinematics" }
  ],
  Biology: [
    { id: "b1", text: "What is the primary function of mitochondria in a eukaryotic cell?", concept: "Cellular Respiration" },
    { id: "b2", text: "Explain how DNA is transcribed into mRNA during gene expression.", concept: "Transcription" }
  ],
  Mathematics: [
    { id: "m1", text: "What is the derivative of f(x) = 3x² + 2x with respect to x?", concept: "Power Rule" },
    { id: "m2", text: "Evaluate the definite integral of 2x from x=0 to x=3.", concept: "Fundamental Theorem of Calculus" }
  ]
};

export default function App() {
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [currentQuestion, setCurrentQuestion] = useState(QUIZ_BANK['Physics'][0]);
  const [studentAnswer, setStudentAnswer] = useState('');
  
  // Simulation Controls
  const [latency, setLatency] = useState(25);
  const [failures, setFailures] = useState(0); 
  
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // Advanced Telemetry State
  const [telemetry, setTelemetry] = useState({
    activeNode: 'Idle',
    remedialPathActive: false,
    retrievedContext: []
  });

  const changeSubject = (subject) => {
    setActiveSubject(subject);
    setCurrentQuestion(QUIZ_BANK[subject][0]);
    setChatLog([]);
    setTelemetry({ activeNode: 'Idle', remedialPathActive: false, retrievedContext: [] });
  };

  const loadRandomQuestion = () => {
    const questions = QUIZ_BANK[activeSubject];
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQ);
    setChatLog([]);
  };

  const submitQuizAnswer = async () => {
    if (!studentAnswer.trim()) return;
    setLoading(true);

    const userMessage = { text: studentAnswer, sender: 'student' };
    const nextHistory = [...chatLog, userMessage];
    setChatLog(nextHistory);
    setStudentAnswer('');
    setTelemetry(prev => ({ ...prev, activeNode: 'Retrieving Context...' })); // Show RAG start

    try {
      const response = await fetch('http://127.0.0.1:8000/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Subject: ${activeSubject}] Question: ${currentQuestion.text} | Student Answer: ${userMessage.text}`,
          time_taken: parseInt(latency),
          consecutive_errors: parseInt(failures),
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
      console.error("Diagnostic loop network disruption:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans antialiased">
      
      {/* HEADER & SUBJECT SELECTOR */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            LANGGRAPH TUTOR <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20">Glass-Box Mode</span>
          </h1>
          <div className="flex gap-2 mt-3">
            {Object.keys(QUIZ_BANK).map(subject => (
              <button 
                key={subject}
                onClick={() => changeSubject(subject)}
                className={`text-xs px-3 py-1 rounded-full border transition ${activeSubject === subject ? 'bg-blue-600 border-blue-500 text-white font-bold' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
        
        {/* SIMULATION PANEL */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold text-right">Student Simulation Metrics</span>
          <div className="flex flex-wrap items-center gap-4 bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Response Latency:</span>
              <input type="number" value={latency} onChange={(e) => setLatency(e.target.value)} className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 font-mono text-emerald-400 text-center" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Errors:</span>
              <input type="number" value={failures} onChange={(e) => setFailures(e.target.value)} className="w-12 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 font-mono text-amber-400 text-center" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: STUDENT INTERFACE */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-[650px] justify-between">
          <div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Active Quiz</span>
                <button onClick={loadRandomQuestion} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 transition">Shuffle Question</button>
              </div>
              <p className="text-sm font-medium text-slate-200 leading-relaxed">{currentQuestion.text}</p>
            </div>

            <div className="space-y-4 h-[350px] overflow-y-auto pr-2 border-b border-slate-800/60 pb-4 custom-scrollbar">
              {chatLog.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                  <Terminal className="w-8 h-8 mb-2 stroke-1" />
                  <p className="text-xs italic">Submit an answer to watch the multi-agent graph evaluate your response.</p>
                </div>
              )}
              {chatLog.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-lg p-3 text-sm leading-relaxed border ${chat.sender === 'student' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                    <span className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${chat.sender === 'student' ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {chat.sender === 'student' ? 'Student' : 'AI Tutor'}
                    </span>
                    {chat.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs font-mono text-slate-500 animate-pulse flex items-center gap-2"><BrainCircuit className="w-4 h-4"/> Graph is executing...</div>}
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <input 
              type="text" 
              value={studentAnswer} 
              onChange={(e) => setStudentAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitQuizAnswer()}
              placeholder="Type answer..." 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
              disabled={loading}
            />
            <button 
              onClick={submitQuizAnswer}
              disabled={loading || !studentAnswer.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
            >
              Submit <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT: LIVE SYSTEM ARCHITECTURE MAP */}
        <div className="lg:col-span-6 flex flex-col gap-4 h-[650px]">
          
          {/* Visual Graph Architecture */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><Network className="w-4 h-4 text-emerald-400"/> Live LangGraph Routing Map</h2>
            
            <div className="relative flex flex-col gap-2 bg-slate-950 p-4 rounded-lg border border-slate-800/50 overflow-hidden">
              {/* Stepper Logic Mapping */}
              <div className={`p-2 rounded border text-xs font-mono flex justify-between items-center transition-all ${telemetry.activeNode.includes('Retriever') ? 'bg-purple-900/40 border-purple-500 text-purple-300 scale-[1.02]' : 'border-slate-800 text-slate-600'}`}>
                <span>1. ChromaDB Context Retriever</span> <Database className="w-3.5 h-3.5"/>
              </div>
              
              <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-slate-700 rotate-90"/></div>
              
              <div className={`p-2 rounded border text-xs font-mono flex justify-between items-center transition-all ${telemetry.activeNode.includes('Analyzer') ? 'bg-blue-900/40 border-blue-500 text-blue-300 scale-[1.02]' : 'border-slate-800 text-slate-600'}`}>
                <span>2. Telemetry Performance Analyzer</span> <Activity className="w-3.5 h-3.5"/>
              </div>

              <div className="flex justify-around px-8 mt-2">
                <ArrowRight className="w-4 h-4 text-slate-700 rotate-[135deg]"/>
                <ArrowRight className="w-4 h-4 text-slate-700 rotate-45"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-2 rounded border text-[10px] text-center font-mono transition-all ${telemetry.activeNode.includes('Socratic') ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-slate-800 text-slate-600 opacity-50'}`}>
                  IF Errors &lt; 2<br/><strong className="text-xs">Socratic Hint Agent</strong>
                </div>
                <div className={`p-2 rounded border text-[10px] text-center font-mono transition-all ${telemetry.activeNode.includes('Direct') ? 'bg-amber-900/40 border-amber-500 text-amber-300 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-800 text-slate-600 opacity-50'}`}>
                  IF Errors &ge; 2<br/><strong className="text-xs">Direct Explainer Agent</strong>
                </div>
              </div>
            </div>
            
            {/* System Explanation for Demo Viewers */}
            <div className="mt-4 p-3 bg-blue-950/20 border border-blue-900/30 rounded text-xs text-blue-200/80 leading-relaxed">
              <strong>What is happening?</strong> When a student submits an answer, the system searches the textbook vectors (RAG). Then, a logic node checks the simulation metrics. If the student is frustrated (high errors), it triggers the <em>Direct Explainer</em>. Otherwise, it defaults to the <em>Socratic</em> safety rails to prevent giving away the answer.
            </div>
          </div>

          {/* RAG Context Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex-1 flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4"/> textbook Vectors Pulled</h2>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-purple-300 flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {telemetry.retrievedContext.length === 0 ? (
                <span className="text-slate-600 italic">Awaiting query to run semantic search...</span>
              ) : (
                telemetry.retrievedContext.map((text, idx) => (
                  <p key={idx} className="bg-purple-950/20 border border-purple-900/40 p-2 rounded">{text}</p>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}