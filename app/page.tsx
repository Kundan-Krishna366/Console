'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Server, Cpu, HardDrive, Activity, Download, Trash2, ChevronRight, Zap } from 'lucide-react';

interface OutputItem {
  type: 'command' | 'output' | 'error';
  text: string;
  timestamp: string;
}

interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  cpuModel: string;
  cpuCores: number;
  totalMemory: string;
  freeMemory: string;
  uptime: string;
}

export default function UnixTerminalDashboard() {
  const [command, setCommand] = useState<string>('');
  const [output, setOutput] = useState<OutputItem[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = async () => {
    if (!command.trim()) return;
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, { type: 'command', text: `$ ${command}`, timestamp }]);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await response.json();
      setOutput(prev => [...prev, { 
        type: data.error ? 'error' : 'output', 
        text: data.output || data.error,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setOutput(prev => [...prev, { 
        type: 'error', 
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
    setCommand('');
    setLoading(false);
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/system-info');
      const data = await response.json();
      setSystemInfo(data);
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    }
  };

  const runScript = async (scriptName: string) => {
    setLoading(true);
    setOutput(prev => [...prev, { 
      type: 'command', 
      text: `$ Running ${scriptName}...`,
      timestamp: new Date().toLocaleTimeString()
    }]);

    try {
      const response = await fetch('/api/run-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptName })
      });
      const data = await response.json();
      setOutput(prev => [...prev, { 
        type: data.error ? 'error' : 'output', 
        text: data.output || data.error,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setOutput(prev => [...prev, { 
        type: 'error', 
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
    setLoading(false);
  };

  const clearOutput = () => setOutput([]);
  const downloadLogs = () => {
    const logText = output.map(item => `[${item.timestamp}] ${item.text}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-log-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden">
      {/* Enhanced Starfield with Depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`lg-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 2 + 'px',
              height: Math.random() * 3 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              background: `radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.3))`,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 3}s infinite`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(255,255,255,0.5)`,
            }}
          />
        ))}
        {/* Medium stars */}
        {[...Array(80)].map((_, i) => (
          <div
            key={`md-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out ${Math.random() * 4}s infinite`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
        {/* Shooting stars */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`shoot-${i}`}
            className="absolute h-[1px]"
            style={{
              width: Math.random() * 100 + 80 + 'px',
              top: Math.random() * 60 + '%',
              left: '-150px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
              animation: `shoot ${Math.random() * 4 + 5}s linear ${Math.random() * 10 + 3}s infinite`,
              boxShadow: '0 0 6px rgba(255,255,255,0.8)',
              opacity: 0,
            }}
          />
        ))}
        {/* Subtle gradient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes shoot {
          0% { transform: translateX(0) translateY(0) rotate(45deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateX(1000px) translateY(400px) rotate(45deg); opacity: 0; }
        }
      `}</style>
      
      <div className="h-screen flex relative z-10">
        {/* LEFT - TERMINAL */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-zinc-950 to-black border-r border-zinc-800/50">
          {/* Sleek Header */}
          <div className="px-6 py-4 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 to-transparent backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white">Terminal Pro</h1>
                  <p className="text-xs text-gray-600">System Console</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Terminal Output */}
          <div 
            ref={outputRef}
            className="flex-1 p-6 overflow-y-auto font-mono text-sm"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b981 #18181b' }}
          >
            {output.length === 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Welcome to Terminal Pro</span>
                </div>
                <p className="text-gray-600 ml-6">Execute commands or use quick actions to get started</p>
                <div className="ml-6 mt-4 p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Tip: Try commands like <span className="text-cyan-400">ls</span>, <span className="text-cyan-400">pwd</span>, or <span className="text-cyan-400">whoami</span></p>
                </div>
              </div>
            ) : (
              output.map((item, idx) => (
                <div key={idx} className="mb-3 group">
                  <div className="flex gap-2 text-gray-700 text-xs mb-1">
                    <span className="group-hover:text-emerald-400 transition-colors">{item.timestamp}</span>
                  </div>
                  <pre className={`whitespace-pre-wrap p-2 rounded hover:bg-zinc-900/30 transition-colors ${
                    item.type === 'command' ? 'text-emerald-400 font-semibold' :
                    item.type === 'error' ? 'text-red-400' :
                    'text-gray-300'
                  }`}>{item.text}</pre>
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-center gap-3 text-yellow-400 p-2 bg-yellow-400/5 rounded-lg border border-yellow-400/20">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="font-semibold">Processing command...</span>
              </div>
            )}
          </div>

          {/* Enhanced Input */}
          <div className="border-t border-zinc-800/50 p-6 bg-gradient-to-r from-zinc-900/30 to-transparent backdrop-blur-sm">
            <div className="flex gap-3 items-center bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/10 transition-all">
              <span className="text-emerald-400 font-mono font-bold text-lg">$</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && executeCommand()}
                placeholder="Type your command..."
                disabled={loading}
                className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none disabled:opacity-50 placeholder:text-gray-700"
              />
              <button
                onClick={executeCommand}
                disabled={loading || !command.trim()}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
              >
                Run
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT - CONTROLS */}
        <div className="w-80 bg-gradient-to-br from-black to-zinc-950 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a #000000' }}>
          {/* System Stats */}
          <div className="p-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">System Monitor</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={fetchSystemInfo}
                className="group w-full p-4 bg-gradient-to-br from-blue-500/10 to-transparent hover:from-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Server className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">SERVER</span>
                </div>
                <p className="text-sm text-white font-semibold truncate">{systemInfo?.hostname || 'Click to load'}</p>
              </button>

              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">CPU</span>
                </div>
                <p className="text-sm text-white font-semibold truncate">{systemInfo?.cpuModel?.split(' ')[0] || '--'}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg">
                    <HardDrive className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">MEMORY</span>
                </div>
                <p className="text-sm text-white font-semibold">{systemInfo?.totalMemory || '--'}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">UPTIME</span>
                </div>
                <p className="text-sm text-white font-semibold">{systemInfo?.uptime || '--'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 border-b border-zinc-800/50">
            <h2 className="text-sm font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { name: 'Disk Usage', script: 'disk-usage', color: 'blue' },
                { name: 'Network Info', script: 'network-info', color: 'purple' },
                { name: 'Processes', script: 'process-list', color: 'yellow' },
                { name: 'Backup', script: 'backup', color: 'emerald' }
              ].map((action) => (
                <button
                  key={action.script}
                  onClick={() => runScript(action.script)}
                  disabled={loading}
                  className={`group w-full px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-${action.color}-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]`}
                >
                  <span className="text-white text-sm font-medium">{action.name}</span>
                  <ChevronRight className={`w-4 h-4 text-gray-600 group-hover:text-${action.color}-400 transition-colors`} />
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Actions */}
          <div className="p-6 flex-1">
            <h2 className="text-sm font-bold text-white mb-4">Terminal Actions</h2>
            <div className="space-y-2">
              <button
                onClick={downloadLogs}
                disabled={output.length === 0}
                className="w-full px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/30 rounded-lg transition-all disabled:opacity-30 text-left flex items-center gap-3 hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-sm font-medium">Download Logs</span>
              </button>
              <button
                onClick={clearOutput}
                disabled={output.length === 0}
                className="w-full px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/30 rounded-lg transition-all disabled:opacity-30 text-left flex items-center gap-3 hover:scale-[1.02]"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-white text-sm font-medium">Clear Output</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
