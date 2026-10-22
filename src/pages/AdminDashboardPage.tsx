import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Sparkles,
  Plus,
  Search,
  Flag,
  Code2,
  Trash2,
  TrendingUp,
  BarChart3,
  Layers,
  Copy,
  Download,
  Upload,
  FileText,
  Clock,
  Eye,
  Edit,
  History,
  Archive,
  Check,
  UserCheck,
  UserX,
  UserPlus,
  Mail,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LevelBadge } from '../components/common/LevelBadge';
import { Question, UserProfile, SkillLevel, AssessmentConfig, AdminAuditLog, AssessmentAttempt, AccessControlEntry } from '../types';
import { api } from '../services/api';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { skills, refreshTestsList } = useData();

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<AssessmentConfig[]>([]);
  const [attemptsList, setAttemptsList] = useState<AssessmentAttempt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [accessList, setAccessList] = useState<AccessControlEntry[]>([]);

  // Email Approval Form State
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [newNotes, setNewNotes] = useState('');
  const [accessActionFeedback, setAccessActionFeedback] = useState<string | null>(null);
  const [showAccessApprovalModal, setShowAccessApprovalModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'analytics' | 'access-control' | 'assessments' | 'questions' | 'submissions' | 'audit-logs' | 'ai-generator' | 'users'>('access-control');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');

  // Create / Edit Assessment Form State
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Partial<AssessmentConfig>>({
    title: '',
    description: '',
    category: 'Technical',
    domain: 'Python',
    difficulty: 'Intermediate',
    durationMinutes: 30,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0.25,
    maxAttempts: 3,
    status: 'published',
    instructions: ['Follow all exam rules carefully.', 'Auto-submits on timer expiry.'],
  });

  // Question Import State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // AI Question Generator Form State
  const [genSkill, setGenSkill] = useState<string>('Python');
  const [genTopic, setGenTopic] = useState<string>('Exception Handling');
  const [genDifficulty, setGenDifficulty] = useState<SkillLevel>('Intermediate');
  const [genType, setGenType] = useState<string>('CodeOutput');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPreview, setGeneratedPreview] = useState<Question | null>(null);

  // User Management State (Add & Edit Student / Faculty)
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    role: 'student' | 'admin';
    department: string;
    college: string;
    yearOfStudy: string;
    approveNow: boolean;
  }>({
    name: '',
    email: '',
    role: 'student',
    department: 'Computer Science & Engineering',
    college: 'Bannari Amman Institute of Technology',
    yearOfStudy: '3rd Year',
    approveNow: true,
  });
  const [userModalFeedback, setUserModalFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [sRes, uRes, qRes, aRes, attRes, logRes, accRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminQuestions(),
        api.getAdminAssessments(),
        api.getAdminAttempts(),
        api.getAdminAuditLogs(),
        api.getAccessControlList().catch(() => ({ accessList: [] })),
      ]);
      setStats(sRes);
      setUsersList(uRes.users || []);
      setQuestionsList(qRes.questions || []);
      setAssessmentsList(aRes.assessments || []);
      setAttemptsList(attRes.attempts || []);
      setAuditLogs(logRes.logs || []);
      setAccessList(accRes.accessList || []);
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };

  const handleApproveEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAccessActionFeedback(null);
    try {
      await api.approveEmail({
        email: newEmail.trim(),
        role: newRole,
        notes: newNotes.trim() || undefined,
      });
      setAccessActionFeedback(`Successfully approved ${newEmail.trim()} as ${newRole.toUpperCase()}`);
      setNewEmail('');
      setNewNotes('');
      setShowAccessApprovalModal(false);
      await loadData();
    } catch (err: any) {
      setAccessActionFeedback(`Error: ${err.message}`);
    }
  };

  const handleRevokeEmail = async (email: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;
    try {
      await api.revokeEmail(email);
      setAccessActionFeedback(`Revoked access for ${email}`);
      await loadData();
    } catch (err: any) {
      alert(`Revoke failed: ${err.message}`);
    }
  };

  const handleDeleteAccessEntry = async (email: string) => {
    if (!confirm(`Permanently remove ${email} from access list?`)) return;
    try {
      await api.deleteAccessEntry(email);
      setAccessActionFeedback(`Deleted entry for ${email}`);
      await loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserForm({
      name: '',
      email: '',
      role: 'student',
      department: 'Computer Science & Engineering',
      college: 'Bannari Amman Institute of Technology',
      yearOfStudy: '3rd Year',
      approveNow: true,
    });
    setUserModalFeedback(null);
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUserId(u.id);
    const isApp = accessList.some(a => a.email.toLowerCase() === u.email.toLowerCase() && a.approved);
    setUserForm({
      name: u.name,
      email: u.email,
      role: u.role === 'admin' ? 'admin' : 'student',
      department: u.department || 'Computer Science & Engineering',
      college: u.college || 'Bannari Amman Institute of Technology',
      yearOfStudy: u.yearOfStudy || '3rd Year',
      approveNow: isApp,
    });
    setUserModalFeedback(null);
    setShowUserModal(true);
  };

  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.email.trim() || !userForm.name.trim()) return;
    try {
      if (editingUserId) {
        await api.adminUpdateUser(editingUserId, userForm);
        setUserModalFeedback('User profile and access whitelist updated successfully in real-time!');
      } else {
        await api.adminCreateUser(userForm);
        setUserModalFeedback('User enrolled and whitelisted successfully in real-time!');
      }
      await loadData();
      setTimeout(() => setShowUserModal(false), 900);
    } catch (err: any) {
      setUserModalFeedback(`Error: ${err.message}`);
    }
  };

  const handleQuickApproveUser = async (u: UserProfile) => {
    try {
      await api.adminApproveUserEmail(u.id);
      await loadData();
      setAccessActionFeedback(`Successfully approved ${u.email} in real-time!`);
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Assessment Config Submit
  const handleSaveAssessmentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingConfigId) {
        await api.updateAdminAssessment(editingConfigId, configForm);
      } else {
        await api.createAdminAssessment(configForm);
      }
      setShowConfigModal(false);
      setEditingConfigId(null);
      await loadData();
      await refreshTestsList();
    } catch (e: any) {
      alert(`Failed to save assessment: ${e.message}`);
    }
  };

  const handleOpenEditConfig = (cfg: AssessmentConfig) => {
    setEditingConfigId(cfg.id);
    setConfigForm({ ...cfg });
    setShowConfigModal(true);
  };

  const handleDuplicateConfig = async (id: string) => {
    try {
      await api.duplicateAdminAssessment(id);
      await loadData();
      await refreshTestsList();
    } catch (e: any) {
      alert(`Duplicate failed: ${e.message}`);
    }
  };

  const handleArchiveConfig = async (id: string) => {
    if (!confirm('Are you sure you want to archive this assessment?')) return;
    try {
      await api.archiveAdminAssessment(id);
      await loadData();
      await refreshTestsList();
    } catch (e: any) {
      alert(`Archive failed: ${e.message}`);
    }
  };

  // Bulk Question Import
  const handleImportQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportFeedback(null);
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await api.importAdminQuestions(Array.isArray(parsed) ? parsed : [parsed]);
      setImportFeedback(`Successfully imported ${res.importedCount} questions!`);
      setShowImportModal(false);
      setImportJsonText('');
      await loadData();
    } catch (err: any) {
      setImportFeedback(`Import error: ${err.message || 'Invalid JSON format'}`);
    }
  };

  const handleExportSubmissionsCsv = () => {
    if (attemptsList.length === 0) {
      alert('No submissions available to export.');
      return;
    }
    const headers = ['Attempt ID', 'Student Name', 'Student Email', 'Assessment Title', 'Status', 'Score (%)', 'Accuracy (%)', 'Time Spent (s)', 'Started At', 'Submitted At'];
    const rows = attemptsList.map(a => [
      a.id,
      `"${(a.userName || '').replace(/"/g, '""')}"`,
      `"${(a.userEmail || '').replace(/"/g, '""')}"`,
      `"${(a.assessmentTitle || '').replace(/"/g, '""')}"`,
      a.status,
      a.score ?? '',
      a.accuracy ?? '',
      a.timeSpentSeconds ?? '',
      a.startedAt,
      a.submittedAt || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `assessai_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAssessmentsCsv = () => {
    if (assessmentsList.length === 0) {
      alert('No assessments available to export.');
      return;
    }
    const headers = ['Assessment ID', 'Title', 'Category', 'Domain', 'Difficulty', 'Duration (mins)', 'Questions', 'Max Marks', 'Negative Marking', 'Status'];
    const rows = assessmentsList.map(c => [
      c.id,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.category,
      c.domain,
      c.difficulty,
      c.durationMinutes,
      c.questionCount,
      c.maxMarks,
      c.negativeMarking,
      c.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `assessai_assessments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleFlag = async (qId: string, currentFlag?: boolean) => {
    try {
      await api.toggleFlagQuestion(qId, !currentFlag);
      await loadData();
    } catch (e) {
      console.error('Error toggling flag:', e);
    }
  };

  const handleGenerateAIQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.generateQuestion({
        skillName: genSkill,
        topicName: genTopic,
        targetDifficulty: genDifficulty,
        questionType: genType,
      });
      setGeneratedPreview(res.question);
      await loadData();
    } catch (e) {
      console.error('Error generating AI question:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = questionsList.filter(q => {
    if (selectedSkillFilter === 'All') return true;
    return q.skillId.toLowerCase() === selectedSkillFilter.toLowerCase();
  });

  return (
    <div id="admin-dashboard-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 flex items-center space-x-1">
              <Shield className="w-3 h-3 text-indigo-400" />
              <span>Institutional Faculty & Admin Control</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              Authorized: {user?.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Assessment & Curriculum Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Author and publish standardized examinations, configure negative marking and timers, inspect student submissions, and audit institutional events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="open-approval-email-modal-btn"
            type="button"
            onClick={() => {
              setAccessActionFeedback(null);
              setShowAccessApprovalModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Approve Email ID</span>
          </button>
          <button
            onClick={() => {
              setEditingConfigId(null);
              setConfigForm({
                title: '',
                description: '',
                category: 'Technical',
                domain: 'Python',
                difficulty: 'Intermediate',
                durationMinutes: 30,
                questionCount: 8,
                maxMarks: 40,
                negativeMarking: 0.25,
                maxAttempts: 3,
                status: 'published',
                instructions: ['Read instructions carefully.', 'Timed examination.'],
              });
              setShowConfigModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Assessment</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center space-x-1.5 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Questions</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap rounded-xl bg-slate-200/80 p-1 max-w-4xl gap-1">
        {[
          { id: 'access-control', label: `Approved Emails (${accessList.length})` },
          { id: 'assessments', label: `Assessments (${assessmentsList.length})` },
          { id: 'analytics', label: 'Platform Metrics' },
          { id: 'questions', label: `Question Bank (${questionsList.length})` },
          { id: 'submissions', label: `Submissions (${attemptsList.length})` },
          { id: 'ai-generator', label: 'AI Question Generator' },
          { id: 'audit-logs', label: `Audit Log (${auditLogs.length})` },
          { id: 'users', label: `Students (${usersList.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 0: ADMIN EMAIL ACCESS CONTROL */}
      {activeTab === 'access-control' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Admin Email-Based Access Control</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Only users whose email addresses are approved below can log in and access assessments and platform features.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                {accessList.filter(a => a.approved).length} approved
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                {accessList.length} total entries
              </span>
            </div>
          </div>

          {/* Add / Whitelist Email Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Approve / Whitelist New Email Address</span>
            </h4>

            {accessActionFeedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                  accessActionFeedback.startsWith('Error')
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}
              >
                {accessActionFeedback.startsWith('Error') ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                <span>{accessActionFeedback}</span>
              </div>
            )}

            <form onSubmit={handleApproveEmailSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  User Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="new-access-email-input"
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="e.g. student@bitsathy.ac.in"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Role
                </label>
                <select
                  id="new-access-role-select"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="user">USER (Student)</option>
                  <option value="admin">ADMIN (Administrator)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Department (Optional)
                </label>
                <input
                  id="new-access-notes-input"
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. CSE 3rd Year"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  id="submit-approve-email-btn"
                  type="submit"
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Approve Email</span>
                </button>
              </div>
            </form>
          </div>

          {/* Access Control Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Authorized Whitelist Directory ({accessList.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                Firestore collection: <code>accessControl/{'{email}'}</code>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Access Status</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Approved At</th>
                    <th className="py-3 px-4">Approved By</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {accessList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No approved emails found in access list. Whitelist an email above to grant access.
                      </td>
                    </tr>
                  ) : (
                    accessList.map((entry) => (
                      <tr key={entry.email} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          {entry.email}
                        </td>
                        <td className="py-3 px-4">
                          {entry.approved ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Revoked
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              entry.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {entry.role === 'admin' ? (
                              <Shield className="w-3 h-3 mr-1" />
                            ) : (
                              <Users className="w-3 h-3 mr-1" />
                            )}
                            {entry.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {entry.approvedAt
                            ? new Date(entry.approvedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 truncate max-w-[140px]" title={entry.approvedBy}>
                          {entry.approvedBy || 'System'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-[160px] truncate" title={entry.notes}>
                          {entry.notes || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {entry.approved ? (
                              <button
                                onClick={() => handleRevokeEmail(entry.email)}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center space-x-1"
                                title="Revoke access"
                              >
                                <UserX className="w-3 h-3" />
                                <span>Revoke</span>
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  api
                                    .approveEmail({ email: entry.email, role: entry.role })
                                    .then(() => loadData())
                                }
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center space-x-1"
                                title="Restore access"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Re-approve</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteAccessEntry(entry.email)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete entry completely"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: ASSESSMENTS MANAGEMENT */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configured Assessments</h3>
              <p className="text-xs text-slate-500">Manage publication state, time limits, and negative marking rules</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportAssessmentsCsv}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                title="Export all configured assessments to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                {assessmentsList.length} total
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessmentsList.map(cfg => (
              <div
                key={cfg.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {cfg.category} • {cfg.domain}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cfg.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cfg.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cfg.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{cfg.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{cfg.description}</p>

                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-medium">
                    <div>{cfg.durationMinutes} mins</div>
                    <div>{cfg.questionCount} Qs</div>
                    <div>{cfg.maxMarks} Marks</div>
                  </div>

                  <div className="text-[10px] text-slate-500 space-x-2">
                    <span>Negative: {cfg.negativeMarking * 100}%</span>
                    <span>•</span>
                    <span>Max Attempts: {cfg.maxAttempts}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <button
                    onClick={() => handleOpenEditConfig(cfg)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-50 flex items-center space-x-1"
                    title="Edit Assessment"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDuplicateConfig(cfg.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-50 flex items-center space-x-1"
                    title="Duplicate Assessment"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Clone</span>
                  </button>

                  <a
                    href={`/api/admin/assessments/${cfg.id}/report`}
                    download
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-50 flex items-center space-x-1"
                    title="Export CSV Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </a>

                  <button
                    onClick={() => handleArchiveConfig(cfg.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Archive Assessment"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: METRICS & ANALYTICS */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Students</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">{stats.activeUsers} active onboarded</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase">Attempts Completed</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalAssessments}</p>
              <span className="text-[10px] text-slate-500 font-semibold">Across all domains</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase">Cohort Average</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{stats.averageScore}%</p>
              <span className="text-[10px] text-slate-500">Benchmark pass line: 50%</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase">Question Bank</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalQuestions}</p>
              <span className="text-[10px] text-amber-600">{stats.flaggedQuestionsCount} flagged for review</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUESTION BANK */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Filter Skill:</span>
              <select
                value={selectedSkillFilter}
                onChange={e => setSelectedSkillFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white"
              >
                <option value="All">All Domains</option>
                {skills.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Questions via JSON</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredQuestions.slice(0, 30).map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-indigo-600 uppercase text-[10px]">{q.skillId}</span>
                    <span>•</span>
                    <span className="text-slate-500 font-medium">{q.topicName}</span>
                    <LevelBadge level={q.difficulty} size="sm" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{q.question}</p>
                  <p className="text-slate-500 text-[11px]">{q.explanation}</p>
                </div>

                <button
                  onClick={() => handleToggleFlag(q.id, q.isFlagged)}
                  className={`p-2 rounded-lg ${
                    q.isFlagged ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={q.isFlagged ? 'Unflag Question' : 'Flag Question'}
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUBMISSIONS REVIEW */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Examination Submissions</h3>
              <span className="text-xs text-slate-500">{attemptsList.length} total attempts</span>
            </div>
            <button
              onClick={handleExportSubmissionsCsv}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Export all student attempts to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Submissions CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Assessment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Time Spent</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attemptsList.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{a.userName}</div>
                      <div className="text-[10px] text-slate-400">{a.userEmail}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{a.assessmentTitle}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'evaluated'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{a.score !== undefined ? `${a.score}%` : '—'}</td>
                    <td className="p-3">{a.accuracy !== undefined ? `${a.accuracy}%` : '—'}</td>
                    <td className="p-3">{Math.round((a.timeSpentSeconds || 0) / 60)} mins</td>
                    <td className="p-3 text-[10px] text-slate-400">
                      {new Date(a.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit-logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Administrative Audit Logs</h3>
            <span className="text-xs text-slate-500">Security & Operational Tracking</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No audit events recorded yet.</div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-indigo-700">{log.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-medium">{log.targetType}: {log.targetId}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.details}</p>
                    <span className="text-[10px] text-slate-400">By: {log.adminEmail}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: AI QUESTION GENERATOR */}
      {activeTab === 'ai-generator' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 max-w-2xl">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Generate Adaptive Questions with Gemini AI</span>
          </h3>

          <form onSubmit={handleGenerateAIQuestion} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Skill:</label>
              <input
                type="text"
                value={genSkill}
                onChange={e => setGenSkill(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Topic Name:</label>
              <input
                type="text"
                value={genTopic}
                onChange={e => setGenTopic(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Difficulty:</label>
                <select
                  value={genDifficulty}
                  onChange={e => setGenDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Type:</label>
                <select
                  value={genType}
                  onChange={e => setGenType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="MCQ">Standard MCQ</option>
                  <option value="CodeOutput">Code Output Prediction</option>
                  <option value="Debugging">Code Debugging</option>
                  <option value="Conceptual">Conceptual Architectural</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              {isGenerating ? 'Synthesizing with Gemini...' : 'Generate and Add to Bank'}
            </button>
          </form>

          {generatedPreview && (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-2">
              <span className="font-bold text-purple-900">Generated Question Preview:</span>
              <p className="font-bold text-slate-900">{generatedPreview.question}</p>
              {generatedPreview.codeSnippet && (
                <pre className="p-2 bg-slate-900 text-purple-200 rounded text-[11px]">
                  {generatedPreview.codeSnippet}
                </pre>
              )}
              <p className="text-slate-600">{generatedPreview.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: ENROLLED STUDENTS & FACULTY MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Enrolled Students & Faculty Directory</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage student profiles, update Gmail IDs in real-time, and grant instantaneous whitelist access.
              </p>
            </div>

            <button
              id="admin-enroll-user-btn"
              onClick={handleOpenAddUser}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll / Add Student</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {usersList.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No users currently enrolled. Click "Enroll / Add Student" above to add a student or faculty member.
              </div>
            ) : (
              usersList.map((u) => {
                const isApproved = accessList.some(
                  (a) => a.email.toLowerCase() === (u.email || '').toLowerCase() && a.approved
                );

                return (
                  <div key={u.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                        {isApproved ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved Whitelist</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Pending Whitelist</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                        <span className="font-mono text-slate-700 font-medium flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.email}</span>
                        </span>
                        <span>•</span>
                        <span>{u.department || 'Computer Science & Engineering'}</span>
                        <span>•</span>
                        <span>{u.college || 'Bannari Amman Institute of Technology'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-lg">
                        {u.xp || 0} XP
                      </span>

                      {!isApproved && (
                        <button
                          onClick={() => handleQuickApproveUser(u)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
                          title="Instantly whitelist this student's Gmail ID for platform access"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve Access</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEditUser(u)}
                        className="p-1.5 px-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center space-x-1 transition-colors"
                        title="Edit student profile or update Gmail ID"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT ASSESSMENT MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingConfigId ? 'Edit Assessment Configuration' : 'Create Standardized Assessment'}
            </h3>

            <form onSubmit={handleSaveAssessmentConfig} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={configForm.title || ''}
                  onChange={e => setConfigForm({ ...configForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="e.g. DBMS Normalization & Transactions Exam"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={configForm.description || ''}
                  onChange={e => setConfigForm({ ...configForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={configForm.category}
                    onChange={e => setConfigForm({ ...configForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Technical">Technical</option>
                    <option value="Placement">Placement</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Domain</label>
                  <input
                    type="text"
                    value={configForm.domain || ''}
                    onChange={e => setConfigForm({ ...configForm, domain: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                    placeholder="e.g. Java, DBMS, Quant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={configForm.durationMinutes || 30}
                    onChange={e => setConfigForm({ ...configForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Questions</label>
                  <input
                    type="number"
                    min="1"
                    value={configForm.questionCount || 8}
                    onChange={e => setConfigForm({ ...configForm, questionCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    min="10"
                    value={configForm.maxMarks || 40}
                    onChange={e => setConfigForm({ ...configForm, maxMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Negative Marking Penalty</label>
                  <select
                    value={configForm.negativeMarking}
                    onChange={e => setConfigForm({ ...configForm, negativeMarking: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="0">0% (None)</option>
                    <option value="0.25">-25% (0.25x marks)</option>
                    <option value="0.33">-33% (0.33x marks)</option>
                    <option value="0.5">-50% (0.5x marks)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={configForm.status}
                    onChange={e => setConfigForm({ ...configForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="published">Published & Available</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT QUESTIONS MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              Bulk Import Questions via JSON
            </h3>
            <p className="text-xs text-slate-500">
              Paste an array of validated questions. Each object must contain `question`, `skillId`, `options` array, and `correctAnswerId`.
            </p>

            <form onSubmit={handleImportQuestions} className="space-y-3">
              <textarea
                rows={10}
                required
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                placeholder='[{"question": "What is...", "skillId": "python", "options": [{"id": "opt1", "text": "A"}], "correctAnswerId": "opt1", "explanation": "..."}]'
                className="w-full p-3 font-mono text-xs border rounded-xl"
              />

              {importFeedback && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 rounded-xl">
                  {importFeedback}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Validate & Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL / EDIT USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>{editingUserId ? 'Edit Student / Faculty Profile' : 'Enroll Student / Faculty Member'}</span>
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Changes to email or whitelist approval take effect in real-time across the platform and Firestore.
            </p>

            {userModalFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                  userModalFeedback.startsWith('Error')
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}
              >
                {userModalFeedback.startsWith('Error') ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                <span>{userModalFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gmail ID / Institutional Email Address *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="e.g. student@gmail.com or student@bitsathy.ac.in"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="student">Student (Learner)</option>
                    <option value="admin">Administrator / Faculty</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Year of Study</label>
                  <input
                    type="text"
                    value={userForm.yearOfStudy}
                    onChange={(e) => setUserForm({ ...userForm, yearOfStudy: e.target.value })}
                    placeholder="e.g. 3rd Year"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution / College</label>
                <input
                  type="text"
                  value={userForm.college}
                  onChange={(e) => setUserForm({ ...userForm, college: e.target.value })}
                  placeholder="e.g. Bannari Amman Institute of Technology"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userForm.approveNow}
                    onChange={(e) => setUserForm({ ...userForm, approveNow: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Whitelist and grant immediate real-time login access for this Gmail ID</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingUserId ? 'Save Changes' : 'Enroll & Whitelist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVE EMAIL ID MODAL */}
      {showAccessApprovalModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-email-modal-title"
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="approve-email-modal-title" className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  Approve Email ID
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Add an approved email address and grant access to the learning portal.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close approval dialog"
                onClick={() => setShowAccessApprovalModal(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {accessActionFeedback?.startsWith('Error') && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {accessActionFeedback}
              </div>
            )}

            <form onSubmit={handleApproveEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="approval-modal-email-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gmail ID / Institutional Email Address *
                </label>
                <input
                  id="approval-modal-email-input"
                  type="email"
                  required
                  autoFocus
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="approval-modal-role-select" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Access Role
                  </label>
                  <select
                    id="approval-modal-role-select"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as 'user' | 'admin')}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-sm"
                  >
                    <option value="user">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="approval-modal-notes-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Notes (optional)
                  </label>
                  <input
                    id="approval-modal-notes-input"
                    type="text"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="Department / year"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAccessApprovalModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  id="submit-approval-modal-btn"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Approve Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
