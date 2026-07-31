import React, { useState } from 'react';
import { 
  BrainCircuit, 
  ChevronRight, 
  ArrowRight, 
  Zap, 
  Sparkles,
  BookOpen,
  HelpCircle,
  Bookmark,
  Layout,
  Instagram,
  Facebook,
  Twitter,
  Menu,
  X,
  Dna,
  Atom,
  Binary,
  GraduationCap,
  School,
  Library
} from 'lucide-react';

export default function LandingPage({ onSignUp, onNavigateSubject, onNavigateTier }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const subjects = [
    { icon: Atom, title: "Physics", desc: "Master the laws of nature from classical mechanics to quantum formulations with interactive RAG-powered modules." },
    { icon: Dna, title: "Biology", desc: "Explore the complexities of life, from cellular power plants to advanced epigenetic modifications and genetics." },
    { icon: Binary, title: "Mathematics", desc: "Build a strong foundation in calculus, linear equations, and analytical transformations through Socratic guidance." }
  ];

  const levels = [
    { icon: School, title: "Class 10", desc: "Foundational concepts designed to prepare students for early academic excellence and core understanding." },
    { icon: Library, title: "Class 11-12", desc: "Advanced high-school curriculum focused on preparing students for university-level challenges and entrance exams." },
    { icon: GraduationCap, title: "Undergraduate", desc: "Rigorous academic content tailored for university students pursuing degrees in science and mathematics." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* GLOWING ORB DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header className="w-full glass-panel border-b border-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-purple-950/20">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AURA</h1>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollToSection('offerings')} className="hover:text-white transition-colors">Offerings</button>
          <button onClick={() => scrollToSection('gallery')} className="hover:text-white transition-colors">Gallery</button>
          <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About</button>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={onSignUp}
            className="hidden sm:block bg-slate-100 text-slate-950 text-xs font-bold px-5 py-2 rounded-lg hover:bg-white transition-all shadow-lg"
          >
            Sign Up
          </button>
          
          {/* Hamburger Menu Button */}
          <button 
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-900 md:hidden flex flex-col p-6 space-y-6 z-40 animate-fadeIn">
            <button onClick={() => scrollToSection('features')} className="text-left text-sm font-semibold text-slate-300 hover:text-white">Features</button>
            <button onClick={() => scrollToSection('offerings')} className="text-left text-sm font-semibold text-slate-300 hover:text-white">Offerings</button>
            <button onClick={() => scrollToSection('gallery')} className="text-left text-sm font-semibold text-slate-300 hover:text-white">Gallery</button>
            <button onClick={() => scrollToSection('about')} className="text-left text-sm font-semibold text-slate-300 hover:text-white">About</button>
            <button 
              onClick={onSignUp}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
            >
              Get Started
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-[1200px] mx-auto px-6 py-12 space-y-32">
        
        {/* HERO SECTION */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-12">
          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
              Elevate Your Learning with <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">AI Intelligence</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Experience a cognitive companion that adapts to your unique learning style. 
              Master complex subjects with RAG-powered study decks and real-time Socratic feedback.
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={onSignUp}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="bg-slate-900/50 border border-slate-800 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="glass-panel aspect-video rounded-3xl border border-slate-800 flex items-center justify-center bg-slate-900/40 relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
             <Layout className="w-20 h-20 text-slate-700 group-hover:text-blue-400 transition-colors duration-500" />
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="space-y-12 text-center scroll-mt-24">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-white">Advanced Learning Modules</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our platform combines cognitive science with state-of-the-art AI to provide an unparalleled educational experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'rag', icon: BookOpen, title: "Study Decks", desc: "RAG-powered intelligent flashcards that summarize complex textbooks into digestible bits." },
              { id: 'socratic', icon: HelpCircle, title: "Practice Lab", desc: "Interactive Socratic dialogue that guides you to solutions rather than just giving answers." },
              { id: 'threshold', icon: Bookmark, title: "Threshold Exams", desc: "Adaptive testing that measures mastery and identifies conceptual gaps using fuzzy logic." },
              { id: 'spaced', icon: Zap, title: "Quick Recall", desc: "Optimized spaced repetition algorithms to ensure long-term retention of critical concepts." },
              { id: 'genai', icon: Sparkles, title: "AI Generation", desc: "Instantly create study materials from any textbook or curriculum with one click." },
              { id: 'glassbox', icon: Layout, title: "Glassbox UI", desc: "Transparent, distraction-free interface designed for deep focus and peak productivity." }
            ].map((f, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl border border-slate-900 hover:border-blue-500/30 transition-all text-left space-y-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">{f.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* IMAGE GALLERY SECTION */}
        <section id="gallery" className="space-y-12 scroll-mt-24">
          <h3 className="text-3xl font-bold text-white text-center">Visual Learning Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px] md:h-[600px]">
            <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/40 flex items-center justify-center relative group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Layout className="w-16 h-16 text-slate-700 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 flex items-center justify-center relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Layout className="w-8 h-8 text-slate-700 group-hover:text-purple-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OFFERINGS SECTION (2x3 GRID: SUBJECTS & LEVELS) */}
        <section id="offerings" className="space-y-16 scroll-mt-24">
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-bold text-white">Explore Our Curriculum</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose from a variety of subjects and academic levels tailored to your learning stage.
            </p>
          </div>

          <div className="space-y-12">
            {/* Subjects Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subjects.map((s, i) => (
                <div key={i} className="glass-panel p-8 rounded-2xl border border-slate-900 hover:border-emerald-500/30 transition-all space-y-4 group">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white">{s.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                  <button 
                    onClick={() => onNavigateSubject(s.title)}
                    className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Explore Course <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Academic Levels Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {levels.map((l, i) => (
                <div key={i} className="glass-panel p-8 rounded-2xl border border-slate-900 hover:border-purple-500/30 transition-all space-y-4 group">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <l.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white">{l.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{l.desc}</p>
                  <button 
                    onClick={() => onNavigateTier(l.title)}
                    className="text-xs font-bold text-purple-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Select Tier <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL HERO SECTION */}
        <section className="text-center py-20 glass-panel rounded-[40px] border border-slate-900 relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full"></div>
           <div className="relative z-10 space-y-8 max-w-3xl mx-auto px-6">
              <h3 className="text-4xl font-bold text-white">Ready to Transform Your Learning?</h3>
              <p className="text-slate-400 text-lg">
                Join thousands of students using Aura to accelerate their education. 
                Experience the future of personalized tutoring today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={onSignUp}
                  className="bg-slate-100 text-slate-950 font-bold text-sm px-8 py-4 rounded-2xl hover:bg-white transition-all shadow-xl shadow-white/5"
                >
                  Get Started for Free
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="bg-slate-950 border border-slate-800 text-white font-bold text-sm px-8 py-4 rounded-2xl hover:bg-slate-900 transition-all"
                >
                  Contact Support
                </button>
              </div>
           </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-12">
        <div className="max-w-[1200px] mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-lg">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">AURA</span>
            </div>
            
            <div className="flex gap-8 text-xs font-medium text-slate-500">
              <button onClick={() => scrollToSection('about')} className="hover:text-slate-300">About</button>
              <a href="#" className="hover:text-slate-300">Privacy</a>
              <a href="#" className="hover:text-slate-300">Terms</a>
              <a href="#" className="hover:text-slate-300">Contact</a>
            </div>

            <div className="flex gap-4">
              <Instagram className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer transition-colors" />
              <Facebook className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-900/50 gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <span>© 2024 Aura Cognitive. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
