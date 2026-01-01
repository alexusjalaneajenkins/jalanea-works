import React, { useState } from 'react';
import {
    X, Linkedin, Copy, Check, Sparkles, RefreshCw,
    GraduationCap, Briefcase, Award, Lightbulb, Users,
    Rocket, MessageSquare, Heart
} from 'lucide-react';
import { Button } from './Button';

interface SocialPostAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile?: {
        fullName?: string;
        education?: Array<{ school: string; degree: string; graduationDate: string }>;
        experience?: Array<{ title: string; company: string }>;
    };
}

type PostType = 'graduation' | 'new-job' | 'promotion' | 'learning' | 'networking' | 'milestone' | 'insight' | 'gratitude';
type PostTone = 'professional' | 'conversational' | 'inspiring' | 'humble';

interface PostTemplate {
    type: PostType;
    icon: React.FC<{ size?: number; className?: string }>;
    label: string;
    description: string;
    color: string;
}

const POST_TYPES: PostTemplate[] = [
    { type: 'graduation', icon: GraduationCap, label: 'Graduation', description: 'Celebrate completing your degree', color: 'bg-purple-500' },
    { type: 'new-job', icon: Briefcase, label: 'New Job', description: 'Announce starting a new position', color: 'bg-blue-500' },
    { type: 'promotion', icon: Rocket, label: 'Promotion', description: 'Share your career advancement', color: 'bg-green-500' },
    { type: 'learning', icon: Lightbulb, label: 'Learning', description: 'Share skills or certifications', color: 'bg-amber-500' },
    { type: 'networking', icon: Users, label: 'Networking', description: 'Connect with your industry', color: 'bg-pink-500' },
    { type: 'milestone', icon: Award, label: 'Milestone', description: 'Celebrate work achievements', color: 'bg-cyan-500' },
    { type: 'insight', icon: MessageSquare, label: 'Industry Insight', description: 'Share professional knowledge', color: 'bg-indigo-500' },
    { type: 'gratitude', icon: Heart, label: 'Gratitude', description: 'Thank mentors or colleagues', color: 'bg-red-500' },
];

const TONES: { value: PostTone; label: string; description: string }[] = [
    { value: 'professional', label: 'Professional', description: 'Formal and polished' },
    { value: 'conversational', label: 'Conversational', description: 'Friendly and relatable' },
    { value: 'inspiring', label: 'Inspiring', description: 'Motivational and uplifting' },
    { value: 'humble', label: 'Humble', description: 'Modest and grateful' },
];

