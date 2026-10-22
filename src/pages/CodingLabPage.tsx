import React, { useState } from 'react';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Terminal,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { SEED_TEST_QUESTIONS } from '../data/seedAssessments';
import { Question } from '../types';

export const CodingLabPage: React.FC = () => {
  const codingQuestions: Question[] = SEED_TEST_QUESTIONS['tech-coding-challenges'] || [];
  const [selectedQIndex, setSelectedQIndex] = useState<number>(0);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');

  const currentQ = codingQuestions[selectedQIndex] || codingQuestions[0];
  const codingDetails = currentQ?.codingDetails;

  const [code, setCode] = useState<string>(() => {
    return codingDetails?.starterCode?.javascript || '// Write your solution here\nfunction solve(input) {\n  \n}';
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<any | null>(null);

  const handleSelectQuestion = (index: number) => {
    setSelectedQIndex(index);
    setRunResult(null);
    const q = codingQuestions[index];
    if (q?.codingDetails?.starterCode) {
      setCode(q.codingDetails.starterCode[language] || '// Implement solve(input)');
    }
  };

  const handleLanguageChange = (lang: 'javascript' | 'python') => {
    setLanguage(lang);
    setRunResult(null);
    if (codingDetails?.starterCode) {
      setCode(codingDetails.starterCode[lang] || '');
    }
  };

  const handleResetStarter = () => {
    if (codingDetails?.starterCode) {
      setCode(codingDetails.starterCode[language] || '');
      setRunResult(null);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setRunResult(null);

    try {
      const res = await api.runCodingTest({
        questionId: currentQ.id,
        language,
        code,
      });
      setRunResult(res);
    } catch (e: any) {
      setRunResult({
        success: false,
        passedTestCases: 0,
        totalTestCases: codingDetails?.sampleTestCases.length || 0,
        errorMessage: e.message || 'Execution failed',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div id="coding-lab-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Sandboxed Execution Module
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Algorithmic Coding Challenge Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Practice competitive coding problems with automated sample test verification in an isolated Node.js sandbox.
          </p>
        </div>

        {/* Problem selector dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-600">Challenge:</label>
          <select
            value={selectedQIndex}
            onChange={e => handleSelectQuestion(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {codingQuestions.map((q, idx) => (
              <option key={q.id} value={idx}>
                {idx + 1}. {q.topicName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Coding Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Statement & Test Case Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                Problem {selectedQIndex + 1} • {currentQ?.difficulty}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{currentQ?.topicName}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {codingDetails?.problemStatement || currentQ?.question}
              </p>
            </div>

            {/* Input / Output Formats */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Input Format:</span>
                <code className="text-slate-600 font-mono text-[11px]">{codingDetails?.inputFormat}</code>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Output Format:</span>
                <code className="text-slate-600 font-mono text-[11px]">{codingDetails?.outputFormat}</code>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Constraints:</span>
                <code className="text-slate-600 font-mono text-[11px]">{codingDetails?.constraints}</code>
              </div>
            </div>

            {/* Sample Test Cases */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Sample Test Cases</h3>
              <div className="space-y-2">
                {codingDetails?.sampleTestCases.map((tc, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Case {idx + 1}</span>
                      {tc.explanation && <span>{tc.explanation}</span>}
                    </div>
                    <div><span className="text-indigo-400">Input: </span>{tc.input}</div>
                    <div><span className="text-emerald-400">Expected: </span>{tc.expectedOutput}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={e => handleLanguageChange(e.target.value as any)}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white outline-none"
                >
                  <option value="javascript">JavaScript (Node.js vm)</option>
                  <option value="python">Python 3</option>
                </select>

                <button
                  onClick={handleResetStarter}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  title="Reset to starter code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button
                id="run-code-button"
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all hover:scale-105"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunning ? 'Executing...' : 'Run Test Cases'}</span>
              </button>
            </div>

            {/* Code Textarea */}
            <div className="relative">
              <textarea
                rows={16}
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full p-4 bg-slate-950 text-emerald-300 font-mono text-xs rounded-xl border border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                placeholder="// Implement solve(input)..."
              />
            </div>

            {/* Execution Output Panel */}
            {runResult && (
              <div className={`p-4 rounded-xl border space-y-3 ${
                runResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center space-x-2">
                    {runResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span className={runResult.success ? 'text-emerald-900' : 'text-rose-900'}>
                      {runResult.success ? 'Passed: All Sample Cases Succeeded' : 'Test Failures Detected'}
                    </span>
                  </div>
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{runResult.runtimeMs} ms</span>
                  </span>
                </div>

                <p className="text-xs text-slate-700">{runResult.feedback || runResult.errorMessage}</p>

                {/* Individual test case results */}
                {runResult.testResults && runResult.testResults.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {runResult.testResults.map((tr: any) => (
                      <div key={tr.testIndex} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-mono flex items-center justify-between">
                        <div className="space-x-2">
                          <span className={tr.passed ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            {tr.passed ? 'PASS' : 'FAIL'} Case {tr.testIndex}
                          </span>
                          <span className="text-slate-500">Output: {tr.actualOutput}</span>
                        </div>
                        <span className="text-slate-400 text-[10px]">{tr.runtimeMs}ms</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
