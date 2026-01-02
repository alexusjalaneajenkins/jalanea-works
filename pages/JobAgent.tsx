import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Bot, Play, Pause, Square, CheckCircle, AlertCircle,
  ExternalLink, Briefcase, Loader, Wifi, WifiOff,
  Zap, Sparkles, ArrowRight, RefreshCw, Settings,
  HelpCircle, X, ChevronDown, ChevronUp, Info
} from 'lucide-react';

// Cloud Agent API URL
const AGENT_API_URL = 'http://localhost:3001';

// Job site configurations matching cloud-agent
const JOB_SITES = [
  { id: 'indeed', name: 'Indeed', icon: '💼', color: '#2164f3', description: 'Easy Apply jobs', hint: 'Best for quick applications' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💎', color: '#0a66c2', description: 'Professional network', hint: 'Requires LinkedIn account' },
  { id: 'ziprecruiter', name: 'ZipRecruiter', icon: '🎯', color: '#5ba829', description: '1-Click Apply', hint: 'Fast one-click applications' },
  { id: 'glassdoor', name: 'Glassdoor', icon: '🚪', color: '#0caa41', description: 'Company reviews', hint: 'See salaries & reviews' },
];

// Help content for users
const HELP_STEPS = [
  {
    step: 1,
    title: 'Choose a Job Site',
    description: 'Click on any job site button (Indeed, LinkedIn, etc.) to open a browser window for that site.',
    tip: 'The browser will open automatically - just wait a moment!'
  },
  {
    step: 2,
    title: 'Log In to the Site',
    description: 'Sign in with your existing account credentials in the browser window that opens. The agent will detect when you\'re logged in.',
    tip: 'Use your regular login - the agent saves your session for future use.'
  },
  {
    step: 3,
    title: 'Enter Job Search Details',
    description: 'Once logged in, a search form will appear. Enter the job title and location you\'re looking for.',
    tip: 'Your profile info is pre-filled if you\'ve set it up in Settings.'
  },
  {
    step: 4,
    title: 'Start the Agent',
    description: 'Click "Start Agent" to begin automated job searching. The agent will navigate to search results and can apply to jobs for you.',
    tip: 'Watch the Activity Log to see what the agent is doing in real-time.'
  }
];

const TROUBLESHOOTING = [
  {
    issue: 'Agent shows "Offline"',
    solution: 'Make sure the cloud agent server is running. Open a terminal in the cloud-agent folder and run: npm run dev'
  },
  {
    issue: 'Browser doesn\'t open',
    solution: 'The agent may still be starting up. Wait a few seconds and try again. Check if another browser instance is already open.'
  },
  {
    issue: 'Login not detected',
    solution: 'Make sure you\'re fully logged in (not just on the login page). Navigate to the main dashboard of the site to confirm.'
  },
  {
    issue: 'Agent seems stuck',
    solution: 'Click "Stop" to reset the agent, then try starting your search again. Some sites may have CAPTCHAs that need manual completion.'
  },
  {
    issue: 'Browser crashes',
    solution: 'This can happen on newer macOS versions. Try closing all browser windows and restarting the agent server.'
  }
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.03 } }
};

interface AgentStatus {
  status: 'idle' | 'running' | 'paused' | 'error';
  currentTask: string | null;
  actionsPerformed: number;
  lastAction: string | null;
}

interface SiteStatus {
  siteId: string;
  isLoggedIn: boolean;
  isLaunching: boolean;
  message: string;
}

// Build comprehensive profile context for job search from onboarding data
interface ProfileContext {
  // Search criteria
  jobTitle: string;
  location: string;

  // Skills & qualifications
  skills: {
    technical: string[];
    design: string[];
    soft: string[];
  };
  education: any[];

  // Work preferences
  salaryMin: number | null;
  salaryMax: number | null;
  availability: string | null;
  selectedDays: string[];
  shiftPreference: string[];

  // Commute & transport
  commuteTolerance: string | null;
  transport: string[];
  commuteCoords: string | null;

