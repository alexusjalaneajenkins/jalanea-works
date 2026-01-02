/**
 * Application Answers Component
 *
 * Allows users to save their answers to common job application questions.
 * These answers get auto-filled when applying to jobs.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { haptics } from '../../utils/haptics';

// Common application questions
const COMMON_QUESTIONS = [
  { id: 'why_company', label: 'Why do you want to work here?', category: 'motivation' },
  { id: 'why_role', label: 'Why are you interested in this role?', category: 'motivation' },
  { id: 'strengths', label: 'What are your greatest strengths?', category: 'skills' },
  { id: 'weaknesses', label: 'What are your weaknesses?', category: 'skills' },
  { id: 'experience', label: 'Describe your relevant experience', category: 'experience' },
  { id: 'achievement', label: 'What is your greatest achievement?', category: 'experience' },
  { id: 'challenge', label: 'Describe a challenge you overcame', category: 'experience' },
  { id: 'teamwork', label: 'Tell us about a time you worked in a team', category: 'behavioral' },
  { id: 'conflict', label: 'How do you handle conflict?', category: 'behavioral' },
  { id: 'leadership', label: 'Describe a time you showed leadership', category: 'behavioral' },
  { id: 'salary', label: 'What are your salary expectations?', category: 'logistics' },
  { id: 'start_date', label: 'When can you start?', category: 'logistics' },
  { id: 'relocation', label: 'Are you willing to relocate?', category: 'logistics' },
  { id: 'sponsorship', label: 'Do you require sponsorship?', category: 'logistics' },
  { id: 'authorized', label: 'Are you authorized to work in the US?', category: 'logistics' },
];

interface SavedAnswer {
  questionId: string;
  customQuestion?: string;
  answer: string;
  lastUpdated: string;
}

interface ApplicationAnswersProps {
  onBack?: () => void;
  compact?: boolean; // For embedding in other views
}

export const ApplicationAnswers: React.FC<ApplicationAnswersProps> = ({
  onBack,
  compact = false
}) => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('motivation');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load saved answers from user profile
  useEffect(() => {
    if (userProfile?.applicationAnswers) {
      setAnswers(userProfile.applicationAnswers);
    }
  }, [userProfile]);

  const saveAnswers = async (newAnswers: SavedAnswer[]) => {
    if (!currentUser?.uid) return;

    setSaving(true);
    try {
      await updateUserProfile({ applicationAnswers: newAnswers });
      setAnswers(newAnswers);
      haptics.success();
    } catch (err) {
      console.error('Failed to save answers:', err);
      haptics.error();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnswer = async (questionId: string, answer: string, customQuestion?: string) => {
    const existing = answers.find(a => a.questionId === questionId);
    let newAnswers: SavedAnswer[];

    if (existing) {
      newAnswers = answers.map(a =>
        a.questionId === questionId
          ? { ...a, answer, lastUpdated: new Date().toISOString() }
          : a
      );
    } else {
      newAnswers = [...answers, {
        questionId,
        customQuestion,
        answer,
        lastUpdated: new Date().toISOString()
      }];
    }

    await saveAnswers(newAnswers);
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteAnswer = async (questionId: string) => {
    haptics.medium();
    const newAnswers = answers.filter(a => a.questionId !== questionId);
    await saveAnswers(newAnswers);
  };

  const handleAddCustom = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const customId = `custom_${Date.now()}`;
    await handleSaveAnswer(customId, newAnswer.trim(), newQuestion.trim());
    setNewQuestion('');
    setNewAnswer('');
    setShowAddNew(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    haptics.light();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAnswerForQuestion = (questionId: string) => {
    return answers.find(a => a.questionId === questionId);
  };

  const categories = [
    { id: 'motivation', label: 'Motivation', icon: '💡' },
    { id: 'skills', label: 'Skills', icon: '💪' },
    { id: 'experience', label: 'Experience', icon: '📋' },
    { id: 'behavioral', label: 'Behavioral', icon: '🤝' },
    { id: 'logistics', label: 'Logistics', icon: '📍' },
  ];

  const glassPanel = isLight
    ? 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg'
    : 'bg-slate-800/50 backdrop-blur-xl border border-white/10';

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm ${
    isLight
      ? 'bg-slate-100 text-slate-900 placeholder-slate-400'
      : 'bg-slate-700/50 text-white placeholder-slate-400'
  } focus:outline-none focus:ring-2 focus:ring-gold/50`;

  // Get custom answers
  const customAnswers = answers.filter(a => a.questionId.startsWith('custom_'));

  return (
    <div className={compact ? '' : 'flex-1 overflow-y-auto px-4 py-4 pb-24'}>
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Saved Answers
            </h2>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Pre-fill your job applications
            </p>
          </div>
          <button
            onClick={() => { haptics.light(); setShowAddNew(true); }}
            className="p-2.5 rounded-xl bg-gold text-black active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className={`p-4 rounded-2xl mb-4 ${glassPanel}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <MessageSquare size={20} className="text-gold" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {answers.length}
              </p>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                answers saved
              </p>
            </div>
          </div>
          {saving && (
            <div className="text-gold text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          )}
        </div>
      </div>

      {/* Add New Question Modal */}
      <AnimatePresence>
        {showAddNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowAddNew(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md p-5 rounded-2xl ${glassPanel}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Add Custom Answer
                </h3>
                <button
                  onClick={() => setShowAddNew(false)}
                  className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X size={20} className={isLight ? 'text-slate-600' : 'text-slate-400'} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium mb-1.5 block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Question
                  </label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder="e.g., Why should we hire you?"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`text-sm font-medium mb-1.5 block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Your Answer
                  </label>
                  <textarea
                    value={newAnswer}
                    onChange={e => setNewAnswer(e.target.value)}
                    placeholder="Write your answer..."
                    rows={5}
                    className={inputClass}
                  />
                </div>

                <button
                  onClick={handleAddCustom}
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                  className="w-full py-3 rounded-xl bg-gold text-black font-semibold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Answer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map(category => {
          const categoryQuestions = COMMON_QUESTIONS.filter(q => q.category === category.id);
          const answeredCount = categoryQuestions.filter(q => getAnswerForQuestion(q.id)).length;
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className={`rounded-2xl overflow-hidden ${glassPanel}`}>
              <button
                onClick={() => {
                  haptics.light();
                  setExpandedCategory(isExpanded ? null : category.id);
                }}
                className="w-full p-4 flex items-center justify-between min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  <div className="text-left">
                    <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {category.label}
                    </p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {answeredCount}/{categoryQuestions.length} answered
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {answeredCount > 0 && (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                  {isExpanded ? (
                    <ChevronUp size={20} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                  ) : (
                    <ChevronDown size={20} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`px-4 pb-4 space-y-3 border-t ${isLight ? 'border-slate-200/50' : 'border-white/5'}`}>
                      {categoryQuestions.map(question => {
                        const saved = getAnswerForQuestion(question.id);
                        const isEditing = editingId === question.id;

                        return (
                          <div
                            key={question.id}
                            className={`p-3 rounded-xl mt-3 ${
                              isLight ? 'bg-slate-100/50' : 'bg-slate-700/30'
                            }`}
                          >
                            <p className={`text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              {question.label}
                            </p>

                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editText}
                                  onChange={e => setEditText(e.target.value)}
                                  rows={4}
                                  className={inputClass}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveAnswer(question.id, editText)}
                                    className="flex-1 py-2 rounded-lg bg-gold text-black text-sm font-medium flex items-center justify-center gap-1"
                                  >
                                    <Save size={14} />
                                    Save
                                  </button>
                                  <button
                                    onClick={() => { setEditingId(null); setEditText(''); }}
                                    className={`px-4 py-2 rounded-lg text-sm ${
                                      isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-600 text-slate-200'
                                    }`}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : saved ? (
                              <div>
                                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'} line-clamp-3`}>
                                  {saved.answer}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => { setEditingId(question.id); setEditText(saved.answer); haptics.light(); }}
                                    className={`p-2 rounded-lg min-w-[44px] min-h-[36px] flex items-center justify-center ${
                                      isLight ? 'bg-slate-200/50 hover:bg-slate-200' : 'bg-slate-600/50 hover:bg-slate-600'
                                    }`}
                                  >
                                    <Edit3 size={14} className={isLight ? 'text-slate-600' : 'text-slate-300'} />
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(saved.answer, question.id)}
                                    className={`p-2 rounded-lg min-w-[44px] min-h-[36px] flex items-center justify-center ${
                                      isLight ? 'bg-slate-200/50 hover:bg-slate-200' : 'bg-slate-600/50 hover:bg-slate-600'
                                    }`}
                                  >
                                    {copiedId === question.id ? (
                                      <Check size={14} className="text-green-500" />
                                    ) : (
                                      <Copy size={14} className={isLight ? 'text-slate-600' : 'text-slate-300'} />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnswer(question.id)}
                                    className={`p-2 rounded-lg min-w-[44px] min-h-[36px] flex items-center justify-center ${
                                      isLight ? 'bg-red-100 hover:bg-red-200' : 'bg-red-900/30 hover:bg-red-900/50'
                                    }`}
                                  >
                                    <Trash2 size={14} className="text-red-500" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingId(question.id); setEditText(''); haptics.light(); }}
                                className={`w-full py-2.5 rounded-lg text-sm font-medium border-2 border-dashed min-h-[44px] ${
                                  isLight
                                    ? 'border-slate-300 text-slate-500 hover:border-gold hover:text-gold'
                                    : 'border-slate-600 text-slate-400 hover:border-gold hover:text-gold'
                                }`}
                              >
                                + Add your answer
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Custom Answers Section */}
        {customAnswers.length > 0 && (
          <div className={`rounded-2xl overflow-hidden ${glassPanel}`}>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">✏️</span>
                <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Custom Answers ({customAnswers.length})
                </p>
              </div>
              <div className="space-y-3">
                {customAnswers.map(answer => (
                  <div
                    key={answer.questionId}
                    className={`p-3 rounded-xl ${isLight ? 'bg-slate-100/50' : 'bg-slate-700/30'}`}
                  >
                    <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {answer.customQuestion}
                    </p>
                    <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'} line-clamp-2`}>
                      {answer.answer}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => copyToClipboard(answer.answer, answer.questionId)}
                        className={`p-2 rounded-lg min-w-[44px] min-h-[36px] flex items-center justify-center ${
                          isLight ? 'bg-slate-200/50' : 'bg-slate-600/50'
                        }`}
                      >
                        {copiedId === answer.questionId ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} className={isLight ? 'text-slate-600' : 'text-slate-300'} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAnswer(answer.questionId)}
                        className={`p-2 rounded-lg min-w-[44px] min-h-[36px] flex items-center justify-center ${
                          isLight ? 'bg-red-100' : 'bg-red-900/30'
                        }`}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationAnswers;
