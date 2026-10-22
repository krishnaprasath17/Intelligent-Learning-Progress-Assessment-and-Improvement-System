import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2,
  TrendingUp,
  Map,
  Bot,
  Zap,
  Code2,
  Database,
  Award,
  Layers,
  Cpu,
  Terminal,
  FileCode,
  Atom,
  Binary,
  Boxes,
  Shield,
  Clock,
  HelpCircle,
  Mail,
  ChevronDown,
  X,
  ExternalLink,
  BookOpen,
  Check,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SkillIcon } from '../components/common/SkillIcon';

export const LandingPage: React.FC = () => {
  const { setCurrentView, openTestInstructions, testsList } = useData();
  const { user } = useAuth();

  // Modals state
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does AssessAI differ from ordinary quiz apps?',
      a: 'Traditional quiz tools assign a flat percentage score and stop. AssessAI uses Generative AI to diagnose the underlying cognitive misconception (e.g. confusion between pointer arithmetic and array indexing), and dynamically synthesizes a targeted 4-week learning roadmap to remedy those gaps.',
    },
    {
      q: 'Are the assessments timed and server-authoritative?',
      a: 'Yes. Every assessment attempt receives a server-side timestamp and deadline. The examination engine autosaves responses continuously and auto-submits when the server deadline expires, providing authentic placement exam simulation.',
    },
    {
      q: 'Can I practice coding problems directly in the browser?',
      a: 'Yes! AssessAI includes a secure, sandboxed code execution module for JavaScript and Python with sample and hidden test case verification.',
    },
    {
      q: 'How does the XP and Level system reward students?',
      a: 'Students earn 150 base XP per completed assessment, +25 XP per correct answer, score bonuses (75 XP for >=80%, 150 XP for 100%), and 100 XP for every completed roadmap milestone across a 10-level mastery ladder from Apprentice to Luminary.',
    },
    {
      q: 'Can university faculty or administrators create custom tests?',
      a: 'Yes. Authorized administrators have access to an institutional control panel where they can configure questions, import questions via JSON/CSV, set negative marking, manage deadlines, and export performance reports.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.email && contactForm.message) {
      setContactSubmitted(true);
      setTimeout(() => {
        setContactSubmitted(false);
        setActiveModal(null);
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }, 2000);
    }
  };

  return (
    <div id="landing-page" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Public Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => setCurrentView(user ? 'dashboard' : 'landing')}
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-xs">
              A
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                Assess<span className="text-indigo-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Education Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <button onClick={() => setCurrentView('tests')} className="hover:text-indigo-600 transition-colors">
              Assessments
            </button>
            <button onClick={() => setCurrentView(user ? 'roadmap' : 'auth')} className="hover:text-indigo-600 transition-colors">
              Learning Roadmaps
            </button>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            {user ? (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  id="landing-signin-btn"
                  onClick={() => setCurrentView('auth')}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="landing-getstarted-btn"
                  onClick={() => setCurrentView('auth')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-105"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-slate-50 border-b border-slate-200/80 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tag Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-900 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>AI-Powered Adaptive Assessment & Skill Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Assess Your Skills. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Master Your Weaknesses.
              </span> <br />
              Build Your Future.
            </h1>

            {/* Description Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              A complete, production-grade online assessment and personalized learning platform. 
              Diagnose conceptual gaps in core CS, programming, and placement aptitude with server-authoritative exams, 
              interactive coding labs, and adaptive Gemini AI roadmaps.
            </p>

            {/* Primary Calls to Action */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                id="hero-start-learning-btn"
                onClick={() => setCurrentView(user ? 'dashboard' : 'auth')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-explore-tests-btn"
                onClick={() => setCurrentView('tests')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Explore Assessments</span>
              </button>

              <button
                id="hero-signin-alt-btn"
                onClick={() => setCurrentView('auth')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
              >
                <span>Sign In</span>
              </button>
            </div>

            {/* Real Stats Highlights */}
            <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-indigo-600">15+</p>
                <p className="text-xs text-slate-500 font-medium">Standardized Tests</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-600">10 Tiers</p>
                <p className="text-xs text-slate-500 font-medium">XP Mastery Ladder</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-600">100%</p>
                <p className="text-xs text-slate-500 font-medium">Server-Synchronized Timers</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-600">24/7</p>
                <p className="text-xs text-slate-500 font-medium">Socratic AI Coaching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Student Platform Preview
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Rigorous Engineering Excellence
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Real-time analytics, question paletting, granular topic mastery tracking, and milestone upskilling roadmap.
            </p>
          </div>

          {/* Interactive UI Mockup Card */}
          <div className="rounded-2xl bg-slate-900 p-3 sm:p-6 shadow-2xl border border-slate-800 text-white max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400 font-mono ml-2">assessai.edu / student-dashboard</span>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-900/60 px-2.5 py-1 rounded-md border border-indigo-700/50">
                LIVE DEMO PREVIEW
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* Stat card 1 */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Current Mastery</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xl font-bold text-white">Level 4: Scholar</p>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '68%' }} />
                </div>
                <p className="text-[11px] text-slate-400">1,350 / 2,000 XP to Senior Technologist</p>
              </div>

              {/* Stat card 2 */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Average Test Accuracy</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-emerald-400">78.5% Accuracy</p>
                <p className="text-[11px] text-slate-400">+14% improvement over last 4 assessment cycles</p>
                <span className="inline-block text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Top 15% Campus Percentile
                </span>
              </div>

              {/* Stat card 3 */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>AI Learning Roadmap</span>
                  <Map className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-xl font-bold text-white">Week 2 of 4 Active</p>
                <p className="text-[11px] text-slate-400">Next milestone: Concurrency & Async Worker Pools</p>
                <button
                  onClick={() => setCurrentView('tests')}
                  className="text-xs text-indigo-300 hover:text-indigo-200 font-bold flex items-center space-x-1"
                >
                  <span>Explore Available Tests</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections: 3 Supported Domains */}
      <section id="features" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Curriculum Architecture
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Three Comprehensive Assessment Pillars
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Covering university coursework, software engineering interviews, and campus recruitment drives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar A: Academic */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">A. Academic Assessments</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                University semester examinations and concept tests covering core engineering curriculum:
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>DBMS & Relational Theory (BCNF/3NF, ACID)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Operating Systems (Deadlocks, Paging, Semaphores)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Computer Networks (TCP/IP, CIDR Subnetting)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Object-Oriented Software Engineering & SOLID</span>
                </li>
              </ul>
              <button
                onClick={() => setCurrentView('tests')}
                className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
              >
                Browse Academic Tests
              </button>
            </div>

            {/* Pillar B: Technical & Coding */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">B. Programming & Technical Skills</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                In-depth software engineering benchmarks and interactive algorithmic coding challenges:
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Java Enterprise, JVM Internals & Concurrency</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Python Advanced Architecture & Asyncio</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>C++ Memory Safety, Pointers & STL Complexity</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Sandboxed Algorithmic Coding Challenges</span>
                </li>
              </ul>
              <button
                onClick={() => setCurrentView('tests')}
                className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors"
              >
                Browse Technical Tests
              </button>
            </div>

            {/* Pillar C: Placement Prep */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">C. Placement Preparation</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Company recruitment mock evaluations and competitive placement screening tests:
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quantitative Aptitude (Speed Math, Probability)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Logical Reasoning & Analytical Seating Puzzles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verbal Ability & Professional Tech Communication</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>IT Services & Product Company Mock Drives</span>
                </li>
              </ul>
              <button
                onClick={() => setCurrentView('tests')}
                className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors"
              >
                Browse Placement Tests
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              The Pedagogical Loop
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How AssessAI Powers Your Improvement
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-black text-indigo-600">STEP 1</span>
              <h4 className="text-base font-bold text-slate-900 mt-2 mb-1">Take Synchronized Exam</h4>
              <p className="text-xs text-slate-600">
                Experience realistic exam conditions with server deadlines, question palettes, and autosaved answers.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-black text-indigo-600">STEP 2</span>
              <h4 className="text-base font-bold text-slate-900 mt-2 mb-1">Gemini AI Gap Diagnosis</h4>
              <p className="text-xs text-slate-600">
                AI analyzes performance per topic and difficulty level, identifying exact cognitive misconceptions.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-black text-indigo-600">STEP 3</span>
              <h4 className="text-base font-bold text-slate-900 mt-2 mb-1">4-Week Adaptive Roadmap</h4>
              <p className="text-xs text-slate-600">
                A custom milestone schedule with curated documentation, mini-projects, and drills tailored to your schedule.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-black text-indigo-600">STEP 4</span>
              <h4 className="text-base font-bold text-slate-900 mt-2 mb-1">XP Mastery & Level Up</h4>
              <p className="text-xs text-slate-600">
                Earn XP for tests and milestone completions, unlocking achievements and advancing up the 10-level ladder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-bold text-sm text-slate-900 flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      faqOpen === idx ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white font-extrabold text-base">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  A
                </div>
                <span>AssessAI</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Intelligent Learning Progress Assessment and Improvement System. Built for universities, engineering students, and career aspirants.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Assessments</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentView('tests')} className="hover:text-white transition-colors">Academic Examinations</button></li>
                <li><button onClick={() => setCurrentView('tests')} className="hover:text-white transition-colors">Programming Benchmarks</button></li>
                <li><button onClick={() => setCurrentView('tests')} className="hover:text-white transition-colors">Placement Preparation</button></li>
                <li><button onClick={() => setCurrentView('tests')} className="hover:text-white transition-colors">Coding Challenges Lab</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Platform</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentView(user ? 'roadmap' : 'auth')} className="hover:text-white transition-colors">Adaptive Roadmaps</button></li>
                <li><button onClick={() => setCurrentView(user ? 'ai-tutor' : 'auth')} className="hover:text-white transition-colors">Socratic AI Tutor</button></li>
                <li><button onClick={() => setCurrentView(user ? 'achievements' : 'auth')} className="hover:text-white transition-colors">XP & Mastery Tiers</button></li>
                <li><button onClick={() => setCurrentView('auth')} className="hover:text-white transition-colors">Institutional Admin Access</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Legal & Support</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => setActiveModal('contact')} className="hover:text-white transition-colors">Contact Support</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
            <span>© {new Date().getFullYear()} AssessAI — Intelligent Learning Progress Assessment and Improvement System. All rights reserved.</span>
            <div className="flex items-center space-x-4">
              <span>Cloud Firestoreasia-southeast1</span>
              <span>Gemini 3.7 AI Model</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Privacy Policy</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>AssessAI values your educational data privacy. This privacy notice explains how we collect and protect student information:</p>
              <h4 className="font-bold text-slate-900">1. Information We Collect</h4>
              <p>We collect student credentials, college details, academic responses, assessment timestamps, and learning roadmap progress strictly to evaluate proficiency and calculate personalized insights.</p>
              <h4 className="font-bold text-slate-900">2. Examination Integrity & Data Security</h4>
              <p>All student answers and timers are verified against server-authoritative databases. Student assessment responses are isolated and protected through Firestore Security Rules.</p>
              <h4 className="font-bold text-slate-900">3. Artificial Intelligence Processing</h4>
              <p>Assessment scores and performance summaries are transmitted to Google Gemini solely to formulate diagnostic feedback and recommendations. Private identifiers are never shared with external advertisers.</p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Terms of Service</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>By using AssessAI, you agree to the following institutional standards:</p>
              <h4 className="font-bold text-slate-900">1. Academic Honesty</h4>
              <p>Users must complete tests individually. Automated script submission or client-side tampering is strictly prohibited and logged in administrative audit trails.</p>
              <h4 className="font-bold text-slate-900">2. Assessment Timers & Submission</h4>
              <p>Assessments operate with server-authoritative deadlines. Tests automatically submit when the server countdown terminates.</p>
              <h4 className="font-bold text-slate-900">3. Gamification Policy</h4>
              <p>Experience points (XP) and badges are awarded solely for authenticated test completions and validated roadmap milestones. XP cannot alter official academic grades.</p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Contact Support & Institutional Inquiries</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {contactSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">Message Received</h4>
                <p className="text-xs text-slate-600">Our engineering and academic support team will respond promptly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="student@college.edu"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Institutional Question or Technical Support"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="How can we help your assessment journey?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