  // Personal circumstances (for finding accommodating employers)
  realityChallenges: string[];
  realityContext: string | null;

  // Profile links
  linkedinUrl: string | null;
  portfolioUrl: string | null;
}

const buildProfileContext = (userProfile: any): Partial<ProfileContext> => {
  if (!userProfile) return {};

  return {
    // Skills from onboarding Stage 2
    skills: userProfile.skills || { technical: [], design: [], soft: [] },
    education: userProfile.credentials || userProfile.education || [],

    // Salary from Stage 4
    salaryMin: userProfile.salaryMin || userProfile.targetSalaryRange?.min || null,
    salaryMax: userProfile.salaryMax || userProfile.targetSalaryRange?.max || null,

    // Availability from Stage 3
    availability: userProfile.availability || userProfile.logistics?.availability || null,
    selectedDays: userProfile.selectedDays || userProfile.logistics?.selectedDays || [],
    shiftPreference: userProfile.shiftPreference || userProfile.logistics?.shiftPreference || [],

    // Commute from Stage 3
    commuteTolerance: userProfile.commuteTolerance || userProfile.commuteWillingness || userProfile.logistics?.commuteTolerance || null,
    transport: userProfile.transport || userProfile.commuteMethod ||
               (userProfile.logistics?.transportMode ? [userProfile.logistics.transportMode].flat() : []),
    commuteCoords: userProfile.commuteCoords || null,

    // Reality/Challenges from Stage 5
    realityChallenges: userProfile.selectedPrompts || userProfile.logistics?.selectedPrompts || [],
    realityContext: userProfile.realityContext || userProfile.realityChallenges || userProfile.logistics?.realityContext || null,

    // Links from Stage 1
    linkedinUrl: userProfile.linkedinUrl || null,
    portfolioUrl: userProfile.portfolioUrl || null,
  };
};

// Format profile context for agent prompt
const formatProfileForAgent = (profile: Partial<ProfileContext>): string => {
  const parts: string[] = [];

  // Skills
  const allSkills = [
    ...(profile.skills?.technical || []),
    ...(profile.skills?.design || []),
    ...(profile.skills?.soft || [])
  ];
  if (allSkills.length > 0) {
    parts.push(`Skills: ${allSkills.slice(0, 10).join(', ')}`);
  }

  // Education
  if (profile.education && profile.education.length > 0) {
    const edu = profile.education[0];
    parts.push(`Education: ${edu.program || edu.degree} from ${edu.school}`);
  }

  // Salary
  if (profile.salaryMin && profile.salaryMax) {
    parts.push(`Salary range: $${(profile.salaryMin/1000).toFixed(0)}K - $${(profile.salaryMax/1000).toFixed(0)}K`);
  }

  // Availability
  if (profile.availability) {
    const availMap: Record<string, string> = {
      'open': 'Any schedule',
      'weekdays': 'Weekdays only',
      'weekends': 'Weekends only',
      'flexible': 'Flexible schedule',
      'limited': `Available: ${profile.selectedDays?.join(', ') || 'Limited days'}`
    };
    parts.push(`Availability: ${availMap[profile.availability] || profile.availability}`);
  }

  // Shift preference
  if (profile.shiftPreference && profile.shiftPreference.length > 0) {
    parts.push(`Preferred shifts: ${profile.shiftPreference.join(', ')}`);
  }

  // Commute
  if (profile.commuteTolerance) {
    const commuteMap: Record<string, string> = {
      'local': 'Local only (< 10 mi)',
      'standard': 'Standard commute (< 25 mi)',
      'extended': 'Extended commute OK (< 50 mi)'
    };
    parts.push(`Commute: ${commuteMap[profile.commuteTolerance] || profile.commuteTolerance}`);
  }

  // Transport
  if (profile.transport && profile.transport.length > 0) {
    parts.push(`Transport: ${profile.transport.join(', ')}`);
  }

  // Challenges (for finding accommodating employers)
  if (profile.realityChallenges && profile.realityChallenges.length > 0) {
    parts.push(`Special considerations: ${profile.realityChallenges.join(', ')}`);
  }

  return parts.join(' | ');
};

