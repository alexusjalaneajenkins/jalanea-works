
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UserProfile } from '../types';
import { GraduationCap, Briefcase, Award, PenTool, Edit3, Bell, Mail, MessageSquare, Smartphone, CheckCircle, AlertCircle, Loader, Zap, Crown, ExternalLink, Link2, Clock, CheckCircle2, XCircle, Rocket } from 'lucide-react';
import { isPushSupported, registerForPushNotifications, getPushPermissionStatus } from '../services/notificationService';
import { updateNotificationPreferences, NotificationPreferences, getProfile } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import {
  getPricingTiers,
  getDashboardStats,
  getApplicationHistory,
  createCheckoutSession,
  createPortalSession,
  getJobSites,
  Tier,
  DashboardStats,
  JobApplication,
  JobSite,
} from '../services/cloudAgentService';

// Mock Profile Data matching the screenshot
export const MOCK_PROFILE: UserProfile = {
  fullName: "Alex Doe",
  name: "Alex Doe",
  email: "alex.doe@valenciacollege.edu",
  location: "Orlando, FL",
  photoURL: "", // Added to match type
  education: [
    {
      degree: "Bachelor of Applied Science: Computing Technology & Software Development",
      school: "Valencia College",
      gpa: "3.93",
      year: "2024"
    },
    {
      degree: "Associate of Science: Graphic and Interactive Design",
      school: "Valencia College",
      gpa: "3.89",
      year: "2022"
    },
    {
      degree: "Associate of Arts: General Studies",
      school: "Valencia College",
      gpa: "3.88",
      year: "2020"
    }
  ],
  experience: [
    {
      role: "Junior UI/UX Design Intern",
      company: "PETE Learning",
      duration: "Jun 2024 - Aug 2024",
      description: [
        "Served as Junior UI/UX Designer to enhance PETE Learning's platforms with a fresh perspective.",
        "Identified navigation challenges and proposed a new tooltip system to reduce user confusion.",
        "Designed three tooltip variations (text, image, video) and documented their pros, cons, benefits, and use cases.",
        "Created animated UI mockups and delivered a full proposal directly to the President of the company.",
        "Contributed UI updates and quality of life improvements to PETE Learning's course builder."
      ]
    },
    {
      role: "Kid Coordinator (Imagination Station)",
      company: "Mosaic Church",
      duration: "Jun 2024 - Aug 2024",
      description: [
        "Coordinated 9 rotating activity stations for over 120 children during Mosaic Church's summer program.",
        "Developed hands-on learning activities using various materials to engage kids creatively.",
        "Adapted lessons in real-time to ensure all children received individual attention and support.",
        "Collaborated with a team of volunteers to maintain a safe and fun environment."
      ]
    }
  ],
  skills: {
    technical: ["Java", "SQL", "Docker", "HTML/CSS/JS", "SDLC", "Database Management", "VS Code", "GitHub"],
    design: ["Figma", "Adobe Creative Suite (Ps, Ai, Id, Ae)", "User Journey Mapping", "Wireframing"],
    soft: ["Conflict Resolution", "Adaptability", "Empathy", "Team Leadership", "High-Volume Cash Handling"]
  },
  certifications: [
    { name: "Graphics Interactive Design Production", issuer: "Valencia College" },
    { name: "Interactive Design Support", issuer: "Valencia College" },
    { name: "Microsoft Office Specialist (Word, Excel, PowerPoint)", issuer: "Microsoft" },
    { name: "Entrepreneurship & Small Business", issuer: "Microsoft" }
  ],
  preferences: {
    targetRoles: [],
    workStyles: [],
    learningStyle: ['Both'],
    transportMode: ['Car'],
    salary: 0
  },
  logistics: {
    isParent: false,
    employmentStatus: 'Part-time'
  },
  onboardingCompleted: true,
  updatedAt: new Date().toISOString()
};

