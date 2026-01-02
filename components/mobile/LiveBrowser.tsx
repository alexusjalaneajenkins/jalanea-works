/**
 * LiveBrowser - Operator-style live browser viewer for mobile
 *
 * Displays a cloud browser with real-time screenshot streaming.
 * User can tap to click, type with virtual keyboard, and interact
 * just like ChatGPT Operator.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RefreshCw,
  Shield,
  ShieldOff,
  Check,
  Keyboard,
  ChevronUp,
  ChevronDown,
  Loader,
  AlertCircle,
  Wifi,
  WifiOff,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { haptics } from '../../utils/haptics';

const AGENT_API_URL = import.meta.env.VITE_CLOUD_AGENT_URL || 'http://localhost:3001';

interface LiveBrowserProps {
  siteId: string;
  siteName: string;
  userId: string;
  onClose: () => void;
  onConnected: () => void;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export const LiveBrowser: React.FC<LiveBrowserProps> = ({
  siteId,
  siteName,
  userId,
  onClose,
  onConnected,
}) => {
  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [error, setError] = useState<string | null>(null);

  // Browser view state
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ width: 390, height: 844 });
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Interaction state
  const [isTakeoverMode, setIsTakeoverMode] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [inputText, setInputText] = useState('');
  const [lastTap, setLastTap] = useState<{ x: number; y: number } | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Start streaming session
  const startSession = useCallback(async () => {
    try {
      setConnectionState('connecting');
      setError(null);

      const res = await fetch(`${AGENT_API_URL}/stream/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start session');
      }

      const data = await res.json();
      setSessionId(data.sessionId);
      setScreenshot(data.initialScreenshot);
      setViewport(data.viewport);
      setCurrentUrl(data.url);

      // Connect WebSocket for streaming
      connectWebSocket(data.sessionId);

    } catch (err) {
      console.error('[LiveBrowser] Failed to start session:', err);
      setError((err as Error).message);
      setConnectionState('error');
    }
  }, [siteId, userId]);

  // Connect WebSocket for real-time updates
  const connectWebSocket = useCallback((sid: string) => {
    const wsUrl = AGENT_API_URL.replace(/^http/, 'ws') + '/ws';
    console.log('[LiveBrowser] Connecting WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[LiveBrowser] WebSocket connected, subscribing to session');
      ws.send(JSON.stringify({ type: 'stream:subscribe', sessionId: sid }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'stream:subscribed':
            setConnectionState('connected');
            break;

          case 'stream:screenshot':
            if (!isTakeoverMode) {
              setScreenshot(data.data.image);
              setCurrentUrl(data.data.url);
              setViewport({ width: data.data.width, height: data.data.height });
            }
            break;

          case 'stream:takeover':
            setIsTakeoverMode(data.data.enabled);
            break;

          case 'stream:saved':
            haptics.success();
            onConnected();
            break;

          case 'stream:stopped':
            setConnectionState('disconnected');
            break;

          case 'error':
            console.error('[LiveBrowser] WebSocket error:', data.data.message);
            break;
        }
      } catch (err) {
        console.error('[LiveBrowser] Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      console.log('[LiveBrowser] WebSocket disconnected');
      if (connectionState === 'connected') {
        setConnectionState('disconnected');
      }
    };

    ws.onerror = (err) => {
      console.error('[LiveBrowser] WebSocket error:', err);
      setConnectionState('error');
    };
  }, [isTakeoverMode, onConnected, connectionState]);

  // Handle tap on screenshot
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!sessionId || !imageRef.current || !wsRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate tap position relative to the image
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Scale to actual browser viewport
    const scaleX = viewport.width / rect.width;
    const scaleY = viewport.height / rect.height;

    const x = Math.round(relX * scaleX);
    const y = Math.round(relY * scaleY);

    console.log(`[LiveBrowser] Tap at (${x}, ${y})`);
    haptics.light();

    // Show tap indicator
    setLastTap({ x: relX, y: relY });
    setTimeout(() => setLastTap(null), 300);

    // Send click command
    wsRef.current.send(JSON.stringify({
      type: 'stream:click',
      sessionId,
      x,
      y,
    }));

    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, [sessionId, viewport]);

  // Handle keyboard input
  const handleKeyboardSubmit = useCallback(() => {
    if (!sessionId || !wsRef.current || !inputText.trim()) return;

    haptics.light();

    wsRef.current.send(JSON.stringify({
      type: 'stream:type',
      sessionId,
      text: inputText,
    }));

    setInputText('');
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, [sessionId, inputText]);

  // Handle special keys
  const handleSpecialKey = useCallback((key: string) => {
    if (!sessionId || !wsRef.current) return;

    haptics.light();

    wsRef.current.send(JSON.stringify({
      type: 'stream:press',
      sessionId,
      key,
    }));
  }, [sessionId]);

  // Handle scroll
  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (!sessionId || !wsRef.current) return;

    haptics.light();

    wsRef.current.send(JSON.stringify({
      type: 'stream:scroll',
      sessionId,
      direction,
      amount: 300,
    }));
  }, [sessionId]);

  // Toggle takeover mode
  const toggleTakeover = useCallback(async () => {
    if (!sessionId) return;

    haptics.medium();
    const newMode = !isTakeoverMode;

    try {
      await fetch(`${AGENT_API_URL}/stream/${sessionId}/takeover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newMode }),
      });
    } catch (err) {
      console.error('[LiveBrowser] Failed to toggle takeover:', err);
    }
  }, [sessionId, isTakeoverMode]);

  // Save session
  const saveSession = useCallback(async () => {
    if (!sessionId) return;

    haptics.medium();
    setIsLoading(true);

    try {
      const res = await fetch(`${AGENT_API_URL}/stream/${sessionId}/save`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save session');
      }

      const data = await res.json();
      haptics.success();

      // Show success and close
      setTimeout(() => {
        onConnected();
        onClose();
      }, 500);

    } catch (err) {
      console.error('[LiveBrowser] Failed to save:', err);
      setError((err as Error).message);
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, onConnected, onClose]);

  // Stop session
  const stopSession = useCallback(async () => {
    if (sessionId) {
      try {
        await fetch(`${AGENT_API_URL}/stream/${sessionId}/stop`, { method: 'POST' });
      } catch (err) {
        console.error('[LiveBrowser] Failed to stop session:', err);
      }
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    onClose();
  }, [sessionId, onClose]);

  // Initialize session on mount
  useEffect(() => {
    startSession();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Focus input when keyboard opens
  useEffect(() => {
    if (showKeyboard && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showKeyboard]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button
          onClick={stopSession}
          className="p-2 -ml-2 rounded-lg text-slate-400 active:bg-slate-800"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          {connectionState === 'connected' ? (
            <Wifi size={16} className="text-green-500" />
          ) : connectionState === 'connecting' ? (
            <Loader size={16} className="text-gold animate-spin" />
          ) : (
            <WifiOff size={16} className="text-red-500" />
          )}
          <span className="text-white text-sm font-medium">{siteName}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Takeover toggle */}
          <button
            onClick={toggleTakeover}
            className={`p-2 rounded-lg transition-colors ${
              isTakeoverMode
                ? 'bg-amber-500/20 text-amber-500'
                : 'text-slate-400 active:bg-slate-800'
            }`}
          >
            {isTakeoverMode ? <ShieldOff size={20} /> : <Shield size={20} />}
          </button>

          {/* Save button */}
          <button
            onClick={saveSession}
            disabled={isLoading}
            className="p-2 rounded-lg bg-green-500/20 text-green-500 active:bg-green-500/30 disabled:opacity-50"
          >
            {isLoading ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
          </button>
        </div>
      </div>

      {/* Takeover mode banner */}
      <AnimatePresence>
        {isTakeoverMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2"
          >
            <div className="flex items-center gap-2 text-amber-500 text-xs">
              <ShieldOff size={14} />
              <span>Privacy mode - Screenshots paused for password entry</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browser content area */}
      <div className="flex-1 relative overflow-hidden bg-slate-950">
        {/* Error state */}
        {connectionState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-white font-semibold mb-2">Connection Error</h3>
            <p className="text-slate-400 text-sm text-center mb-4">{error}</p>
            <button
              onClick={startSession}
              className="px-6 py-3 bg-gold text-black font-semibold rounded-xl active:scale-95 transition-transform"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Connecting state */}
        {connectionState === 'connecting' && !screenshot && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader size={32} className="text-gold animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Opening {siteName}...</p>
          </div>
        )}

        {/* Screenshot display */}
        {screenshot && (
          <div
            ref={imageRef}
            className="w-full h-full relative cursor-pointer"
            onClick={handleTap}
            onTouchStart={handleTap}
          >
            <img
              src={screenshot}
              alt="Browser view"
              className="w-full h-full object-contain"
              draggable={false}
            />

            {/* Tap indicator */}
            <AnimatePresence>
              {lastTap && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute w-8 h-8 rounded-full bg-gold/50 pointer-events-none"
                  style={{
                    left: lastTap.x - 16,
                    top: lastTap.y - 16,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Loader size={24} className="text-gold animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* URL bar */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg px-3 py-2 text-slate-400 text-xs truncate">
          {currentUrl || 'Loading...'}
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-around px-4 py-3 bg-slate-900 border-t border-slate-800">
        {/* Scroll up */}
        <button
          onClick={() => handleScroll('up')}
          className="p-3 rounded-xl bg-slate-800 text-slate-300 active:bg-slate-700"
        >
          <ChevronUp size={24} />
        </button>

        {/* Keyboard toggle */}
        <button
          onClick={() => {
            haptics.light();
            setShowKeyboard(!showKeyboard);
          }}
          className={`p-3 rounded-xl transition-colors ${
            showKeyboard
              ? 'bg-gold text-black'
              : 'bg-slate-800 text-slate-300 active:bg-slate-700'
          }`}
        >
          <Keyboard size={24} />
        </button>

        {/* Refresh */}
        <button
          onClick={() => handleSpecialKey('F5')}
          className="p-3 rounded-xl bg-slate-800 text-slate-300 active:bg-slate-700"
        >
          <RefreshCw size={24} />
        </button>

        {/* Scroll down */}
        <button
          onClick={() => handleScroll('down')}
          className="p-3 rounded-xl bg-slate-800 text-slate-300 active:bg-slate-700"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Virtual keyboard input */}
      <AnimatePresence>
        {showKeyboard && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-slate-900 border-t border-slate-800 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleKeyboardSubmit();
                    }
                  }}
                  placeholder="Type here..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-gold"
                />
                <button
                  onClick={handleKeyboardSubmit}
                  className="px-4 rounded-xl bg-gold text-black font-semibold active:scale-95 transition-transform"
                >
                  Send
                </button>
              </div>

              {/* Quick action buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleSpecialKey('Tab')}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm active:bg-slate-700"
                >
                  Tab
                </button>
                <button
                  onClick={() => handleSpecialKey('Enter')}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm active:bg-slate-700"
                >
                  Enter
                </button>
                <button
                  onClick={() => handleSpecialKey('Backspace')}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm active:bg-slate-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleSpecialKey('Escape')}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm active:bg-slate-700"
                >
                  Esc
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe area bottom */}
      <div className="bg-slate-900" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </motion.div>
  );
};

export default LiveBrowser;