// Post generation templates
const generatePost = (
    type: PostType,
    tone: PostTone,
    context: string,
    userName?: string
): string => {
    const name = userName?.split(' ')[0] || 'I';

    const templates: Record<PostType, Record<PostTone, string>> = {
        'graduation': {
            professional: `I'm thrilled to announce that I have officially graduated with my degree! ${context ? `\n\n${context}` : ''}\n\nThis achievement represents years of dedication, late nights, and perseverance. I'm grateful for the professors, classmates, and mentors who supported me along the way.\n\nExcited for what's next! Open to connecting with professionals in my field.\n\n#Graduation #NewBeginnings #ClassOf2024 #CareerReady`,
            conversational: `OFFICIALLY A GRADUATE! 🎓\n\n${context ? `${context}\n\n` : ''}Can't believe this day is finally here. From wondering if I'd make it to holding that diploma - what a journey!\n\nTo everyone who believed in me, helped me study, or just sent good vibes my way - THANK YOU!\n\nNow... who's hiring? 😄\n\n#GraduationDay #MadeIt #NextChapter`,
            inspiring: `Today marks the beginning of a new chapter. 🎓\n\n${context ? `${context}\n\n` : ''}To everyone still grinding through classes, pulling all-nighters, wondering if it's worth it - IT IS. Keep going.\n\nYour degree is proof that you can commit to something hard and see it through. That's a skill that will take you far.\n\nOnward and upward!\n\n#Graduation #DreamBig #NeverGiveUp`,
            humble: `Grateful beyond words. 🙏\n\n${context ? `${context}\n\n` : ''}I did it - but not alone. Every professor who challenged me, every classmate who studied with me, every family member who encouraged me.\n\nThis degree belongs to all of us.\n\nThank you for being part of my journey.\n\n#Blessed #Grateful #Graduation`,
        },
        'new-job': {
            professional: `I'm excited to announce that I've joined [COMPANY] as a [ROLE]!\n\n${context ? `${context}\n\n` : ''}I'm looking forward to contributing to the team and growing in this new opportunity. Thank you to everyone who has supported my career journey.\n\nHere's to new beginnings!\n\n#NewJob #Excited #CareerMove`,
            conversational: `BIG NEWS! 🎉\n\nI just accepted a position at [COMPANY] as a [ROLE]!\n\n${context ? `${context}\n\n` : ''}Can't wait to meet my new team and dive in. The job search wasn't easy, but persistence pays off!\n\nTo everyone still looking - keep going. Your opportunity is coming.\n\n#NewJob #Hired #LetsGo`,
            inspiring: `New chapter unlocked. 🚀\n\nI'm joining [COMPANY] as a [ROLE], and I couldn't be more excited about this opportunity.\n\n${context ? `${context}\n\n` : ''}A reminder that every "no" is just redirecting you to the right "yes." Keep believing in yourself.\n\n#NewBeginnings #CareerGrowth #BelieveInYourself`,
            humble: `With a grateful heart, I'm sharing that I've accepted a role at [COMPANY].\n\n${context ? `${context}\n\n` : ''}Thank you to everyone who referred me, gave advice, or simply cheered me on. This wouldn't have happened without your support.\n\nExcited and humbled for this opportunity.\n\n#Grateful #NewOpportunity #Thankful`,
        },
        'promotion': {
            professional: `I'm pleased to share that I've been promoted to [NEW ROLE] at [COMPANY].\n\n${context ? `${context}\n\n` : ''}This advancement reflects my commitment to excellence and the support of an incredible team. I'm excited to take on new challenges and continue driving results.\n\nThank you to my colleagues and mentors for believing in my potential.\n\n#Promotion #CareerGrowth #Leadership`,
            conversational: `Pinch me - I just got PROMOTED! 🙌\n\n${context ? `${context}\n\n` : ''}From [OLD ROLE] to [NEW ROLE]! Still processing but so grateful for this recognition.\n\nHere's to more challenges, more growth, and more opportunities to make an impact!\n\n#Promoted #Winning #GrowthMindset`,
            inspiring: `Proof that hard work gets noticed. ⭐\n\nJust promoted to [NEW ROLE]!\n\n${context ? `${context}\n\n` : ''}To everyone working hard and wondering if anyone sees it - they do. Keep showing up, keep delivering excellence.\n\nYour moment is coming.\n\n#Promotion #SuccessStory #KeepGoing`,
            humble: `Feeling incredibly blessed today. 🙏\n\nI've been promoted to [NEW ROLE], and I'm genuinely overwhelmed by this recognition.\n\n${context ? `${context}\n\n` : ''}None of this would be possible without my amazing team and mentors. This achievement belongs to all of us.\n\n#Grateful #TeamWork #Promotion`,
        },
        'learning': {
            professional: `I'm pleased to announce that I've completed [CERTIFICATION/COURSE/SKILL]!\n\n${context ? `${context}\n\n` : ''}Continuous learning is essential in today's rapidly evolving landscape. This new knowledge will help me better serve my team and clients.\n\nWhat are you learning this quarter?\n\n#ContinuousLearning #ProfessionalDevelopment #Growth`,
            conversational: `Just leveled up! 📚\n\nFinished [CERTIFICATION/COURSE] and feeling accomplished!\n\n${context ? `${context}\n\n` : ''}Learning never stops, right? What's everyone else working on these days?\n\n#NeverStopLearning #NewSkills #Growth`,
            inspiring: `Invest in yourself. Always. 💡\n\nJust completed [CERTIFICATION/COURSE/SKILL]!\n\n${context ? `${context}\n\n` : ''}The best investment you can make is in your own growth. Knowledge compounds over time.\n\nWhat skill are you developing this year?\n\n#LifelongLearner #GrowthMindset #InvestInYourself`,
            humble: `Small win, big growth. 📖\n\nJust earned [CERTIFICATION/COURSE].\n\n${context ? `${context}\n\n` : ''}So much more to learn, but grateful for this milestone. Thanks to everyone who encouraged me to take this step.\n\n#AlwaysLearning #Grateful #SmallWins`,
        },
        'networking': {
            professional: `I'm looking to connect with professionals in [INDUSTRY/FIELD].\n\n${context ? `${context}\n\n` : ''}As someone passionate about [TOPIC], I'm eager to learn from others' experiences and share insights.\n\nFeel free to connect or reach out – I'd love to hear about your journey.\n\n#Networking #OpenToConnect #IndustryProfessionals`,
            conversational: `Hey LinkedIn fam! 👋\n\nLooking to expand my network with people in [INDUSTRY/FIELD].\n\n${context ? `${context}\n\n` : ''}Drop a comment if you're working in this space – would love to connect and swap stories!\n\n#LetsConnect #Networking #CommunityBuilding`,
            inspiring: `Your network is your net worth. 🤝\n\nReaching out to connect with fellow professionals in [INDUSTRY/FIELD].\n\n${context ? `${context}\n\n` : ''}The best opportunities often come from the conversations we didn't expect to have.\n\nWho should I be talking to?\n\n#NetworkingMatters #OpenDoors #ConnectionsCount`,
            humble: `Would love your help! 🙏\n\nI'm trying to learn more about [INDUSTRY/FIELD] and would appreciate connecting with people who have experience in this area.\n\n${context ? `${context}\n\n` : ''}Any advice or introductions would mean the world to me.\n\n#HelpMeLearn #OpenToConnect #Grateful`,
        },
        'milestone': {
            professional: `Proud to share that I've achieved [MILESTONE] at [COMPANY]!\n\n${context ? `${context}\n\n` : ''}This accomplishment reflects our team's dedication and strategic focus. I'm grateful for the opportunity to contribute to our collective success.\n\n#WorkMilestone #TeamSuccess #Achievement`,
            conversational: `Milestone alert! 🎯\n\nJust hit [MILESTONE] and had to share!\n\n${context ? `${context}\n\n` : ''}Couldn't have done it without my amazing team. Time to celebrate (and then get back to work 😄)!\n\n#Milestone #TeamWin #Celebrating`,
            inspiring: `Set the goal. Do the work. Celebrate the win. 🏆\n\nJust reached [MILESTONE]!\n\n${context ? `${context}\n\n` : ''}Every big achievement starts with believing it's possible. What milestone are you working toward?\n\n#GoalSetting #AchieveGreatness #DreamBig`,
            humble: `A moment of gratitude. ✨\n\nReached [MILESTONE] this week, and I'm taking a moment to appreciate how far we've come.\n\n${context ? `${context}\n\n` : ''}None of this happens alone. Thank you to everyone who made this possible.\n\n#Grateful #TeamEffort #Milestone`,
        },
        'insight': {
            professional: `Key insight from my experience in [INDUSTRY/TOPIC]:\n\n${context || '[Share your professional insight here]'}\n\nWhat's been your experience? Would love to hear different perspectives.\n\n#IndustryInsights #ProfessionalDevelopment #ThoughtLeadership`,
            conversational: `Quick thought on [TOPIC]:\n\n${context || '[Share your insight here]'}\n\nAnyone else notice this? Let me know what you think in the comments!\n\n#JustMyThoughts #IndustryChat #LetsTalk`,
            inspiring: `Lesson learned: ${context || '[Share your insight here]'}\n\nHope this helps someone out there who's going through the same thing.\n\nWhat lessons have shaped your career journey?\n\n#WisdomWednesday #LessonsLearned #GrowthMindset`,
            humble: `Something I've been thinking about:\n\n${context || '[Share your insight here]'}\n\nStill learning, still growing. Would love to hear your thoughts on this.\n\n#AlwaysLearning #OpenToFeedback #Thoughts`,
        },
        'gratitude': {
            professional: `I want to take a moment to acknowledge [PERSON/TEAM/COMPANY] for their exceptional support.\n\n${context ? `${context}\n\n` : ''}Your guidance has been instrumental in my professional development. Grateful for mentors who invest in others' success.\n\n#Grateful #Mentorship #ThankYou`,
            conversational: `Shoutout time! 🙌\n\nHave to give a big THANK YOU to [PERSON/TEAM] for being amazing.\n\n${context ? `${context}\n\n` : ''}Seriously, couldn't have done it without you. Who's someone in your corner that deserves recognition?\n\n#Gratitude #Appreciation #ThankYou`,
            inspiring: `Behind every success is someone who believed in you first. 💛\n\nToday I'm grateful for [PERSON/TEAM/COMPANY].\n\n${context ? `${context}\n\n` : ''}Take a moment today to thank someone who's made a difference in your journey.\n\n#BeGrateful #PayItForward #ThankYou`,
            humble: `From the bottom of my heart... 🙏\n\nThank you to [PERSON/TEAM/COMPANY].\n\n${context ? `${context}\n\n` : ''}Words can't express how much your support has meant to me. I don't take it for granted.\n\n#TrulyGrateful #Blessed #ThankYou`,
        },
    };

    return templates[type][tone];
};

