/**
 * WebViewLogin Component
 *
 * Handles job site authentication for the SaaS platform.
 *
 * Flow:
 * 1. User clicks "Connect" on a job site
 * 2. Opens a secure login modal with the job site
 * 3. User logs in with their credentials
 * 4. Cookies are captured and stored encrypted in Supabase
 * 5. Cloud workers can now use these sessions
 *
 * Security:
 * - Credentials never touch our servers
 * - Session cookies are encrypted per-user
 * - Only cookie data is stored (no passwords)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ExternalLink, CheckCircle, AlertCircle, Loader, Shield, Smartphone, Globe } from 'lucide-react';

interface WebViewLoginProps {
  siteId: string;
  siteName: string;
  siteIcon: string;
  loginUrl: string;
  onSuccess: (sessionData: string) => void;
  onCancel: () => void;
  cloudAgentUrl?: string;
}

interface LoginMethod {
  id: 'popup' | 'agent' | 'manual';
  title: string;
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
}

const WebViewLogin: React.FC<WebViewLoginProps> = ({
  siteId,
  siteName,
  siteIcon,
  loginUrl,
  onSuccess,
  onCancel,
  cloudAgentUrl = import.meta.env.VITE_CLOUD_AGENT_URL || 'http://localhost:3001'
}) => {
  const [step, setStep] = useState<'method' | 'popup' | 'agent' | 'manual' | 'verifying' | 'success' | 'error'>('method');
  const [error, setError] = useState<string | null>(null);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [agentStatus, setAgentStatus] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // Available login methods
  const loginMethods: LoginMethod[] = [
    {
      id: 'popup',
      title: 'Quick Login',
      description: `Log in to ${siteName} in a popup. We'll detect when you're done.`,
      icon: <Globe className="w-6 h-6" />,
      recommended: true
    },
    {
      id: 'agent',
      title: 'Guided Login',
      description: 'Our secure browser guides you through login step-by-step.',
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'manual',
      title: 'Already Logged In',
      description: `I'm already logged into ${siteName} on this device.`,
      icon: <Smartphone className="w-6 h-6" />
    }
  ];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [popupWindow]);

  // Handle popup login flow
  const startPopupLogin = useCallback(() => {
    setStep('popup');

    // Open login page in popup
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      loginUrl,
      `${siteName}Login`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=yes,status=yes`
    );

    if (!popup) {
      setError('Popup blocked. Please allow popups and try again.');
      setStep('error');
      return;
    }

    setPopupWindow(popup);

    // Poll to check when popup is closed
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        // User closed popup, verify login status via agent
        verifyLoginWithAgent();
      }
    }, 500);
  }, [loginUrl, siteName]);

  // Handle agent-guided login
  const startAgentLogin = useCallback(async () => {
    setStep('agent');
    setAgentStatus('Starting secure browser...');

    // Connect to WebSocket for real-time updates
    const ws = new WebSocket(cloudAgentUrl.replace('http', 'ws') + '/ws');
    wsRef.current = ws;

    ws.onopen = async () => {
      try {
        // Launch the browser for this site
        const response = await fetch(`${cloudAgentUrl}/sites/${siteId}/launch`, {
          method: 'POST'
        });

        if (!response.ok) {
          throw new Error('Failed to launch browser');
        }

        setAgentStatus('Browser opened. Please log in to ' + siteName);
      } catch (err) {
        setError('Failed to start secure browser. Please try another method.');
        setStep('error');
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'status') {
          setAgentStatus(data.message);
        }

        if (data.type === 'login_complete') {
          // Login detected, session cookies captured
          if (data.sessionData) {
            handleLoginSuccess(data.sessionData);
          } else {
            verifyLoginWithAgent();
          }
        }

        if (data.type === 'error') {
          setError(data.message);
          setStep('error');
        }
      } catch (e) {
        // Not JSON, ignore
      }
    };

    ws.onerror = () => {
      setError('Connection lost. Please try again.');
      setStep('error');
    };
  }, [cloudAgentUrl, siteId, siteName]);

  // Handle "already logged in" flow
  const handleAlreadyLoggedIn = useCallback(() => {
    setStep('manual');
    // Launch the agent to check if they're really logged in
    verifyLoginWithAgent();
  }, []);

  // Verify login status with the agent
  const verifyLoginWithAgent = useCallback(async () => {
    setStep('verifying');

    try {
      // First, launch the browser to navigate to the site
      const launchResponse = await fetch(`${cloudAgentUrl}/sites/${siteId}/launch`, {
        method: 'POST'
      });

      if (!launchResponse.ok) {
        throw new Error('Failed to launch browser');
      }

      // Wait a moment for navigation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check login status
      const statusResponse = await fetch(`${cloudAgentUrl}/sites/${siteId}/login-status`);
      const statusData = await statusResponse.json();

      if (statusData.isLoggedIn) {
        // Get session data (cookies)
        const sessionResponse = await fetch(`${cloudAgentUrl}/sites/${siteId}/session`);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          handleLoginSuccess(JSON.stringify(sessionData));
        } else {
          // Even without session data, we can mark as connected
          handleLoginSuccess('verified');
        }
      } else {
        setError(`Not logged into ${siteName}. Please log in and try again.`);
        setStep('error');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Could not verify login. Please try again.');
      setStep('error');
    }
  }, [cloudAgentUrl, siteId, siteName]);

  // Handle successful login
  const handleLoginSuccess = useCallback((sessionData: string) => {
    setStep('success');

    // Wait a moment to show success, then callback
    setTimeout(() => {
      onSuccess(sessionData);
    }, 1500);
  }, [onSuccess]);

  // Method selection screen
  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{siteIcon}</div>
        <h2 className="text-xl font-semibold text-gray-100">Connect {siteName}</h2>
        <p className="text-gray-400 text-sm mt-1">
          Choose how you'd like to connect your account
        </p>
      </div>

      <div className="space-y-3">
        {loginMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => {
              if (method.id === 'popup') startPopupLogin();
              else if (method.id === 'agent') startAgentLogin();
              else handleAlreadyLoggedIn();
            }}
            className={`
              w-full p-4 rounded-lg text-left flex items-start gap-4 transition-all
              ${method.recommended
                ? 'bg-accent/20 border-2 border-accent hover:bg-accent/30'
                : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
              }
            `}
          >
            <div className={`
              p-2 rounded-lg
              ${method.recommended ? 'bg-accent/30 text-accent' : 'bg-gray-700 text-gray-300'}
            `}>
              {method.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-100">{method.title}</span>
                {method.recommended && (
                  <span className="text-xs bg-accent/30 text-accent px-2 py-0.5 rounded">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{method.description}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your login credentials are never stored. Only session cookies are saved securely.
      </p>
    </div>
  );

  // Popup waiting screen
  const renderPopupWaiting = () => (
    <div className="text-center space-y-4">
      <Loader className="w-12 h-12 text-accent mx-auto animate-spin" />
      <h3 className="text-lg font-medium text-gray-100">
        Logging into {siteName}...
      </h3>
      <p className="text-gray-400">
        Complete your login in the popup window. We'll detect when you're done.
      </p>
      <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
        <p>Can't see the popup?</p>
        <button
          onClick={startPopupLogin}
          className="text-accent hover:underline mt-1"
        >
          Click here to try again
        </button>
      </div>
    </div>
  );

  // Agent login screen
  const renderAgentLogin = () => (
    <div className="text-center space-y-4">
      <Shield className="w-12 h-12 text-accent mx-auto" />
      <h3 className="text-lg font-medium text-gray-100">Guided Login</h3>
      <p className="text-gray-400">{agentStatus}</p>
      <div className="bg-gray-800 rounded-lg p-4 text-sm">
        <p className="text-gray-300">A secure browser window has opened.</p>
        <p className="text-gray-400 mt-2">
          Log in normally - we'll capture your session once you're signed in.
        </p>
      </div>
    </div>
  );

  // Verifying screen
  const renderVerifying = () => (
    <div className="text-center space-y-4">
      <Loader className="w-12 h-12 text-accent mx-auto animate-spin" />
      <h3 className="text-lg font-medium text-gray-100">Verifying Connection</h3>
      <p className="text-gray-400">
        Checking your {siteName} login status...
      </p>
    </div>
  );

  // Success screen
  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <h3 className="text-xl font-medium text-gray-100">Connected!</h3>
      <p className="text-gray-400">
        Your {siteName} account is now connected. The AI agent can apply to jobs for you.
      </p>
    </div>
  );

  // Error screen
  const renderError = () => (
    <div className="text-center space-y-4">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
      <h3 className="text-xl font-medium text-gray-100">Connection Failed</h3>
      <p className="text-gray-400">{error}</p>
      <button
        onClick={() => {
          setError(null);
          setStep('method');
        }}
        className="px-6 py-2 bg-accent text-dark rounded-lg font-medium hover:bg-accent/80"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content based on step */}
        {step === 'method' && renderMethodSelection()}
        {step === 'popup' && renderPopupWaiting()}
        {step === 'agent' && renderAgentLogin()}
        {step === 'manual' && renderVerifying()}
        {step === 'verifying' && renderVerifying()}
        {step === 'success' && renderSuccess()}
        {step === 'error' && renderError()}

        {/* Cancel button (except on success) */}
        {step !== 'success' && (
          <button
            onClick={onCancel}
            className="w-full mt-4 py-2 text-gray-400 hover:text-gray-100 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default WebViewLogin;