// Subscription Plan Component
const SubscriptionPlan: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const [statsData, tiersData] = await Promise.all([
          getDashboardStats(currentUser.uid),
          getPricingTiers(),
        ]);
        setStats(statsData);
        setTiers(tiersData);
      } catch (err) {
        console.error('Error loading subscription data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleUpgrade = async (tier: 'starter' | 'pro' | 'unlimited') => {
    if (!currentUser?.uid || !currentUser?.email) return;
    setUpgrading(true);
    try {
      const { url } = await createCheckoutSession(currentUser.uid, currentUser.email, tier);
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout:', err);
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!currentUser?.uid || !currentUser?.email) return;
    setUpgrading(true);
    try {
      const { url } = await createPortalSession(currentUser.uid, currentUser.email);
      window.location.href = url;
    } catch (err) {
      console.error('Error opening portal:', err);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <Card variant="solid-white" className="overflow-hidden">
        <div className="p-6 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-jalanea-400" />
        </div>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card variant="solid-white" className="overflow-hidden">
        <div className="border-b border-jalanea-100 p-6 bg-gradient-to-r from-jalanea-50 to-accent/5">
          <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
            <Rocket size={16} /> AI Job Agent
          </h3>
        </div>
        <div className="p-6 text-center text-jalanea-600">
          <p>Sign in to access the AI Job Agent</p>
        </div>
      </Card>
    );
  }

  const currentTier = tiers.find(t => t.id === (stats?.subscriptionTier || 'free'));
  const usagePercent = stats ? (stats.applicationsThisMonth / stats.applicationsLimit) * 100 : 0;

  return (
    <Card variant="solid-white" className="overflow-hidden">
      <div className="border-b border-jalanea-100 p-6 bg-gradient-to-r from-jalanea-50 to-accent/5">
        <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
          <Rocket size={16} /> AI Job Agent
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${currentTier?.id === 'free' ? 'bg-jalanea-100' : 'bg-accent/10'}`}>
              {currentTier?.id === 'free' ? <Zap size={24} className="text-jalanea-600" /> : <Crown size={24} className="text-accent" />}
            </div>
            <div>
              <h4 className="font-bold text-jalanea-900">{currentTier?.name || 'Free'} Plan</h4>
              <p className="text-sm text-jalanea-500">
                {currentTier?.id === 'free' ? 'Basic job automation' : `${currentTier?.applicationsPerMonth} applications/month`}
              </p>
            </div>
          </div>
          {stats?.subscriptionTier !== 'free' && (
            <Button size="sm" variant="outline" onClick={handleManageBilling} disabled={upgrading}>
              <ExternalLink size={14} className="mr-1" /> Manage
            </Button>
          )}
        </div>

        {/* Usage Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-jalanea-600">Applications this month</span>
            <span className="font-bold text-jalanea-900">
              {stats?.applicationsThisMonth || 0} / {stats?.applicationsLimit || 10}
            </span>
          </div>
          <div className="h-2 bg-jalanea-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-accent'}`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-jalanea-50 rounded-lg">
            <p className="text-2xl font-bold text-jalanea-900">{stats?.totalApplied || 0}</p>
            <p className="text-xs text-jalanea-500">Total Applied</p>
          </div>
          <div className="text-center p-3 bg-jalanea-50 rounded-lg">
            <p className="text-2xl font-bold text-jalanea-900">{stats?.pendingApplications || 0}</p>
            <p className="text-xs text-jalanea-500">In Queue</p>
          </div>
          <div className="text-center p-3 bg-jalanea-50 rounded-lg">
            <p className="text-2xl font-bold text-jalanea-900">{stats?.connectedSites || 0}</p>
            <p className="text-xs text-jalanea-500">Sites Connected</p>
          </div>
        </div>

        {/* Upgrade Options (only show for free/starter users) */}
        {(stats?.subscriptionTier === 'free' || stats?.subscriptionTier === 'starter') && (
          <div className="pt-4 border-t border-jalanea-100">
            <h4 className="text-sm font-bold text-jalanea-900 mb-3">Upgrade for more applications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tiers.filter(t => t.id !== 'free' && t.id !== stats?.subscriptionTier).map(tier => (
                <button
                  key={tier.id}
                  onClick={() => handleUpgrade(tier.id as 'starter' | 'pro' | 'unlimited')}
                  disabled={upgrading}
                  className="p-4 rounded-lg border-2 border-jalanea-100 hover:border-accent hover:bg-accent/5 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-jalanea-900">{tier.name}</span>
                    <span className="text-accent font-bold">${tier.price}/mo</span>
                  </div>
                  <p className="text-xs text-jalanea-500">{tier.applicationsPerMonth} apps/month</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Application History Component
const ApplicationHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const data = await getApplicationHistory(currentUser.uid, { limit: 10 });
        setApplications(data);
      } catch (err) {
        console.error('Error loading applications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [currentUser]);

  if (loading) {
    return (
      <Card variant="solid-white" className="overflow-hidden">
        <div className="p-6 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-jalanea-400" />
        </div>
      </Card>
    );
  }

  if (!currentUser) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'pending':
      case 'in_progress':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-jalanea-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'skipped':
        return 'Skipped';
      default:
        return status;
    }
  };

  return (
    <Card variant="solid-white" className="overflow-hidden">
      <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
        <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
          <Briefcase size={16} /> Recent Applications
        </h3>
      </div>
      <div className="divide-y divide-jalanea-100">
        {applications.length === 0 ? (
          <div className="p-6 text-center text-jalanea-500">
            <p>No applications yet. Connect a job site to get started!</p>
          </div>
        ) : (
          applications.map(app => (
            <div key={app.id} className="p-4 hover:bg-jalanea-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-jalanea-900 truncate">{app.job_title}</h4>
                  <p className="text-sm text-jalanea-600">{app.company_name || 'Unknown Company'}</p>
                  {app.job_location && (
                    <p className="text-xs text-jalanea-400 mt-1">{app.job_location}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {getStatusIcon(app.status)}
                  <span className={`text-xs font-medium ${
                    app.status === 'applied' ? 'text-green-600' :
                    app.status === 'failed' ? 'text-red-600' :
                    'text-jalanea-500'
                  }`}>
                    {getStatusLabel(app.status)}
                  </span>
                </div>
              </div>
              {app.job_url && (
                <a
                  href={app.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-2"
                >
                  <Link2 size={12} /> View Job
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

// Site icons mapping
const SITE_ICONS: Record<string, string> = {
  indeed: '💼',
  linkedin: '💎',
  ziprecruiter: '🎯',
  glassdoor: '🚪',
};

const SITE_COLORS: Record<string, string> = {
  indeed: '#2164f3',
  linkedin: '#0a66c2',
  ziprecruiter: '#5ba829',
  glassdoor: '#0caa41',
};

// Connected Sites Component
const ConnectedSites: React.FC = () => {
  const { currentUser } = useAuth();
  const [sites, setSites] = useState<JobSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const data = await getJobSites();
        setSites(data);
      } catch (err) {
        console.error('Error loading sites:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSites();
  }, []);

  const handleConnect = (siteId: string) => {
    // For now, show instructions since the actual connection flow
    // requires the user to log in via a browser window on the server
    setConnecting(siteId);

    // Open a modal or show instructions
    alert(`To connect ${siteId.charAt(0).toUpperCase() + siteId.slice(1)}:\n\n1. The Job Agent will open a browser window\n2. Log into your account\n3. Complete any CAPTCHAs\n4. Your session will be saved for automation\n\nThis feature requires the desktop app or running the agent locally.`);
    setConnecting(null);
  };

  if (loading) {
    return (
      <Card variant="solid-white" className="overflow-hidden">
        <div className="p-6 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-jalanea-400" />
        </div>
      </Card>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Card variant="solid-white" className="overflow-hidden">
      <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
        <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
          <Link2 size={16} /> Connected Job Sites
        </h3>
      </div>
      <div className="p-6">
        <p className="text-sm text-jalanea-600 mb-4">
          Connect your job site accounts to enable automatic applications.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sites.map(site => (
            <div
              key={site.id}
              className="flex items-center justify-between p-4 rounded-lg border border-jalanea-100 hover:border-jalanea-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${SITE_COLORS[site.id] || '#666'}15` }}
                >
                  {SITE_ICONS[site.id] || '🔗'}
                </div>
                <div>
                  <h4 className="font-medium text-jalanea-900">{site.name}</h4>
                  <p className="text-xs text-jalanea-500">Not connected</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConnect(site.id)}
                disabled={connecting === site.id}
              >
                {connecting === site.id ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  'Connect'
                )}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-jalanea-400 mt-4 text-center">
          Your login credentials are never stored. We only save session cookies for automation.
        </p>
      </div>
    </Card>
  );
};

// Notification Preferences Component
const NotificationSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfile(currentUser.uid);
        if (profile?.notification_preferences) {
          setPreferences(profile.notification_preferences as NotificationPreferences);
        } else {
          // Default preferences
          setPreferences({
            push_enabled: false,
            email_enabled: true,
            sms_enabled: false,
            notify_on_application: true,
            notify_on_success: true,
            notify_on_failure: true,
            notify_daily_summary: true
          });
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [currentUser]);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!currentUser?.uid || !preferences) return;

    // Special handling for push notifications
    if (key === 'push_enabled' && !preferences.push_enabled) {
      if (!isPushSupported()) {
        setError('Push notifications are not supported in this browser');
        return;
      }

      setSaving(true);
      const registered = await registerForPushNotifications(currentUser.uid);
      setSaving(false);

      if (!registered) {
        setError('Could not enable push notifications. Please allow notifications in your browser settings.');
        return;
      }

      setPreferences({ ...preferences, push_enabled: true });
      return;
    }

    const newValue = !preferences[key];
    const updates = { [key]: newValue };

    setPreferences({ ...preferences, ...updates });
    setSaving(true);
    setError(null);

    try {
      await updateNotificationPreferences(currentUser.uid, updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to save preferences');
      setPreferences({ ...preferences }); // Revert
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card variant="solid-white" className="overflow-hidden">
        <div className="p-6 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-jalanea-400" />
        </div>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card variant="solid-white" className="overflow-hidden">
        <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
          <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
            <Bell size={16} /> Notifications
          </h3>
        </div>
        <div className="p-6 text-center text-jalanea-600">
          <p>Sign in to manage notification preferences</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="solid-white" className="overflow-hidden">
      <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
        <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
          <Bell size={16} /> Notification Preferences
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Status messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            <CheckCircle size={16} />
            Preferences saved!
          </div>
        )}

        {/* Notification Channels */}
        <div>
          <h4 className="text-xs font-bold text-jalanea-900 mb-4">Notification Channels</h4>
          <div className="space-y-3">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-3 bg-jalanea-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-jalanea-600" />
                <div>
                  <p className="text-sm font-medium text-jalanea-900">Push Notifications</p>
                  <p className="text-xs text-jalanea-500">Get instant alerts on your device</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('push_enabled')}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences?.push_enabled ? 'bg-accent' : 'bg-jalanea-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    preferences?.push_enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-3 bg-jalanea-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-jalanea-600" />
                <div>
                  <p className="text-sm font-medium text-jalanea-900">Email Notifications</p>
                  <p className="text-xs text-jalanea-500">Receive updates in your inbox</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('email_enabled')}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences?.email_enabled ? 'bg-accent' : 'bg-jalanea-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    preferences?.email_enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-3 bg-jalanea-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-jalanea-600" />
                <div>
                  <p className="text-sm font-medium text-jalanea-900">SMS Notifications</p>
                  <p className="text-xs text-jalanea-500">Get text messages for important updates</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('sms_enabled')}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences?.sms_enabled ? 'bg-accent' : 'bg-jalanea-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    preferences?.sms_enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h4 className="text-xs font-bold text-jalanea-900 mb-4">What to Notify</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 hover:bg-jalanea-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-jalanea-900">Application Started</p>
                <p className="text-xs text-jalanea-500">When job search begins</p>
              </div>
              <button
                onClick={() => handleToggle('notify_on_application')}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences?.notify_on_application ? 'bg-accent' : 'bg-jalanea-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    preferences?.notify_on_application ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-jalanea-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-jalanea-900">Successful Applications</p>
                <p className="text-xs text-jalanea-500">When you've applied to a job</p>
              </div>
              <button
                onClick={() => handleToggle('notify_on_success')}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences?.notify_on_success ? 'bg-accent' : 'bg-jalanea-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    preferences?.notify_on_success ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-jalanea-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-jalanea-900">Failed Applications</p>
                <p className="text-xs text-jalanea-500">When something goes wrong</p>
              </div>
              <button
                onClick={() => handleToggle('notify_on_failure')}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences?.notify_on_failure ? 'bg-accent' : 'bg-jalanea-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    preferences?.notify_on_failure ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-jalanea-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-jalanea-900">Daily Summary</p>
                <p className="text-xs text-jalanea-500">Recap of the day's applications</p>
              </div>
              <button
                onClick={() => handleToggle('notify_daily_summary')}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences?.notify_daily_summary ? 'bg-accent' : 'bg-jalanea-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    preferences?.notify_daily_summary ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-jalanea-400 text-center pt-4">
          Important alerts (like session expiry) will always be sent regardless of settings.
        </p>
      </div>
    </Card>
  );
};

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-jalanea-200 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-jalanea-900">Profile Manager</h1>
          <p className="text-jalanea-600 font-medium mt-1">Manage your Experience, Education, and Skills</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-jalanea-900">My Career Data</h2>
        <Button size="sm" icon={<Edit3 size={16} />}>Edit Profile</Button>
      </div>

      <div className="space-y-6">

        {/* Education Section */}
        <Card variant="solid-white" className="overflow-hidden">
          <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
            <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap size={16} /> Education
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {MOCK_PROFILE.education.map((edu, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-3 hover:bg-jalanea-50 rounded-lg transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-jalanea-900">{edu.degree}</h4>
                  <p className="text-sm text-jalanea-600">{edu.school}</p>
                </div>
                {edu.gpa && (
                  <span className="mt-2 md:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold/10 text-jalanea-800 border border-gold/20">
                    {edu.gpa} GPA
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Experience Section */}
        <Card variant="solid-white" className="overflow-hidden">
          <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
            <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} /> Experience
            </h3>
          </div>
          <div className="p-6 space-y-8">
            {MOCK_PROFILE.experience.map((exp, idx) => (
              <div key={idx} className="relative pl-6 border-l-2 border-jalanea-200 last:border-0 pb-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-jalanea-50 border-2 border-jalanea-300 rounded-full"></div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                  <h4 className="text-base font-bold text-jalanea-900">{exp.role} <span className="text-jalanea-400 font-normal">at</span> {exp.company}</h4>
                  <span className="text-xs font-bold text-jalanea-500 bg-jalanea-100 px-2 py-1 rounded">{exp.duration}</span>
                </div>
                <ul className="space-y-1.5 mt-3">
                  {exp.description.map((point, i) => (
                    <li key={i} className="text-sm text-jalanea-700 leading-relaxed flex items-start gap-2">
                      <span className="text-jalanea-400 mt-1.5 text-[8px]">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Section */}
          <Card variant="solid-white" className="h-full">
            <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                <PenTool size={16} /> Skills
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-jalanea-900 mb-2">Technical</h4>
                <div className="flex flex-wrap gap-2">
                  {MOCK_PROFILE.skills.technical.map(skill => (
                    <span key={skill} className="text-xs font-medium px-2 py-1 bg-jalanea-50 text-jalanea-700 rounded border border-jalanea-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-jalanea-900 mb-2">Design</h4>
                <div className="flex flex-wrap gap-2">
                  {MOCK_PROFILE.skills.design.map(skill => (
                    <span key={skill} className="text-xs font-medium px-2 py-1 bg-jalanea-50 text-jalanea-700 rounded border border-jalanea-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-jalanea-900 mb-2">Soft Skills</h4>
                <div className="text-sm text-jalanea-600 leading-relaxed">
                  {MOCK_PROFILE.skills.soft.join(", ")}
                </div>
              </div>
            </div>
          </Card>

          {/* Licenses & Certs Section */}
          <Card variant="solid-white" className="h-full">
            <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                <Award size={16} /> Licenses & Certs
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {MOCK_PROFILE.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1">
                    <Award size={16} className="text-gold" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-jalanea-900">{cert.name}</h4>
                    <p className="text-xs text-jalanea-500">{cert.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Job Agent Section */}
        <div className="pt-8 border-t border-jalanea-200">
          <h2 className="text-xl font-bold text-jalanea-900 mb-6">AI Job Agent</h2>
          <div className="space-y-6">
            <SubscriptionPlan />
            <ConnectedSites />
            <ApplicationHistory />
          </div>
        </div>

        {/* Notification Preferences */}
        <NotificationSettings />

      </div>
    </div>
  );
};