export const SocialPostAssistant: React.FC<SocialPostAssistantProps> = ({
    isOpen,
    onClose,
    userProfile
}) => {
    const [selectedType, setSelectedType] = useState<PostType | null>(null);
    const [selectedTone, setSelectedTone] = useState<PostTone>('conversational');
    const [context, setContext] = useState('');
    const [generatedPost, setGeneratedPost] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGeneratePost = () => {
        if (!selectedType) return;
        const post = generatePost(selectedType, selectedTone, context, userProfile?.fullName);
        setGeneratedPost(post);
    };

    const handleRegenerate = () => {
        // Cycle through tones for variety
        const toneIndex = TONES.findIndex(t => t.value === selectedTone);
        const nextTone = TONES[(toneIndex + 1) % TONES.length].value;
        setSelectedTone(nextTone);
        const post = generatePost(selectedType!, nextTone, context, userProfile?.fullName);
        setGeneratedPost(post);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedPost);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleReset = () => {
        setSelectedType(null);
        setContext('');
        setGeneratedPost('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Linkedin size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Social Post Assistant</h2>
                                <p className="text-blue-100 text-sm">Create engaging LinkedIn posts</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!generatedPost ? (
                        <>
                            {/* Step 1: Select Post Type */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-jalanea-700 uppercase tracking-wider mb-3">
                                    1. What are you sharing?
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {POST_TYPES.map(postType => (
                                        <button
                                            key={postType.type}
                                            onClick={() => setSelectedType(postType.type)}
                                            className={`p-3 rounded-xl border-2 transition-all text-left ${
                                                selectedType === postType.type
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-jalanea-200 hover:border-jalanea-300 bg-white'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 ${postType.color} rounded-lg flex items-center justify-center mb-2`}>
                                                <postType.icon size={16} className="text-white" />
                                            </div>
                                            <p className="font-semibold text-sm text-jalanea-900">{postType.label}</p>
                                            <p className="text-xs text-jalanea-500 line-clamp-1">{postType.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Select Tone */}
                            {selectedType && (
                                <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h3 className="text-sm font-bold text-jalanea-700 uppercase tracking-wider mb-3">
                                        2. Choose your tone
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {TONES.map(tone => (
                                            <button
                                                key={tone.value}
                                                onClick={() => setSelectedTone(tone.value)}
                                                className={`px-4 py-2 rounded-full border transition-all ${
                                                    selectedTone === tone.value
                                                        ? 'border-blue-500 bg-blue-500 text-white'
                                                        : 'border-jalanea-200 hover:border-blue-300 text-jalanea-700'
                                                }`}
                                            >
                                                <span className="font-medium">{tone.label}</span>
                                                <span className="text-xs ml-1 opacity-75">• {tone.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Add Context */}
                            {selectedType && (
                                <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h3 className="text-sm font-bold text-jalanea-700 uppercase tracking-wider mb-3">
                                        3. Add details (optional)
                                    </h3>
                                    <textarea
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                        placeholder="Add any specific details you want to include (company name, role title, what you learned, etc.)"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-jalanea-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                                    />
                                </div>
                            )}

                            {/* Generate Button */}
                            {selectedType && (
                                <Button
                                    variant="primary"
                                    className="w-full gap-2"
                                    onClick={handleGeneratePost}
                                >
                                    <Sparkles size={18} />
                                    Generate Post
                                </Button>
                            )}
                        </>
                    ) : (
                        /* Generated Post View */
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-jalanea-900">Your LinkedIn Post</h3>
                                <div className="flex items-center gap-2 text-xs text-jalanea-500">
                                    <span className="px-2 py-1 bg-jalanea-100 rounded-full">
                                        {TONES.find(t => t.value === selectedTone)?.label}
                                    </span>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-white border border-jalanea-200 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {userProfile?.fullName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{userProfile?.fullName || 'Your Name'}</p>
                                        <p className="text-xs text-jalanea-500">Just now • 🌐</p>
                                    </div>
                                </div>
                                <div className="whitespace-pre-wrap text-sm text-jalanea-700 leading-relaxed">
                                    {generatedPost}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="primary"
                                    onClick={handleCopy}
                                    className="flex-1 gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={18} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            Copy to Clipboard
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleRegenerate}
                                    className="gap-2"
                                >
                                    <RefreshCw size={16} />
                                    Regenerate
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleReset}
                                    className="gap-2"
                                >
                                    Start Over
                                </Button>
                            </div>

                            {/* Tips */}
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <h4 className="font-semibold text-blue-900 text-sm mb-2">Pro Tips:</h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• Replace [PLACEHOLDER] text with your specific details</li>
                                    <li>• Add a relevant image or document to boost engagement</li>
                                    <li>• Post between 8-10 AM or 12-1 PM for best visibility</li>
                                    <li>• Respond to comments within the first hour</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
