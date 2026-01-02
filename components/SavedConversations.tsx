import React, { useState, useMemo } from 'react';
import {
    X, MessageSquare, Search, Clock, Trash2,
    ChevronRight, Plus, FolderOpen, Tag, Filter
} from 'lucide-react';
import { Button } from './Button';
import { ChatMessage } from '../types';

interface ConversationThread {
    id: string;
    title: string;
    topic: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
    preview: string;
}

interface SavedConversationsProps {
    isOpen: boolean;
    onClose: () => void;
    threads: ConversationThread[];
    onLoadThread: (thread: ConversationThread) => void;
    onDeleteThread: (threadId: string) => void;
    onNewThread: () => void;
    currentThreadId?: string;
}

const TOPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'job-search': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'resume': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'interview': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'career-advice': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'networking': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    'skills': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    'general': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

const TOPIC_LABELS: Record<string, string> = {
    'job-search': 'Job Search',
    'resume': 'Resume',
    'interview': 'Interview Prep',
    'career-advice': 'Career Advice',
    'networking': 'Networking',
    'skills': 'Skills',
    'general': 'General',
};

export const SavedConversations: React.FC<SavedConversationsProps> = ({
    isOpen,
    onClose,
    threads,
    onLoadThread,
    onDeleteThread,
    onNewThread,
    currentThreadId
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTopic, setFilterTopic] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

    // Filter and sort threads
    const filteredThreads = useMemo(() => {
        let result = [...threads];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(thread =>
                thread.title.toLowerCase().includes(query) ||
                thread.preview.toLowerCase().includes(query) ||
                thread.messages.some(msg => msg.text.toLowerCase().includes(query))
            );
        }

        // Filter by topic
        if (filterTopic !== 'all') {
            result = result.filter(thread => thread.topic === filterTopic);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'recent') {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
            return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        });

        return result;
    }, [threads, searchQuery, filterTopic, sortBy]);

    // Get unique topics from threads
    const availableTopics = useMemo(() => {
        const topics = new Set(threads.map(t => t.topic));
        return Array.from(topics);
    }, [threads]);

    const formatDate = (date: Date) => {
        const now = new Date();
        const threadDate = new Date(date);
        const diffMs = now.getTime() - threadDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return threadDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getTopicStyle = (topic: string) => {
        return TOPIC_COLORS[topic] || TOPIC_COLORS.general;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-jalanea-900 to-jalanea-800 text-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <FolderOpen size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Saved Conversations</h2>
                                <p className="text-jalanea-300 text-sm">
                                    {threads.length} conversation{threads.length !== 1 ? 's' : ''} saved
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-jalanea-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-jalanea-400 focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-3 border-b border-jalanea-100 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-jalanea-500">
                        <Filter size={14} />
                        <span>Filter:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterTopic('all')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                filterTopic === 'all'
                                    ? 'bg-jalanea-900 text-white'
                                    : 'bg-jalanea-100 text-jalanea-600 hover:bg-jalanea-200'
                            }`}
                        >
                            All
                        </button>
                        {availableTopics.map(topic => {
                            const style = getTopicStyle(topic);
                            return (
                                <button
                                    key={topic}
                                    onClick={() => setFilterTopic(topic)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        filterTopic === topic
                                            ? 'bg-jalanea-900 text-white'
                                            : `${style.bg} ${style.text} hover:opacity-80`
                                    }`}
                                >
                                    {TOPIC_LABELS[topic] || topic}
                                </button>
                            );
                        })}
                    </div>
                    <div className="ml-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest')}
                            className="text-xs px-2 py-1 border border-jalanea-200 rounded-lg text-jalanea-600 focus:outline-none focus:ring-1 focus:ring-gold"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Thread List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredThreads.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-jalanea-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="text-jalanea-400" size={28} />
                            </div>
                            <p className="text-jalanea-600 font-medium mb-2">
                                {searchQuery || filterTopic !== 'all'
                                    ? 'No conversations match your search'
                                    : 'No saved conversations yet'
                                }
                            </p>
                            <p className="text-sm text-jalanea-400 mb-4">
                                {searchQuery || filterTopic !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Start a new conversation to save it here'
                                }
                            </p>
                            {!searchQuery && filterTopic === 'all' && (
                                <Button variant="primary" size="sm" onClick={onNewThread}>
                                    <Plus size={16} className="mr-1" />
                                    New Conversation
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredThreads.map(thread => {
                                const topicStyle = getTopicStyle(thread.topic);
                                const isActive = thread.id === currentThreadId;

                                return (
                                    <div
                                        key={thread.id}
                                        className={`group relative bg-white border rounded-xl p-4 transition-all cursor-pointer hover:shadow-md ${
                                            isActive
                                                ? 'border-gold bg-gold/5 ring-1 ring-gold'
                                                : 'border-jalanea-200 hover:border-jalanea-300'
                                        }`}
                                        onClick={() => onLoadThread(thread)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-jalanea-900 truncate">
                                                        {thread.title}
                                                    </h3>
                                                    {isActive && (
                                                        <span className="text-[10px] font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                                                            ACTIVE
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-jalanea-500 line-clamp-2 mb-2">
                                                    {thread.preview}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-jalanea-400">
                                                    <span className={`px-2 py-0.5 rounded-full ${topicStyle.bg} ${topicStyle.text}`}>
                                                        <Tag size={10} className="inline mr-1" />
                                                        {TOPIC_LABELS[thread.topic] || thread.topic}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {formatDate(thread.updatedAt)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare size={12} />
                                                        {thread.messages.length} messages
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Delete this conversation? This cannot be undone.')) {
                                                            onDeleteThread(thread.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-jalanea-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <ChevronRight size={18} className="text-jalanea-300 group-hover:text-gold transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-jalanea-100 p-4 bg-jalanea-50">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-jalanea-400">
                            Conversations are auto-saved when you close the chat
                        </p>
                        <Button variant="primary" size="sm" onClick={onNewThread}>
                            <Plus size={14} className="mr-1" />
                            New Conversation
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
