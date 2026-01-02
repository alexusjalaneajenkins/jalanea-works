import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  GraduationCap,
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  MapPin,
  Mail,
  CheckCircle2,
  Zap,
  Link2,
  Eye,
  EyeOff,
  X,
  Loader,
  XCircle,
  RefreshCw,
  Clock,
  Trash2,
  ExternalLink,
  Chrome,
  Cookie,
  Copy,
  ClipboardPaste,
  Monitor,
} from 'lucide-react';
import { LiveBrowser } from './LiveBrowser';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';
import {
  getJobSites,
  getSiteCredentials,
  saveSiteCredentials,
  deleteSiteCredentials,
  JobSite,
  SiteCredential,
} from '../../services/cloudAgentService';

/**
 * MobileProfile - Research-driven design applying:
 * - Progress visualization: Completion bar motivates profile completion
 * - Scannable sections: Clear groupings reduce cognitive load
 * - Familiar patterns: Standard settings layout users expect
 * - Brand consistency: Gold accents throughout
 */

export const MobileProfile: React.FC = () => {
  const { isLight, toggleTheme } = useTheme();
  const { currentUser, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  // Connected Sites state
  const [sites, setSites] = useState<JobSite[]>([]);
  const [credentials, setCredentials] = useState<SiteCredential[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'choose' | 'credentials' | 'browser' | 'cookies' | 'browser-login-pending' | 'live-browser'>('choose');
  const [showLiveBrowser, setShowLiveBrowser] = useState(false);
  const [cookiesJson, setCookiesJson] = useState('');
  const [importingCookies, setImportingCookies] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [siteSuccess, setSiteSuccess] = useState<string | null>(null);

  // Load job sites and credentials (handle errors independently)
  useEffect(() => {
    const loadSitesData = async () => {
      if (!currentUser?.uid) {
        setSitesLoading(false);
        return;
      }

      // Load sites first - this should always work
      try {
        const sitesData = await getJobSites();
        setSites(sitesData);
      } catch (err) {
        console.error('Error loading job sites:', err);
      }

      // Load credentials separately - may fail if user has none
      try {
        const credsData = await getSiteCredentials(currentUser.uid);
        setCredentials(credsData);
      } catch (err) {
        // This is expected for new users with no credentials
        console.log('No credentials found or error:', err);
        setCredentials([]);
      }

      setSitesLoading(false);
    };
    loadSitesData();
  }, [currentUser]);

  const getCredentialStatus = (siteId: string): SiteCredential | undefined => {
    return credentials.find(c => c.siteId === siteId);
  };

  const handleOpenConnect = (siteId: string) => {
    haptics.light();
    setConnectingTo(siteId);
    setLoginMethod('choose'); // Start with method selection
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setSiteError(null);
  };

  const handleCloseConnect = () => {
    setConnectingTo(null);
    setLoginMethod('choose');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setCookiesJson('');
    setSiteError(null);
  };

  // Launch browser login - on mobile, open in new tab since cloud browser is headless
  const handleBrowserLogin = () => {
    if (!connectingTo) return;
    haptics.medium();

    // Get the site's login URL from site config
    const site = sites.find(s => s.id === connectingTo);
    const loginUrls: Record<string, string> = {
      indeed: 'https://secure.indeed.com/account/login',
      linkedin: 'https://www.linkedin.com/login',
      ziprecruiter: 'https://www.ziprecruiter.com/authn/login',
      glassdoor: 'https://www.glassdoor.com/profile/login_input.htm',
    };
    const loginUrl = site?.loginUrl || loginUrls[connectingTo] || `https://www.${connectingTo}.com/login`;

    // On mobile/PWA: Open login page in new tab and guide user to cookie import
    // The cloud browser is headless so users can't interact with it
    window.open(loginUrl, '_blank');

    // Switch to the browser login pending state with instructions
    setLoginMethod('browser-login-pending');
  };

  // Import cookies from user's browser
  const handleImportCookies = async () => {
    if (!currentUser?.uid || !connectingTo) return;
    if (!cookiesJson.trim()) {
      setSiteError('Please paste your exported cookies');
      return;
    }

    haptics.medium();
    setImportingCookies(true);
    setSiteError(null);

    try {
      // Parse the cookies JSON
      let cookies;
      try {
        cookies = JSON.parse(cookiesJson.trim());
      } catch {
        setSiteError('Invalid JSON format. Make sure you copied the complete export.');
        setImportingCookies(false);
        return;
      }

      // Validate it's an array
      if (!Array.isArray(cookies)) {
        setSiteError('Cookies should be a JSON array. Check that you exported correctly.');
        setImportingCookies(false);
        return;
      }

      // Filter to only include cookies for this site's domain
      const siteDomains: Record<string, string[]> = {
        indeed: ['indeed.com', '.indeed.com', 'secure.indeed.com'],
        linkedin: ['linkedin.com', '.linkedin.com', 'www.linkedin.com'],
        ziprecruiter: ['ziprecruiter.com', '.ziprecruiter.com'],
        glassdoor: ['glassdoor.com', '.glassdoor.com'],
      };
      const allowedDomains = siteDomains[connectingTo] || [connectingTo];
      const filteredCookies = cookies.filter((c: any) => {
        const domain = c.domain || '';
        return allowedDomains.some(d => domain.includes(d.replace('.', '')));
      });

      if (filteredCookies.length === 0) {
        setSiteError(`No ${connectingTo} cookies found. Make sure you're logged into ${connectingTo} before exporting.`);
        setImportingCookies(false);
        return;
      }

      // Send to the cloud agent API with userId for database storage
      const AGENT_API_URL = import.meta.env.VITE_CLOUD_AGENT_URL || 'https://jalanea-api.onrender.com';
      const res = await fetch(`${AGENT_API_URL}/sites/${connectingTo}/import-cookies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: filteredCookies, userId: currentUser.uid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to import cookies');
      }

      const data = await res.json();

      // Update local state
      const newCred: SiteCredential = {
        siteId: connectingTo,
        isVerified: true,
        lastVerifiedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginStatus: 'success',
        statusMessage: `Imported ${data.cookiesImported} cookies`,
      };
      const existingIndex = credentials.findIndex(c => c.siteId === connectingTo);
      if (existingIndex >= 0) {
        setCredentials(prev => prev.map((c, i) => i === existingIndex ? newCred : c));
      } else {
        setCredentials(prev => [...prev, newCred]);
      }

      setSiteSuccess(`${connectingTo.charAt(0).toUpperCase() + connectingTo.slice(1)} connected via cookies!`);
      setTimeout(() => setSiteSuccess(null), 3000);
      handleCloseConnect();
    } catch (err) {
      setSiteError(err instanceof Error ? err.message : 'Failed to import cookies');
    } finally {
      setImportingCookies(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!currentUser?.uid || !connectingTo) return;
    if (!email.trim() || !password.trim()) {
      setSiteError('Please enter both email and password');
      return;
    }

    haptics.medium();
    setSaving(true);
    setSiteError(null);
    try {
      await saveSiteCredentials(currentUser.uid, connectingTo, email.trim(), password);
      const newCred: SiteCredential = {
        siteId: connectingTo,
        isVerified: false,
        lastVerifiedAt: null,
        lastLoginAt: null,
        loginStatus: 'pending',
        statusMessage: 'Credentials saved - will verify on next job run',
      };
      const existingIndex = credentials.findIndex(c => c.siteId === connectingTo);
      if (existingIndex >= 0) {
        setCredentials(prev => prev.map((c, i) => i === existingIndex ? newCred : c));
      } else {
        setCredentials(prev => [...prev, newCred]);
      }
      setSiteSuccess(`${connectingTo.charAt(0).toUpperCase() + connectingTo.slice(1)} connected!`);
      setTimeout(() => setSiteSuccess(null), 3000);
      handleCloseConnect();
    } catch (err) {
      setSiteError(err instanceof Error ? err.message : 'Failed to save credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (siteId: string) => {
    if (!currentUser?.uid) return;
    haptics.medium();
    setDeleting(siteId);
    try {
      await deleteSiteCredentials(currentUser.uid, siteId);
      setCredentials(prev => prev.filter(c => c.siteId !== siteId));
      setSiteSuccess(`${siteId.charAt(0).toUpperCase() + siteId.slice(1)} disconnected`);
      setTimeout(() => setSiteSuccess(null), 3000);
    } catch (err) {
      setSiteError('Failed to disconnect');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (cred: SiteCredential) => {
    const baseClasses = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium';
    switch (cred.loginStatus) {
      case 'success':
        return <span className={`${baseClasses} bg-green-100 text-green-700`}><CheckCircle2 size={10} /> Connected</span>;
      case 'failed':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}><XCircle size={10} /> Failed</span>;
      case 'needs_2fa':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}><Shield size={10} /> 2FA Needed</span>;
      case 'needs_captcha':
        return <span className={`${baseClasses} bg-orange-100 text-orange-700`}><RefreshCw size={10} /> CAPTCHA</span>;
      default:
        return <span className={`${baseClasses} bg-gold/20 text-gold`}><Clock size={10} /> Pending</span>;
    }
  };

  // Glass panel styles matching desktop design system
  const glassPanel = isLight
    ? 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg'
    : 'bg-slate-900/60 backdrop-blur-xl border border-white/10';

  const profileCompletion = userProfile?.profileCompletion || 65;

  // Gold-themed profile sections for brand consistency
  const profileSections = [
    {
      icon: FileText,
      title: 'Resume',
      subtitle: userProfile?.resumeFile ? 'Last updated 2 days ago' : 'Upload your resume',
      completed: !!userProfile?.resumeFile,
    },
    {
      icon: Briefcase,
      title: 'Work Experience',
      subtitle: userProfile?.experience?.length ? `${userProfile.experience.length} positions added` : 'Add your work history',
      completed: (userProfile?.experience?.length || 0) > 0,
    },
    {
      icon: GraduationCap,
      title: 'Education',
      subtitle: userProfile?.education?.length ? `${userProfile.education.length} entries added` : 'Add your education',
      completed: (userProfile?.education?.length || 0) > 0,
    },
  ];

  const settingsItems = [
    { icon: isLight ? Moon : Sun, label: 'Dark Mode', toggle: true, value: !isLight, onToggle: toggleTheme },
    { icon: Bell, label: 'Notifications', chevron: true },
    { icon: Shield, label: 'Privacy', chevron: true },
    { icon: HelpCircle, label: 'Help & Support', chevron: true },
  ];

  const handleSignOut = async () => {
    haptics.medium();
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      {/* Profile Header - Premium glassmorphism style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl mb-4 ${glassPanel}`}
      >
        <div className="flex items-center gap-3">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="w-16 h-16 shrink-0 rounded-2xl object-cover border-2 border-gold shadow-lg shadow-gold/20"
            />
          ) : (
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center text-xl font-bold text-black shadow-lg shadow-gold/30">
              {userProfile?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {userProfile?.fullName || currentUser?.displayName || 'Welcome!'}
              </h2>
              <Zap size={16} className="text-gold shrink-0" />
            </div>
            {userProfile?.targetRole && (
              <p className={`text-sm truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {userProfile.targetRole}
              </p>
            )}
            <div className={`flex items-center gap-1 text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              {userProfile?.location && (
                <>
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{userProfile.location}</span>
                  <span className="mx-1">•</span>
                </>
              )}
              <Mail size={12} className="shrink-0" />
              <span className="truncate">{currentUser?.email}</span>
            </div>
          </div>
          <button
            onClick={() => haptics.light()}
            className={`p-3 shrink-0 rounded-xl active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isLight ? 'bg-gold/10' : 'bg-gold/20'
            }`}
          >
            <Edit3 size={18} className="text-gold" />
          </button>
        </div>

        {/* Profile Completion - Gold gradient bar */}
        <div className={`mt-4 pt-4 border-t ${isLight ? 'border-slate-200/50' : 'border-white/5'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Profile Completion
            </span>
            <span className="text-sm font-bold text-gold">{profileCompletion}%</span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Profile Sections - Gold-themed icons for consistency */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`p-4 rounded-2xl mb-4 ${glassPanel}`}
      >
        <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          Your Profile
        </h3>
        <div className="space-y-2">
          {profileSections.map((section) => (
            <button
              key={section.title}
              onClick={() => haptics.light()}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
                isLight ? 'hover:bg-slate-50 active:bg-slate-100' : 'hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                section.completed
                  ? 'bg-green-500/10'
                  : isLight ? 'bg-gold/10' : 'bg-gold/20'
              }`}>
                <section.icon size={18} className={section.completed ? 'text-green-500' : 'text-gold'} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {section.title}
                </div>
                <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {section.subtitle}
                </div>
              </div>
              {section.completed ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <ChevronRight size={18} className={isLight ? 'text-slate-400' : 'text-slate-400'} />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Connected Job Sites - Critical for mobile job agent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className={`p-4 rounded-2xl mb-4 ${glassPanel}`}
      >
        <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          <Link2 size={14} /> Connected Job Sites
        </h3>

        {siteSuccess && (
          <div className="flex items-center gap-2 p-2.5 mb-3 bg-green-100 text-green-700 rounded-xl text-xs">
            <CheckCircle2 size={14} />
            {siteSuccess}
          </div>
        )}

        <p className={`text-xs mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Connect your job accounts to enable automatic applications from your phone.
        </p>

        {sitesLoading ? (
          <div className="flex justify-center py-4">
            <Loader className="w-5 h-5 animate-spin text-gold" />
          </div>
        ) : (
          <div className="space-y-2">
            {sites.map(site => {
              const cred = getCredentialStatus(site.id);
              const isConnected = !!cred;
              const isDeleting = deleting === site.id;

              return (
                <div
                  key={site.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isLight ? 'bg-slate-50' : 'bg-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    isLight ? 'bg-white shadow-sm' : 'bg-slate-800'
                  }`}>
                    {site.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {site.name}
                    </div>
                    {isConnected && cred && (
                      <div className="mt-0.5">{getStatusBadge(cred)}</div>
                    )}
                  </div>
                  {isConnected ? (
                    <button
                      onClick={() => handleDisconnect(site.id)}
                      disabled={isDeleting}
                      className={`p-2 rounded-lg active:scale-95 transition-all ${
                        isLight ? 'bg-red-50 text-red-500' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {isDeleting ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenConnect(site.id)}
                      className="px-3 py-1.5 bg-gold text-black text-xs font-semibold rounded-lg active:scale-95 transition-all"
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Connection Modal */}
      <AnimatePresence>
        {connectingTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
            onClick={handleCloseConnect}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-md rounded-t-3xl p-5 pb-8 ${
                isLight ? 'bg-white' : 'bg-slate-900'
              }`}
              style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Connect {connectingTo.charAt(0).toUpperCase() + connectingTo.slice(1)}
                </h3>
                <button
                  onClick={handleCloseConnect}
                  className={`p-2 rounded-full ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}
                >
                  <X size={18} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
                </button>
              </div>

              {siteError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-100 text-red-700 rounded-xl text-sm">
                  <XCircle size={16} />
                  {siteError}
                </div>
              )}

              {/* Method Selection */}
              {loginMethod === 'choose' && (
                <div className="space-y-3">
                  <p className={`text-sm mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    How would you like to connect your {connectingTo.charAt(0).toUpperCase() + connectingTo.slice(1)} account?
                  </p>

                  {/* Live Browser Option - Best for mobile */}
                  <button
                    onClick={() => {
                      haptics.medium();
                      setShowLiveBrowser(true);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                      isLight
                        ? 'border-gold bg-gold/5 hover:bg-gold/10'
                        : 'border-gold/50 bg-gold/10 hover:bg-gold/20'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                      <Monitor size={24} className="text-gold" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Live Browser Login
                      </div>
                      <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Login directly in-app (recommended)
                      </div>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold">
                      NEW
                    </div>
                  </button>

                  {/* Browser Login Option - Opens site in new tab */}
                  <button
                    onClick={() => handleBrowserLogin()}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] ${
                      isLight
                        ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isLight ? 'bg-slate-200' : 'bg-white/10'
                    }`}>
                      <Chrome size={24} className={isLight ? 'text-slate-600' : 'text-slate-400'} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Open in Browser
                      </div>
                      <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Login in separate tab, then import
                      </div>
                    </div>
                    <ExternalLink size={18} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                  </button>

                  {/* Credentials Option */}
                  <button
                    onClick={() => setLoginMethod('credentials')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] ${
                      isLight
                        ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isLight ? 'bg-slate-200' : 'bg-white/10'
                    }`}>
                      <Mail size={24} className={isLight ? 'text-slate-600' : 'text-slate-400'} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Email & Password
                      </div>
                      <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Use your {connectingTo} login credentials
                      </div>
                    </div>
                    <ChevronRight size={18} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                  </button>

                  {/* Cookie Import Option */}
                  <button
                    onClick={() => setLoginMethod('cookies')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] ${
                      isLight
                        ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isLight ? 'bg-slate-200' : 'bg-white/10'
                    }`}>
                      <Cookie size={24} className={isLight ? 'text-slate-600' : 'text-slate-400'} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Import Cookies
                      </div>
                      <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Export from your browser (advanced)
                      </div>
                    </div>
                    <ChevronRight size={18} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                  </button>
                </div>
              )}

              {/* Credentials Form */}
              {loginMethod === 'credentials' && (
                <>
                  <button
                    onClick={() => setLoginMethod('choose')}
                    className={`flex items-center gap-1 text-sm mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    Back to options
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 rounded-xl text-base ${
                          isLight
                            ? 'bg-slate-100 text-slate-900 placeholder:text-slate-400'
                            : 'bg-white/10 text-white placeholder:text-slate-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 pr-12 rounded-xl text-base ${
                            isLight
                              ? 'bg-slate-100 text-slate-900 placeholder:text-slate-400'
                              : 'bg-white/10 text-white placeholder:text-slate-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${
                            isLight ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-3 p-2.5 rounded-xl text-xs ${isLight ? 'bg-gold/10 text-amber-700' : 'bg-gold/10 text-gold/80'}`}>
                    🔒 Your credentials are encrypted and stored securely
                  </div>

                  <button
                    onClick={handleSaveCredentials}
                    disabled={saving}
                    className="w-full mt-4 py-3.5 bg-gold text-black font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Account'
                    )}
                  </button>
                </>
              )}

              {/* Browser Login Pending - User opened site in new tab */}
              {loginMethod === 'browser-login-pending' && (
                <>
                  <button
                    onClick={() => setLoginMethod('choose')}
                    className={`flex items-center gap-1 text-sm mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    Back to options
                  </button>

                  <div className="space-y-4">
                    {/* Success indicator */}
                    <div className={`p-4 rounded-xl text-center ${isLight ? 'bg-emerald-50' : 'bg-emerald-900/20'}`}>
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                        <ExternalLink size={24} className="text-emerald-500" />
                      </div>
                      <p className={`font-semibold ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                        {connectingTo?.charAt(0).toUpperCase()}{connectingTo?.slice(1)} opened in your browser
                      </p>
                      <p className={`text-sm mt-1 ${isLight ? 'text-emerald-700' : 'text-emerald-300/80'}`}>
                        Complete the login there
                      </p>
                    </div>

                    {/* Mobile limitation notice */}
                    <div className={`p-4 rounded-xl ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-900/20 border border-amber-500/30'}`}>
                      <p className={`font-semibold mb-2 flex items-center gap-2 ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                        📱 On a Phone?
                      </p>
                      <p className={`text-sm ${isLight ? 'text-amber-700' : 'text-amber-300/80'}`}>
                        Mobile browsers can't export cookies. For the best experience, <strong>connect your accounts from a computer</strong> first.
                        Your connection will sync to all devices automatically.
                      </p>
                    </div>

                    {/* Desktop instructions */}
                    <div className={`p-4 rounded-xl ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'}`}>
                      <p className={`font-semibold mb-3 ${isLight ? 'text-blue-800' : 'text-blue-300'}`}>
                        💻 On Desktop? Here's what to do:
                      </p>
                      <ol className={`space-y-2 text-sm ${isLight ? 'text-blue-700' : 'text-blue-200/80'}`}>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                          <span>Sign in to {connectingTo} in the browser</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                          <span>Install "Cookie-Editor" extension (Chrome/Firefox)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                          <span>Click the extension → Export as JSON</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">4</span>
                          <span>Come back here and paste</span>
                        </li>
                      </ol>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const loginUrls: Record<string, string> = {
                            indeed: 'https://secure.indeed.com/account/login',
                            linkedin: 'https://www.linkedin.com/login',
                            ziprecruiter: 'https://www.ziprecruiter.com/authn/login',
                            glassdoor: 'https://www.glassdoor.com/profile/login_input.htm',
                          };
                          window.open(loginUrls[connectingTo || 'indeed'] || `https://www.${connectingTo}.com/login`, '_blank');
                        }}
                        className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                          isLight
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        <ExternalLink size={16} />
                        Open Again
                      </button>
                      <button
                        onClick={() => setLoginMethod('cookies')}
                        className="flex-1 py-3 bg-gold text-black font-semibold rounded-xl flex items-center justify-center gap-2"
                      >
                        <ClipboardPaste size={16} />
                        Paste Cookies
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Cookie Import Form */}
              {loginMethod === 'cookies' && (
                <>
                  <button
                    onClick={() => setLoginMethod('choose')}
                    className={`flex items-center gap-1 text-sm mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    Back to options
                  </button>

                  <div className="space-y-4">
                    {/* Instructions */}
                    <div className={`p-3 rounded-xl text-sm ${isLight ? 'bg-blue-50 text-blue-800' : 'bg-blue-900/30 text-blue-200'}`}>
                      <p className="font-medium mb-2">How to export cookies:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Install "Cookie-Editor" or "EditThisCookie" browser extension</li>
                        <li>Go to <a href={`https://www.${connectingTo}.com`} target="_blank" rel="noopener" className="underline">www.{connectingTo}.com</a> and log in</li>
                        <li>Click the extension icon → "Export" (JSON format)</li>
                        <li>Paste the JSON below</li>
                      </ol>
                    </div>

                    {/* Textarea for cookies */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Paste Cookies JSON
                      </label>
                      <textarea
                        value={cookiesJson}
                        onChange={e => setCookiesJson(e.target.value)}
                        placeholder='[{"name":"session","value":"...","domain":".indeed.com",...}]'
                        rows={6}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-mono ${
                          isLight
                            ? 'bg-slate-100 text-slate-900 placeholder:text-slate-400'
                            : 'bg-white/10 text-white placeholder:text-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`mt-3 p-2.5 rounded-xl text-xs ${isLight ? 'bg-gold/10 text-amber-700' : 'bg-gold/10 text-gold/80'}`}>
                    🔒 Cookies are stored securely on our servers
                  </div>

                  <button
                    onClick={handleImportCookies}
                    disabled={importingCookies || !cookiesJson.trim()}
                    className="w-full mt-4 py-3.5 bg-gold text-black font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {importingCookies ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <ClipboardPaste size={18} />
                        Import Cookies
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reality & Challenges - Unified glassmorphism style with gold accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.075 }}
        className={`p-4 rounded-2xl mb-4 ${glassPanel}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-base">🌟</span> Your Reality & Challenges
          </h3>
        </div>

        {/* Challenges Tags */}
        {(userProfile as any)?.selectedPrompts?.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {(userProfile as any).selectedPrompts.map((challenge: string, idx: number) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  isLight
                    ? 'bg-gold/10 text-amber-700 border border-gold/20'
                    : 'bg-gold/20 text-gold border border-gold/30'
                }`}
              >
                {challenge}
              </span>
            ))}
          </div>
        ) : (
          <p className={`text-sm mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            No challenges added yet. We use this to find accommodating employers.
          </p>
        )}

        {/* Reality Context */}
        {((userProfile as any)?.realityContext || (userProfile as any)?.realityChallenges) && (
          <div className={`p-3 rounded-xl ${isLight ? 'bg-slate-100' : 'bg-slate-800/50'}`}>
            <p className={`text-xs italic ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              "{(userProfile as any).realityContext || (userProfile as any).realityChallenges}"
            </p>
          </div>
        )}

        {/* Info Tip */}
        <div className={`flex items-start gap-2 mt-3 p-2.5 rounded-xl ${isLight ? 'bg-gold/10' : 'bg-gold/10'}`}>
          <span className="text-gold text-sm">💡</span>
          <p className={`text-xs ${isLight ? 'text-amber-700' : 'text-gold/80'}`}>
            We use this to find jobs with flexible scheduling, second-chance hiring, and other accommodations.
          </p>
        </div>
      </motion.div>

      {/* Settings - Glassmorphism style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-4 rounded-2xl mb-4 ${glassPanel}`}
      >
        <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          Settings
        </h3>
        <div className="space-y-1">
          {settingsItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                haptics.light();
                if (item.onToggle) item.onToggle();
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
                isLight ? 'hover:bg-slate-50 active:bg-slate-100' : 'hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isLight ? 'bg-slate-100' : 'bg-white/10'
              }`}>
                <item.icon size={18} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
              </div>
              <span className={`flex-1 text-left font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                {item.label}
              </span>
              {item.toggle ? (
                <div
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                    item.value ? 'bg-gold' : isLight ? 'bg-slate-200' : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    className="w-6 h-6 rounded-full bg-white shadow-sm"
                    animate={{ x: item.value ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              ) : (
                <ChevronRight size={18} className={isLight ? 'text-slate-400' : 'text-slate-400'} />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Sign Out - Subtle danger styling */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={handleSignOut}
        className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl active:scale-[0.98] transition-all ${
          isLight
            ? 'bg-red-50/80 backdrop-blur-sm text-red-600 border border-red-100'
            : 'bg-red-500/10 backdrop-blur-sm text-red-400 border border-red-500/20'
        }`}
      >
        <LogOut size={18} />
        <span className="font-medium">Sign Out</span>
      </motion.button>

      {/* Version Info - Gold accent */}
      <p className={`text-center text-xs mt-4 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
        JalaneaWorks v1.0.0 • Made with <span className="text-gold">💛</span>
      </p>

      {/* Live Browser Modal */}
      <AnimatePresence>
        {showLiveBrowser && connectingTo && currentUser?.uid && (
          <LiveBrowser
            siteId={connectingTo}
            siteName={sites.find(s => s.id === connectingTo)?.name || connectingTo}
            userId={currentUser.uid}
            onClose={() => {
              setShowLiveBrowser(false);
              setConnectingTo(null);
              setLoginMethod('choose');
            }}
            onConnected={async () => {
              // Refresh credentials after successful connection
              haptics.success();
              setSiteSuccess(`${connectingTo} connected successfully!`);
              try {
                const credsData = await getSiteCredentials(currentUser.uid);
                setCredentials(credsData);
              } catch (err) {
                console.log('Error refreshing credentials:', err);
              }
              setShowLiveBrowser(false);
              setConnectingTo(null);
              setLoginMethod('choose');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileProfile;