export const JobAgent: React.FC = () => {
  const { userProfile } = useAuth();
  const { isLight } = useTheme();

  // Agent state
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [siteStatuses, setSiteStatuses] = useState<Record<string, SiteStatus>>({});
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({ jobTitle: '', location: '' });
  const [events, setEvents] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Help state
  const [showHelp, setShowHelp] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [waitingForLogin, setWaitingForLogin] = useState(false);

  // Play pleasant notification chime
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create a pleasant two-tone chime (like a doorbell)
      const playTone = (freq: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        // Gentle fade in and out
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      // Play a pleasant C-E chord progression (like a success chime)
      playTone(523.25, now, 0.3);        // C5
      playTone(659.25, now + 0.15, 0.4); // E5
      playTone(783.99, now + 0.3, 0.5);  // G5

    } catch (e) {
      console.log('Could not play notification sound');
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Send browser notification
  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'job-agent',
        requireInteraction: true
      });
    }
    // Also play sound
    playNotificationSound();
  };

  const wsRef = useRef<WebSocket | null>(null);
  const statusPollRef = useRef<NodeJS.Timeout | null>(null);

  // Check if agent server is running
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${AGENT_API_URL}/health`);
        if (res.ok) {
          setAgentConnected(true);
          fetchAgentStatus();
        } else {
          setAgentConnected(false);
        }
      } catch {
        setAgentConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection for real-time events
  useEffect(() => {
    if (!agentConnected) return;

    const ws = new WebSocket(`ws://localhost:3001/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      addEvent('Connected to agent');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'action') {
          // Parse action details for better display
          const action = data.data?.action || data.data;
          const actionType = action?.type || action?.action || 'working';
          const actionReason = action?.reason || action?.description || '';

          // Format action message with emoji
          const actionEmojis: Record<string, string> = {
            click: '👆',
            type: '⌨️',
            navigate: '🧭',
            scroll: '📜',
            wait: '⏳',
            done: '✅',
            press: '⌨️',
            screenshot: '📸',
            working: '🤖'
          };
          const emoji = actionEmojis[actionType] || '🔄';
          const message = actionReason ? `${emoji} ${actionType}: ${actionReason.substring(0, 50)}...` : `${emoji} ${actionType}`;
          addEvent(message);
        } else if (data.type === 'status') {
          setAgentStatus(data.data.state || data.data);
        } else if (data.type === 'screenshot') {
          // Handle live screenshot updates
        } else if (data.type === 'done' || data.type === 'complete') {
          addEvent('✅ Task completed!');
          sendNotification('Job Search Complete!', 'The agent has finished searching for jobs.');
        } else if (data.type === 'error') {
          addEvent(`❌ Error: ${data.data?.message || 'Something went wrong'}`);
        }
      } catch (e) {
        console.error('WebSocket parse error:', e);
      }
    };

    ws.onerror = () => {
      addEvent('WebSocket error');
    };

    ws.onclose = () => {
      addEvent('Disconnected from agent');
    };

    return () => {
      ws.close();
    };
  }, [agentConnected]);

  const fetchAgentStatus = async () => {
    try {
      const res = await fetch(`${AGENT_API_URL}/status`);
      if (res.ok) {
        const status = await res.json();
        setAgentStatus(status);
      }
    } catch (e) {
      console.error('Failed to fetch agent status:', e);
    }
  };

  const addEvent = (message: string) => {
    setEvents(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Launch site for login
  const launchSite = async (siteId: string) => {
    const siteName = JOB_SITES.find(s => s.id === siteId)?.name || siteId;
    setSelectedSite(siteId);
    setSiteStatuses(prev => ({
      ...prev,
      [siteId]: { siteId, isLoggedIn: false, isLaunching: true, message: '🚀 Opening browser window...' }
    }));

    try {
      const res = await fetch(`${AGENT_API_URL}/sites/${siteId}/launch`, { method: 'POST' });
      const data = await res.json();

      const message = data.isLoggedIn
        ? '✅ Logged in! Click "Start Agent" below.'
        : '👆 Log in using the browser window that opened';

      setSiteStatuses(prev => ({
        ...prev,
        [siteId]: {
          siteId,
          isLoggedIn: data.isLoggedIn,
          isLaunching: false,
          message
        }
      }));

      addEvent(data.isLoggedIn ? `✅ Already logged into ${siteName}` : `🔐 Waiting for ${siteName} login...`);

      // Start polling for login status
      if (!data.isLoggedIn) {
        setWaitingForLogin(true);
        pollLoginStatus(siteId);
      } else {
        setWaitingForLogin(false);
        // Notify user they're already logged in
        sendNotification('Already Logged In!', `You're logged into ${siteName}. Enter your search details.`);
      }
    } catch (e) {
      setSiteStatuses(prev => ({
        ...prev,
        [siteId]: { siteId, isLoggedIn: false, isLaunching: false, message: '❌ Failed to open browser. Is the agent running?' }
      }));
      addEvent(`❌ Failed to launch ${siteName} - check if agent is running`);
    }
  };

  // Poll for login status
  const pollLoginStatus = (siteId: string) => {
    const siteName = JOB_SITES.find(s => s.id === siteId)?.name || siteId;
    if (statusPollRef.current) clearInterval(statusPollRef.current);

    statusPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${AGENT_API_URL}/sites/${siteId}/login-status`);
        const data = await res.json();

        if (data.isLoggedIn) {
          setSiteStatuses(prev => ({
            ...prev,
            [siteId]: { siteId, isLoggedIn: true, isLaunching: false, message: '✅ Logged in! Enter your search below.' }
          }));
          addEvent(`✅ ${siteName} login detected! Ready to search.`);
          setWaitingForLogin(false);

          // Send notification to bring user back
          sendNotification('Login Successful! 🎉', `Come back to Jalanea Works to start your ${siteName} job search!`);

          if (statusPollRef.current) clearInterval(statusPollRef.current);
        }
      } catch (e) {
        console.error('Login poll error:', e);
      }
    }, 2000);
  };

  // Build profile context from user's onboarding data
  const profileContext = buildProfileContext(userProfile);
  const profileSummary = formatProfileForAgent(profileContext);

  // Start job search with full profile context
  const startSearch = async () => {
    if (!selectedSite || !searchParams.jobTitle) return;

    const siteName = JOB_SITES.find(s => s.id === selectedSite)?.name || selectedSite;
    setIsSearching(true);
    addEvent(`🔍 Searching for "${searchParams.jobTitle}" on ${siteName}...`);

    // Log profile context being used
    if (profileSummary) {
      addEvent(`👤 Using your profile: ${profileSummary.slice(0, 100)}...`);
    }

    try {
      // Send full profile context to the agent
      const searchPayload = {
        ...searchParams,
        profile: {
          name: userProfile?.fullName || userProfile?.name || userProfile?.displayName,
          email: userProfile?.email,
          ...profileContext,
        }
      };

      const res = await fetch(`${AGENT_API_URL}/sites/${selectedSite}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchPayload)
      });

      const data = await res.json();
      if (data.success) {
        addEvent(`🤖 Agent is now searching ${siteName} for jobs!`);
        addEvent(`📍 Location: ${searchParams.location || 'Any'}`);

        // Show what profile aspects are being considered
        if (profileContext.skills && Object.values(profileContext.skills).flat().length > 0) {
          addEvent(`💼 Matching your skills: ${Object.values(profileContext.skills).flat().slice(0, 5).join(', ')}`);
        }
        if (profileContext.salaryMin && profileContext.salaryMax) {
          addEvent(`💰 Salary target: $${(profileContext.salaryMin/1000).toFixed(0)}K - $${(profileContext.salaryMax/1000).toFixed(0)}K`);
        }
        if (profileContext.realityChallenges && profileContext.realityChallenges.length > 0) {
          addEvent(`🌟 Looking for jobs that accommodate: ${profileContext.realityChallenges.join(', ')}`);
        }
      } else {
        addEvent(`⚠️ ${data.message || 'Search may have issues'}`);
      }
      fetchAgentStatus();
    } catch (e) {
      addEvent('❌ Failed to start search - is the agent still running?');
    } finally {
      setIsSearching(false);
    }
  };

  // Agent controls
  const pauseAgent = async () => {
    await fetch(`${AGENT_API_URL}/pause`, { method: 'POST' });
    fetchAgentStatus();
    addEvent('⏸️ Agent paused - click Resume to continue');
  };

  const resumeAgent = async () => {
    await fetch(`${AGENT_API_URL}/resume`, { method: 'POST' });
    fetchAgentStatus();
    addEvent('▶️ Agent resumed - continuing search');
  };

  const stopAgent = async () => {
    await fetch(`${AGENT_API_URL}/stop`, { method: 'POST' });
    fetchAgentStatus();
    addEvent('⏹️ Agent stopped - select a site to start a new search');
  };

  // Pre-fill search from user profile
  useEffect(() => {
    if (userProfile?.preferences?.targetRoles?.length) {
      setSearchParams(prev => ({
        ...prev,
        jobTitle: userProfile.preferences.targetRoles[0] || ''
      }));
    }
    if (userProfile?.location) {
      setSearchParams(prev => ({
        ...prev,
        location: userProfile.location
      }));
    }
  }, [userProfile]);

  const currentSiteStatus = selectedSite ? siteStatuses[selectedSite] : null;

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-6xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold flex items-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-orange-500/20 border border-gold/30 flex items-center justify-center">
                <Bot size={24} className="text-gold" />
              </div>
              AI Job Agent
            </h1>
            <p className={`mt-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Automated job applications while you sleep
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Help Button */}
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                showHelp
                  ? 'bg-gold/20 text-gold'
                  : isLight
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <HelpCircle size={16} />
              <span className="text-sm font-medium">Help</span>
            </button>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              agentConnected
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {agentConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span className="text-sm font-medium">
                {agentConnected ? 'Agent Online' : 'Agent Offline'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Waiting for Login Banner */}
        <AnimatePresence>
          {waitingForLogin && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-2xl border-2 border-dashed ${
                isLight
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
                  : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isLight ? 'bg-blue-100' : 'bg-blue-500/20'
                    }`}>
                      <Loader size={24} className="text-blue-500 animate-spin" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isLight ? 'text-blue-800' : 'text-blue-400'}`}>
                      🔐 Waiting for you to log in...
                    </h3>
                    <p className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-300'}`}>
                      Complete the login in the browser window, then come back here!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatbot(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    isLight
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }`}
                >
                  <HelpCircle size={16} />
                  Need Help?
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Panel */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`rounded-2xl border overflow-hidden ${
                isLight
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-blue-800' : 'text-blue-400'}`}>
                    <HelpCircle size={20} />
                    How to Use the AI Job Agent
                  </h3>
                  <button
                    onClick={() => setShowHelp(false)}
                    className={`p-1 rounded-lg ${isLight ? 'hover:bg-blue-100' : 'hover:bg-blue-500/20'}`}
                  >
                    <X size={18} className={isLight ? 'text-blue-600' : 'text-blue-400'} />
                  </button>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {HELP_STEPS.map((step) => (
                    <div
                      key={step.step}
                      className={`p-4 rounded-xl ${
                        isLight ? 'bg-white border border-blue-100' : 'bg-slate-800/50 border border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {step.step}
                        </div>
                        <h4 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {step.title}
                        </h4>
                      </div>
                      <p className={`text-sm mb-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {step.description}
                      </p>
                      <div className={`flex items-start gap-2 text-xs ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                        <Info size={12} className="mt-0.5 shrink-0" />
                        <span>{step.tip}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Troubleshooting Toggle */}
                <button
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                    isLight
                      ? 'bg-white border border-blue-100 hover:bg-blue-50'
                      : 'bg-slate-800/50 border border-white/5 hover:bg-slate-800'
                  }`}
                >
                  <span className={`font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <AlertCircle size={18} />
                    Having Trouble?
                  </span>
                  {showTroubleshooting ? (
                    <ChevronUp size={18} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
                  ) : (
                    <ChevronDown size={18} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
                  )}
                </button>

                {/* Troubleshooting Content */}
                <AnimatePresence>
                  {showTroubleshooting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      {TROUBLESHOOTING.map((item, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-xl ${
                            isLight ? 'bg-white border border-blue-100' : 'bg-slate-800/50 border border-white/5'
                          }`}
                        >
                          <h5 className={`font-bold text-sm mb-1 ${isLight ? 'text-red-600' : 'text-red-400'}`}>
                            {item.issue}
                          </h5>
                          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            {item.solution}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent Not Running Warning */}
        {!agentConnected && (
          <motion.div
            variants={fadeUp}
            className={`p-6 rounded-2xl border ${
              isLight
                ? 'bg-amber-50 border-amber-200'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="text-amber-500 shrink-0" size={24} />
              <div>
                <h3 className={`font-bold ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                  Cloud Agent Not Running
                </h3>
                <p className={`mt-1 text-sm ${isLight ? 'text-amber-700' : 'text-amber-300/80'}`}>
                  Start the cloud agent server to enable automated job applications.
                </p>
                <code className={`block mt-3 p-3 rounded-lg text-sm font-mono ${
                  isLight ? 'bg-amber-100' : 'bg-black/30'
                }`}>
                  cd cloud-agent && npm run dev
                </code>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Sites */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-4">
            <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Choose a Job Site
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {JOB_SITES.map((site) => {
                const status = siteStatuses[site.id];
                const isSelected = selectedSite === site.id;
                const isLoggedIn = status?.isLoggedIn;

                return (
                  <motion.button
                    key={site.id}
                    onClick={() => agentConnected && launchSite(site.id)}
                    disabled={!agentConnected || status?.isLaunching}
                    whileHover={{ scale: agentConnected ? 1.02 : 1 }}
                    whileTap={{ scale: agentConnected ? 0.98 : 1 }}
                    className={`relative p-6 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'ring-2 ring-gold'
                        : ''
                    } ${
                      isLight
                        ? 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
                        : 'bg-slate-800/50 border border-white/10 hover:border-white/20'
                    } ${!agentConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Status Badge */}
                    {isLoggedIn && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle size={20} className="text-emerald-500" />
                      </div>
                    )}

                    <div className="text-4xl mb-3">{site.icon}</div>
                    <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {site.name}
                    </h3>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {site.description}
                    </p>

                    {/* Hint tooltip */}
                    {!status && (
                      <div className={`flex items-center gap-1.5 mt-2 text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Info size={12} />
                        <span>{site.hint}</span>
                      </div>
                    )}

                    {status?.isLaunching && (
                      <div className="flex items-center gap-2 mt-3 text-gold">
                        <Loader size={14} className="animate-spin" />
                        <span className="text-sm">Opening...</span>
                      </div>
                    )}

                    {status && !status.isLaunching && (
                      <p className={`mt-3 text-xs ${
                        isLoggedIn ? 'text-emerald-500' : isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {status.message}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Search Form */}
            <AnimatePresence>
              {currentSiteStatus?.isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-6 rounded-2xl ${
                    isLight
                      ? 'bg-white border border-slate-200 shadow-sm'
                      : 'bg-slate-800/50 border border-white/10'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Start Job Search
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={searchParams.jobTitle}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, jobTitle: e.target.value }))}
                        placeholder="e.g., Web Developer"
                        className={`w-full px-4 py-3 rounded-xl ${
                          isLight
                            ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400'
                            : 'bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500'
                        } focus:outline-none focus:ring-2 focus:ring-gold/50`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={searchParams.location}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., Remote"
                        className={`w-full px-4 py-3 rounded-xl ${
                          isLight
                            ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400'
                            : 'bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500'
                        } focus:outline-none focus:ring-2 focus:ring-gold/50`}
                      />
                    </div>
                  </div>

                  {/* Profile Context Summary */}
                  {profileSummary && (
                    <div className={`p-4 rounded-xl mb-4 ${
                      isLight
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100'
                        : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isLight ? 'bg-purple-100' : 'bg-purple-500/20'}`}>
                          <Settings size={16} className={isLight ? 'text-purple-600' : 'text-purple-400'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm mb-1 ${isLight ? 'text-purple-800' : 'text-purple-300'}`}>
                            Your Profile is Being Used
                          </h4>
                          <p className={`text-xs leading-relaxed ${isLight ? 'text-purple-600' : 'text-purple-300/80'}`}>
                            {profileSummary.length > 150 ? profileSummary.slice(0, 150) + '...' : profileSummary}
                          </p>

                          {/* Quick profile highlights */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {profileContext.skills && Object.values(profileContext.skills).flat().length > 0 && (
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {Object.values(profileContext.skills).flat().length} skills
                              </span>
                            )}
                            {profileContext.salaryMin && profileContext.salaryMax && (
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                isLight ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-300'
                              }`}>
                                ${(profileContext.salaryMin/1000).toFixed(0)}K-${(profileContext.salaryMax/1000).toFixed(0)}K
                              </span>
                            )}
                            {profileContext.availability && (
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {profileContext.availability}
                              </span>
                            )}
                            {profileContext.realityChallenges && profileContext.realityChallenges.length > 0 && (
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {profileContext.realityChallenges.length} considerations
                              </span>
                            )}
                          </div>

                          <a
                            href="/account"
                            className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${
                              isLight ? 'text-purple-600 hover:text-purple-800' : 'text-purple-400 hover:text-purple-300'
                            }`}
                          >
                            Edit your profile
                            <ArrowRight size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No profile warning */}
                  {!profileSummary && userProfile?.onboardingCompleted !== true && (
                    <div className={`p-4 rounded-xl mb-4 ${
                      isLight
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-amber-500/10 border border-amber-500/20'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertCircle size={18} className={isLight ? 'text-amber-600' : 'text-amber-400'} />
                        <div>
                          <h4 className={`font-bold text-sm ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                            Complete Your Profile
                          </h4>
                          <p className={`text-xs mt-1 ${isLight ? 'text-amber-600' : 'text-amber-300/80'}`}>
                            Complete onboarding to help us find jobs that match your skills, availability, and preferences.
                          </p>
                          <a
                            href="/onboarding"
                            className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${
                              isLight ? 'text-amber-600 hover:text-amber-800' : 'text-amber-400 hover:text-amber-300'
                            }`}
                          >
                            Complete onboarding
                            <ArrowRight size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={startSearch}
                    disabled={!searchParams.jobTitle || isSearching}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Start Agent
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Agent Status Panel */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Agent Status
            </h2>

            <div className={`p-6 rounded-2xl ${
              isLight
                ? 'bg-white border border-slate-200 shadow-sm'
                : 'bg-slate-800/50 border border-white/10'
            }`}>
              {/* Status Indicator */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${
                  agentStatus?.status === 'running' ? 'bg-emerald-500 animate-pulse' :
                  agentStatus?.status === 'paused' ? 'bg-amber-500' :
                  'bg-slate-500'
                }`} />
                <span className={`font-medium capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {agentStatus?.status || 'Idle'}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Actions</span>
                  <span className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {agentStatus?.actionsPerformed || 0}
                  </span>
                </div>
                {agentStatus?.lastAction && (
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Last</span>
                    <span className={`font-mono text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {agentStatus.lastAction}
                    </span>
                  </div>
                )}
              </div>

              {/* Controls */}
              {agentStatus?.status === 'running' && (
                <div className="flex gap-2">
                  <button
                    onClick={pauseAgent}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                  <button
                    onClick={stopAgent}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Square size={16} />
                    Stop
                  </button>
                </div>
              )}

              {agentStatus?.status === 'paused' && (
                <button
                  onClick={resumeAgent}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                >
                  <Play size={16} />
                  Resume
                </button>
              )}
            </div>

            {/* Event Log */}
            <div className={`p-4 rounded-2xl ${
              isLight
                ? 'bg-slate-100 border border-slate-200'
                : 'bg-slate-900/50 border border-white/5'
            }`}>
              <h3 className={`text-sm font-bold mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Activity Log
              </h3>
              <div className="h-48 overflow-y-auto space-y-1 font-mono text-xs">
                {events.length === 0 ? (
                  <p className={isLight ? 'text-slate-400' : 'text-slate-500'}>No events yet...</p>
                ) : (
                  events.map((event, i) => (
                    <p key={i} className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                      {event}
                    </p>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Chatbot Helper */}
        <AnimatePresence>
          {showChatbot && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed bottom-6 right-6 w-96 max-h-[500px] rounded-2xl shadow-2xl overflow-hidden z-50 ${
                isLight ? 'bg-white border border-slate-200' : 'bg-slate-800 border border-white/10'
              }`}
            >
              {/* Header */}
              <div className={`p-4 flex items-center justify-between ${
                isLight ? 'bg-gradient-to-r from-gold/10 to-orange-100' : 'bg-gradient-to-r from-gold/20 to-orange-500/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Jalanea Assistant
                    </h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Here to help!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatbot(false)}
                  className={`p-2 rounded-lg ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
                >
                  <X size={18} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
                </button>
              </div>

              {/* Chat Content */}
              <div className={`p-4 space-y-4 max-h-[350px] overflow-y-auto ${
                isLight ? 'bg-slate-50' : 'bg-slate-900/50'
              }`}>
                {/* Bot Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className={`p-3 rounded-2xl rounded-tl-none ${
                    isLight ? 'bg-white border border-slate-200' : 'bg-slate-800 border border-white/10'
                  }`}>
                    <p className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Hi! I'm here to help you with the Job Agent. What are you experiencing?
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Common Issues:
                  </p>
                  {[
                    { q: "Browser won't open", a: "Make sure the cloud agent is running. Open a terminal and run: cd cloud-agent && npm run dev" },
                    { q: "Stuck on Cloudflare check", a: "Complete the verification in the browser window. If it keeps looping, try clicking the site button again." },
                    { q: "Login not detected", a: "Make sure you're fully logged in (past the homepage). Try navigating to your profile or dashboard." },
                    { q: "Agent keeps timing out", a: "Some sites are slow to load. The agent will retry. If it fails, click Stop and try again." }
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        addEvent(`💬 Help: ${item.q}`);
                        addEvent(`💡 ${item.a}`);
                      }}
                      className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${
                        isLight
                          ? 'bg-white border border-slate-200 hover:border-gold/50 hover:bg-gold/5'
                          : 'bg-slate-800 border border-white/10 hover:border-gold/50 hover:bg-gold/5'
                      }`}
                    >
                      <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                        {item.q}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Additional Help */}
                <div className={`p-3 rounded-xl ${
                  isLight ? 'bg-blue-50 border border-blue-100' : 'bg-blue-500/10 border border-blue-500/30'
                }`}>
                  <p className={`text-xs ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                    💡 Tip: After logging in, you'll hear a sound and see a notification. Come back here to start your search!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Chat Button (when chatbot is closed) */}
        {!showChatbot && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setShowChatbot(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-orange-500 shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
          >
            <Bot size={24} className="text-white" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default JobAgent;
