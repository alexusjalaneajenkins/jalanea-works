import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Play, Pause, Square, CheckCircle, AlertCircle,
  Wifi, WifiOff, Zap, Loader, ChevronDown, ChevronUp,
  Briefcase, MapPin, Link2, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';

// Cloud Agent API URL
const AGENT_API_URL = import.meta.env.VITE_CLOUD_AGENT_URL || 'http://localhost:3001';

// Job site configurations
const JOB_SITES = [
  { id: 'indeed', name: 'Indeed', icon: '💼', color: '#2164f3' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💎', color: '#0a66c2' },
  { id: 'ziprecruiter', name: 'ZipRecruiter', icon: '🎯', color: '#5ba829' },
  { id: 'glassdoor', name: 'Glassdoor', icon: '🚪', color: '#0caa41' },
];

interface MobileJobAgentProps {
  onBack: () => void;
  // Login mode props (for OAuth/browser-based login)
  loginMode?: boolean;
  loginSiteId?: string;
  loginUrl?: string;
}

interface AgentStatus {
  status: 'idle' | 'running' | 'paused' | 'error';
  currentTask: string | null;
  actionsPerformed: number;
  lastAction: string | null;
}

interface SiteCredential {
  siteId: string;
  isVerified: boolean;
  lastVerifiedAt: string | null;
  lastLoginAt: string | null;
  loginStatus: 'pending' | 'success' | 'failed' | 'needs_2fa' | 'needs_captcha';
  statusMessage: string | null;
}

export const MobileJobAgent: React.FC<MobileJobAgentProps> = ({
  onBack,
  loginMode,
  loginSiteId,
  loginUrl
}) => {
  const { isLight } = useTheme();
  const { currentUser, userProfile } = useAuth();

  // Agent state
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<SiteCredential[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [showLog, setShowLog] = useState(false);

  // Search params from preferences
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');

  // Login mode state
  const [loginStatus, setLoginStatus] = useState<'idle' | 'launching' | 'waiting' | 'success' | 'error'>('idle');
  const [loginMessage, setLoginMessage] = useState('');

  const wsRef = useRef<WebSocket | null>(null);

  // Check agent connection
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
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load credentials
  useEffect(() => {
    const loadCredentials = async () => {
      if (!currentUser?.uid) return;
      try {
        const res = await fetch(`${AGENT_API_URL}/credentials/${currentUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          // API returns { success: true, sites: [...] }
          setCredentials(data.sites || []);
        }
      } catch (err) {
        console.error('Failed to load credentials:', err);
      }
    };
    loadCredentials();
  }, [currentUser?.uid]);

  // Pre-fill from profile
  useEffect(() => {
    if (userProfile?.preferences?.targetRoles?.length) {
      setJobTitle(userProfile.preferences.targetRoles[0]);
    }
    if (userProfile?.location) {
      setLocation(userProfile.location);
    }
  }, [userProfile]);

  // WebSocket for real-time events
  useEffect(() => {
    if (!agentConnected) return;

    const wsUrl = AGENT_API_URL.replace(/^http/, 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => addEvent('Connected to agent');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'action') {
          const action = data.data?.action || data.data;
          const actionType = action?.type || 'working';
          const reason = action?.reason || '';
          addEvent(`${actionType}: ${reason.substring(0, 40)}...`);
        } else if (data.type === 'status') {
          setAgentStatus(data.data.state || data.data);
        } else if (data.type === 'done') {
          addEvent('Task completed!');
          haptics.success();
        } else if (data.type === 'error') {
          addEvent(`Error: ${data.data?.message || 'Something went wrong'}`);
          haptics.error();
        } else if (data.type === 'captcha') {
          addEvent(`CAPTCHA required - check browser`);
          haptics.warning();
        }
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };
    ws.onclose = () => addEvent('Disconnected');

    return () => ws.close();
  }, [agentConnected]);

  const fetchAgentStatus = async () => {
    try {
      const res = await fetch(`${AGENT_API_URL}/status`);
      if (res.ok) {
        const status = await res.json();
        setAgentStatus(status);
      }
    } catch (e) {
      console.error('Failed to fetch status:', e);
    }
  };

  const addEvent = (message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setEvents(prev => [`[${time}] ${message}`, ...prev.slice(0, 19)]);
  };

  const hasCredentialFor = (siteId: string) => {
    return credentials.some(c => c.siteId === siteId && c.loginStatus === 'success');
  };

  const startAgent = async () => {
    if (!selectedSite || !jobTitle) return;

    setIsStarting(true);
    haptics.medium();
    addEvent(`Starting search on ${JOB_SITES.find(s => s.id === selectedSite)?.name}...`);

    try {
      const res = await fetch(`${AGENT_API_URL}/queue/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.uid,
          siteId: selectedSite,
          jobTitle,
          location,
          maxApplications: 10
        })
      });

      if (res.ok) {
        addEvent('Job queued! Agent will start shortly.');
        haptics.success();
        fetchAgentStatus();
      } else {
        const err = await res.json();
        addEvent(`Failed: ${err.message || 'Unknown error'}`);
        haptics.error();
      }
    } catch (e) {
      addEvent('Failed to start agent');
      haptics.error();
    } finally {
      setIsStarting(false);
    }
  };

  const pauseAgent = async () => {
    haptics.light();
    await fetch(`${AGENT_API_URL}/pause`, { method: 'POST' });
    fetchAgentStatus();
    addEvent('Agent paused');
  };

  const resumeAgent = async () => {
    haptics.light();
    await fetch(`${AGENT_API_URL}/resume`, { method: 'POST' });
    fetchAgentStatus();
    addEvent('Agent resumed');
  };

  const stopAgent = async () => {
    haptics.medium();
    await fetch(`${AGENT_API_URL}/stop`, { method: 'POST' });
    fetchAgentStatus();
    addEvent('Agent stopped');
  };

  const connectedSites = JOB_SITES.filter(s => hasCredentialFor(s.id));
  const canStart = selectedSite && jobTitle && agentConnected && hasCredentialFor(selectedSite);

  // Login mode: Launch browser for OAuth login
  const startLoginFlow = async () => {
    if (!loginSiteId || !loginUrl) return;

    setLoginStatus('launching');
    setLoginMessage('Launching browser...');
    haptics.medium();
    addEvent(`Opening ${loginSiteId} login page...`);

    try {
      // Call the agent to launch the site for login
      const res = await fetch(`${AGENT_API_URL}/sites/${loginSiteId}/launch`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isLoggedIn) {
          setLoginStatus('success');
          setLoginMessage('Already logged in! Session saved.');
          addEvent('Already logged in - session captured');
          haptics.success();

          // Save session to Supabase
          await saveLoginSession();
        } else {
          setLoginStatus('waiting');
          setLoginMessage(data.isCloudflareChallenge
            ? 'Complete the Cloudflare check in the browser, then sign in'
            : 'Sign in to your account in the browser window');
          addEvent(data.message);

          // Start polling for login success
          startLoginStatusPolling();
        }
      } else {
        const err = await res.json();
        setLoginStatus('error');
        setLoginMessage(err.error || 'Failed to launch browser');
        addEvent(`Error: ${err.error}`);
        haptics.error();
      }
    } catch (e) {
      setLoginStatus('error');
      setLoginMessage('Could not connect to agent');
      addEvent('Failed to connect to agent');
      haptics.error();
    }
  };

  // Poll for login status
  const loginPollRef = useRef<NodeJS.Timeout | null>(null);

  const startLoginStatusPolling = () => {
    // Clear any existing poll
    if (loginPollRef.current) clearInterval(loginPollRef.current);

    loginPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${AGENT_API_URL}/sites/${loginSiteId}/login-status`);
        if (res.ok) {
          const data = await res.json();
          if (data.isLoggedIn) {
            // Success!
            if (loginPollRef.current) clearInterval(loginPollRef.current);
            setLoginStatus('success');
            setLoginMessage('Login successful! Session saved.');
            addEvent('Login detected - saving session');
            haptics.success();

            // Save session
            await saveLoginSession();
          }
        }
      } catch (e) {
        console.error('Login poll error:', e);
      }
    }, 2000); // Poll every 2 seconds
  };

  // Save login session to Supabase
  const saveLoginSession = async () => {
    if (!currentUser?.uid || !loginSiteId) return;

    try {
      // Get session data from agent
      const sessionRes = await fetch(`${AGENT_API_URL}/sites/${loginSiteId}/session`);
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();

        // Store session in Supabase
        const storeRes = await fetch(`${AGENT_API_URL}/sites/${loginSiteId}/store-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            sessionData: sessionData.sessionData,
          }),
        });

        if (storeRes.ok) {
          addEvent('Session saved to cloud!');

          // Close the browser
          await fetch(`${AGENT_API_URL}/sites/close`, { method: 'POST' });

          // Wait a moment then go back to profile
          setTimeout(() => {
            onBack();
          }, 1500);
        }
      }
    } catch (e) {
      console.error('Failed to save session:', e);
      addEvent('Warning: Could not save session to cloud');
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (loginPollRef.current) clearInterval(loginPollRef.current);
    };
  }, []);

  // Auto-start login flow when in login mode and agent is connected
  useEffect(() => {
    if (loginMode && agentConnected && loginStatus === 'idle') {
      startLoginFlow();
    }
  }, [loginMode, agentConnected, loginStatus]);

  return (
    <div className={`min-h-full ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 px-4 py-3 flex items-center gap-3 ${
        isLight ? 'bg-slate-50/90 backdrop-blur-xl' : 'bg-[#020617]/90 backdrop-blur-xl'
      }`}>
        <button
          onClick={onBack}
          className={`w-9 h-9 flex items-center justify-center rounded-xl ${
            isLight ? 'bg-slate-100' : 'bg-white/5'
          }`}
        >
          <ArrowLeft size={18} className={isLight ? 'text-slate-600' : 'text-slate-400'} />
        </button>
        <div className="flex-1">
          <h1 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {loginMode ? `Connect ${loginSiteId?.charAt(0).toUpperCase()}${loginSiteId?.slice(1)}` : 'AI Job Agent'}
          </h1>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {loginMode ? 'Sign in with your browser' : 'Auto-apply while you sleep'}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
          agentConnected
            ? 'bg-emerald-500/20 text-emerald-500'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {agentConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {agentConnected ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Login Mode UI */}
      {loginMode && (
        <div className="px-4 py-8 space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl text-center ${
              isLight ? 'bg-white border border-slate-200' : 'bg-slate-800/50 border border-white/10'
            }`}
          >
            {/* Status Icon */}
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              loginStatus === 'success' ? 'bg-emerald-500/20' :
              loginStatus === 'error' ? 'bg-red-500/20' :
              loginStatus === 'waiting' ? 'bg-gold/20' :
              isLight ? 'bg-slate-100' : 'bg-white/10'
            }`}>
              {loginStatus === 'launching' && (
                <Loader size={28} className="text-gold animate-spin" />
              )}
              {loginStatus === 'waiting' && (
                <Bot size={28} className="text-gold animate-pulse" />
              )}
              {loginStatus === 'success' && (
                <CheckCircle size={28} className="text-emerald-500" />
              )}
              {loginStatus === 'error' && (
                <AlertCircle size={28} className="text-red-400" />
              )}
              {loginStatus === 'idle' && !agentConnected && (
                <WifiOff size={28} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
              )}
              {loginStatus === 'idle' && agentConnected && (
                <Zap size={28} className="text-gold" />
              )}
            </div>

            {/* Status Message */}
            <h2 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {loginStatus === 'idle' && !agentConnected && 'Connecting to Agent...'}
              {loginStatus === 'idle' && agentConnected && 'Ready to Connect'}
              {loginStatus === 'launching' && 'Opening Browser...'}
              {loginStatus === 'waiting' && 'Waiting for Login'}
              {loginStatus === 'success' && 'Connected!'}
              {loginStatus === 'error' && 'Connection Failed'}
            </h2>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {loginMessage || (loginStatus === 'idle' && !agentConnected
                ? 'Please wait while we connect to the cloud agent...'
                : 'We\'ll open a browser window for you to sign in')}
            </p>

            {/* Instructions for waiting state */}
            {loginStatus === 'waiting' && (
              <div className={`mt-4 p-4 rounded-xl text-left ${
                isLight ? 'bg-gold/10' : 'bg-gold/10'
              }`}>
                <p className={`text-sm font-semibold mb-2 ${isLight ? 'text-amber-800' : 'text-gold'}`}>
                  Instructions:
                </p>
                <ol className={`text-xs space-y-1 ${isLight ? 'text-amber-700' : 'text-gold/80'}`}>
                  <li>1. A browser window should have opened</li>
                  <li>2. Sign in using Google, Apple, or your email</li>
                  <li>3. Complete any security checks (CAPTCHA)</li>
                  <li>4. Once logged in, we'll detect it automatically</li>
                </ol>
              </div>
            )}

            {/* Retry button for errors */}
            {loginStatus === 'error' && (
              <button
                onClick={startLoginFlow}
                className="mt-4 px-6 py-2.5 bg-gold text-black font-semibold rounded-xl active:scale-[0.98] transition-all"
              >
                Try Again
              </button>
            )}
          </motion.div>

          {/* Activity Log */}
          <div className={`rounded-2xl overflow-hidden ${
            isLight ? 'bg-white border border-slate-200' : 'bg-slate-800/50 border border-white/10'
          }`}>
            <div className={`p-4 ${isLight ? 'border-b border-slate-100' : 'border-b border-white/5'}`}>
              <span className={`font-semibold text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Activity Log
              </span>
            </div>
            <div className="px-4 py-3 max-h-32 overflow-y-auto space-y-1">
              {events.length === 0 ? (
                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Waiting for activity...
                </p>
              ) : (
                events.map((event, i) => (
                  <p key={i} className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {event}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onBack}
            className={`w-full py-3.5 rounded-xl font-medium transition-all ${
              isLight
                ? 'bg-slate-100 text-slate-600 active:bg-slate-200'
                : 'bg-white/5 text-slate-400 active:bg-white/10'
            }`}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Regular Agent UI (not login mode) */}
      {!loginMode && (
      <>
      <div className="px-4 pb-32 space-y-4">
        {/* Agent Not Connected Warning */}
        {!agentConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl ${
              isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className={`font-bold text-sm ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                  Agent Offline
                </p>
                <p className={`text-xs mt-1 ${isLight ? 'text-amber-700' : 'text-amber-300/80'}`}>
                  The cloud agent is starting up. This may take a moment.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Connected Sites Warning */}
        {connectedSites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl ${
              isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <Link2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className={`font-bold text-sm ${isLight ? 'text-blue-800' : 'text-blue-400'}`}>
                  Connect Your Job Sites
                </p>
                <p className={`text-xs mt-1 ${isLight ? 'text-blue-700' : 'text-blue-300/80'}`}>
                  Go to your Profile and connect Indeed, LinkedIn, or other job sites to enable auto-apply.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Site Selection */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Select Job Site
          </label>
          <div className="grid grid-cols-2 gap-2">
            {JOB_SITES.map((site) => {
              const isConnected = hasCredentialFor(site.id);
              const isSelected = selectedSite === site.id;

              return (
                <button
                  key={site.id}
                  onClick={() => {
                    if (isConnected) {
                      haptics.light();
                      setSelectedSite(site.id);
                    }
                  }}
                  disabled={!isConnected}
                  className={`relative p-4 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'ring-2 ring-gold'
                      : ''
                  } ${
                    isConnected
                      ? isLight
                        ? 'bg-white border border-slate-200 active:scale-[0.98]'
                        : 'bg-slate-800/50 border border-white/10 active:scale-[0.98]'
                      : isLight
                        ? 'bg-slate-100 border border-slate-200 opacity-50'
                        : 'bg-slate-800/30 border border-white/5 opacity-50'
                  }`}
                >
                  {isConnected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                    </div>
                  )}
                  <span className="text-2xl">{site.icon}</span>
                  <p className={`font-semibold text-sm mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {site.name}
                  </p>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isConnected ? 'Connected' : 'Not connected'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Parameters */}
        <div className="space-y-3">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Job Title
            </label>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
              isLight ? 'bg-white border border-slate-200' : 'bg-slate-800/50 border border-white/10'
            }`}>
              <Briefcase size={16} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Developer"
                className={`flex-1 bg-transparent text-sm outline-none ${
                  isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Location
            </label>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
              isLight ? 'bg-white border border-slate-200' : 'bg-slate-800/50 border border-white/10'
            }`}>
              <MapPin size={16} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Remote or Orlando, FL"
                className={`flex-1 bg-transparent text-sm outline-none ${
                  isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Agent Status Card */}
        {agentStatus && agentStatus.status !== 'idle' && (
          <div className={`p-4 rounded-2xl ${
            isLight ? 'bg-white border border-slate-200' : 'bg-slate-800/50 border border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  agentStatus.status === 'running' ? 'bg-emerald-500 animate-pulse' :
                  agentStatus.status === 'paused' ? 'bg-amber-500' : 'bg-slate-500'
                }`} />
                <span className={`font-semibold text-sm capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {agentStatus.status}
                </span>
              </div>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {agentStatus.actionsPerformed} actions
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {agentStatus.status === 'running' && (
                <>
                  <button
                    onClick={pauseAgent}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/20 text-amber-500 font-medium text-sm"
                  >
                    <Pause size={16} /> Pause
                  </button>
                  <button
                    onClick={stopAgent}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-medium text-sm"
                  >
                    <Square size={16} /> Stop
                  </button>
                </>
              )}
              {agentStatus.status === 'paused' && (
                <button
                  onClick={resumeAgent}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-500 font-medium text-sm"
                >
                  <Play size={16} /> Resume
                </button>
              )}
            </div>
          </div>
        )}

        {/* Activity Log (Collapsible) */}
        <div className={`rounded-2xl overflow-hidden ${
          isLight ? 'bg-white border border-slate-200' : 'bg-slate-800/50 border border-white/10'
        }`}>
          <button
            onClick={() => setShowLog(!showLog)}
            className={`w-full flex items-center justify-between p-4 ${
              isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'
            }`}
          >
            <span className={`font-semibold text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Activity Log
            </span>
            {showLog ? (
              <ChevronUp size={16} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
            ) : (
              <ChevronDown size={16} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
            )}
          </button>

          <AnimatePresence>
            {showLog && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className={`px-4 pb-4 max-h-48 overflow-y-auto space-y-1 ${
                  isLight ? 'border-t border-slate-100' : 'border-t border-white/5'
                }`}>
                  {events.length === 0 ? (
                    <p className={`text-xs py-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      No activity yet...
                    </p>
                  ) : (
                    events.map((event, i) => (
                      <p key={i} className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {event}
                      </p>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 ${
        isLight ? 'bg-slate-50/90 backdrop-blur-xl border-t border-slate-200' : 'bg-[#020617]/90 backdrop-blur-xl border-t border-white/5'
      }`} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <button
          onClick={startAgent}
          disabled={!canStart || isStarting}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
            canStart
              ? 'bg-gradient-to-r from-gold to-orange-500 text-black active:scale-[0.98]'
              : isLight
                ? 'bg-slate-200 text-slate-400'
                : 'bg-slate-800 text-slate-500'
          }`}
        >
          {isStarting ? (
            <>
              <Loader size={20} className="animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Zap size={20} />
              Start Auto-Apply
            </>
          )}
        </button>
        {!canStart && (
          <p className={`text-center text-xs mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {!selectedSite ? 'Select a connected job site' :
             !jobTitle ? 'Enter a job title' :
             !agentConnected ? 'Waiting for agent...' :
             'Connect this site in Profile'}
          </p>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default MobileJobAgent;
