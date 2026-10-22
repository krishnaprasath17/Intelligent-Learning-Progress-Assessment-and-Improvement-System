import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
  Code2,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ChatMsg {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const AITutorPage: React.FC = () => {
  const { user } = useAuth();
  const { tutorInitialPrompt, setTutorInitialPrompt, selectedSkillId, recentAssessments } = useData();

  const lastAsm = recentAssessments[0];

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I am **Socrates AI**, your adaptive computer science and software engineering tutor.

${lastAsm ? `I've reviewed your assessment diagnostics for **${lastAsm.skillName}** (Score: **${lastAsm.score}%**). Your strongest topic is **${lastAsm.strongTopics[0] || 'not available yet'}**, and I can help you work on **${lastAsm.weakTopics[0] || 'your next learning goal'}**!` : 'Complete an assessment and I will use your real results to personalize our tutoring session.'}

What concept, assessment question, error message, or algorithm would you like to explore together today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialPromptExecutedRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (tutorInitialPrompt && tutorInitialPrompt !== initialPromptExecutedRef.current) {
      initialPromptExecutedRef.current = tutorInitialPrompt;
      const prompt = tutorInitialPrompt;
      setTutorInitialPrompt('');
      handleSendPrompt(prompt);
    }
  }, [tutorInitialPrompt]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.askTutor({
        message: textToSend,
        chatHistory: history,
        userContext: {
          name: user?.name || 'Student',
          skillName: lastAsm?.skillName || selectedSkillId,
          recentScore: lastAsm?.score,
          strengths: lastAsm?.strongTopics,
          weaknesses: lastAsm?.weakTopics,
          experienceLevel: user?.experienceLevel,
          careerGoal: user?.careerGoal,
        },
      });

      const aiMsg: ChatMsg = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error('Tutor error:', e);
      const fallbackMsg: ChatMsg = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        text: `### Key Concept Breakdown

Let's dissect this step-by-step:

1. **Underlying Logic**:
   In programming, syntax and data structures operate on explicit runtime contracts. When handling transformations or data types, always verify boundaries and mutability.

2. **Practical Demonstration**:
\`\`\`python
# Safe and idiomatic execution pattern
def demonstrate_concept(items):
    # Guard clause and explicit processing
    return [x for x in items if x is not None]
\`\`\`

3. **Key Takeaway**:
   Focus on predictable state transitions and memory management.

💡 **Quick Socratic Challenge:**
*How would you handle type validation if unexpected inputs arrive at runtime?*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const starterPrompts = [
    'Explain Python Custom Exceptions vs standard ValueError',
    'Why is my SQL JOIN duplicating rows and how do I fix it?',
    'Explain how Polymorphism and Interfaces work in Java / C++',
    'Give me a 5-minute interactive code drill on DSA binary search',
  ];

  return (
    <div id="ai-tutor-page" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Header Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-900">Socrates AI Tutor</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Context-Aware Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Personalized to: <strong>{user?.name}</strong> • Focus: <strong>{lastAsm?.skillName || 'Computer Science'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setMessages([messages[0]]);
              initialPromptExecutedRef.current = null;
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 overflow-y-auto shadow-xs space-y-4">
        {messages.map(msg => {
          const isModel = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                isModel ? 'justify-start' : 'justify-end'
              }`}
            >
              {isModel && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  isModel
                    ? 'bg-slate-50 text-slate-900 border border-slate-200/80'
                    : 'bg-blue-600 text-white shadow-blue-500/10'
                }`}
              >
                {isModel ? (
                  <div className="prose prose-xs sm:prose-sm max-w-none text-slate-900 leading-relaxed [&>p]:mb-2.5 [&>ul]:mb-2.5 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:mb-2.5 [&>ol]:list-decimal [&>ol]:pl-4 [&>h3]:text-xs sm:[&>h3]:text-sm [&>h3]:font-bold [&>h3]:mt-3 [&>h3]:mb-1.5 [&>h4]:font-semibold [&>pre]:my-2 [&>pre]:p-3 [&>pre]:bg-slate-900 [&>pre]:text-emerald-300 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>code]:font-mono [&>code]:text-[11px] sm:[&>code]:text-xs">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-normal">
                    {msg.text}
                  </div>
                )}
                <div
                  className={`text-[10px] mt-2 text-right ${
                    isModel ? 'text-slate-400' : 'text-blue-100'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isModel && (
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Socrates AI is synthesizing pedagogical response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Prompts */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {starterPrompts.map((prompt, idx) => (
          <button
            key={idx}
            id={`tutor-starter-btn-${idx}`}
            onClick={() => handleSendPrompt(prompt)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors flex items-center space-x-1"
          >
            <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendPrompt(inputText);
        }}
        className="flex items-center space-x-2 shrink-0"
      >
        <input
          id="tutor-chat-input"
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ask Socrates AI about any programming concept, algorithm, or bug..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-hidden shadow-xs"
        />
        <button
          id="tutor-send-btn"
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all flex items-center space-x-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
