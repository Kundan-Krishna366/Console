'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Server, Cpu, HardDrive, Activity, Download, Trash2, ChevronRight, Zap, GitBranch, Settings, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-black text-gray-100">
      <div className="h-screen flex">
        {/* LEFT - TERMINAL */}
        <div className="flex-1 flex flex-col bg-zinc-950 border-r border-zinc-800">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white">Console</h1>
                  <p className="text-xs text-gray-600">Arch</p>
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

          {/* Terminal Output - LARGER TEXT */}
          <div 
            ref={outputRef}
            className="flex-1 p-6 overflow-y-auto font-mono text-base"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b981 #18181b' }}
          >
            {output.length === 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold text-lg">Welcome to Arch console</span>
                </div>
                <p className="text-gray-600 ml-7 text-base">Execute commands or use quick actions to get started</p>
                <div className="ml-7 mt-4 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                  <p className="text-sm text-gray-500">Tip: Try commands like <span className="text-cyan-400">ls</span>, <span className="text-cyan-400">pwd</span>, or <span className="text-cyan-400">whoami</span></p>
                </div>
              </div>
            ) : (
              output.map((item, idx) => (
                <div key={idx} className="mb-4 group">
                  <div className="flex gap-3 text-gray-700 text-sm mb-2">
                    <span className="group-hover:text-emerald-400 transition-colors">{item.timestamp}</span>
                  </div>
                  <pre className={`whitespace-pre-wrap p-3 rounded hover:bg-zinc-900/30 transition-colors text-base ${
                    item.type === 'command' ? 'text-emerald-400 font-semibold' :
                    item.type === 'error' ? 'text-red-400' :
                    'text-gray-300'
                  }`}>{item.text}</pre>
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-center gap-3 text-yellow-400 p-3 bg-yellow-400/5 rounded-lg border border-yellow-400/20">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce"></span>
                  <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="font-semibold text-base">Processing command...</span>
              </div>
            )}
          </div>

          {/* Input - LARGER */}
          <div className="border-t border-zinc-800 p-6 bg-zinc-900/30">
            <div className="flex gap-3 items-center bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/10 transition-all">
              <span className="text-emerald-400 font-mono font-bold text-xl">$</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && executeCommand()}
                placeholder="Type your command..."
                disabled={loading}
                className="flex-1 bg-transparent text-white font-mono text-base focus:outline-none disabled:opacity-50 placeholder:text-gray-700"
              />
              <button
                onClick={executeCommand}
                disabled={loading || !command.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
              >
                Run
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT - CONTROLS */}
        <div className="w-96 bg-black flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a #000000' }}>
          {/* System Stats */}
          <div className="p-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">System Monitor</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={fetchSystemInfo}
                className="group col-span-2 p-4 bg-gradient-to-br from-blue-500/10 to-transparent hover:from-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Server className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">OS</span>
                </div>
                <p className="text-sm text-white font-semibold truncate">{systemInfo?.hostname || 'Click to load'}</p>
              </button>

              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">CPU</span>
                </div>
                <p className="text-xs text-white font-semibold truncate">{systemInfo?.cpuModel?.split(' ')[0] || '--'}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg">
                    <HardDrive className="w-3 h-3 text-purple-400" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">RAM</span>
                </div>
                <p className="text-xs text-white font-semibold">{systemInfo?.totalMemory || '--'}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <Activity className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">UPTIME</span>
                </div>
                <p className="text-xs text-white font-semibold">{systemInfo?.uptime || '--'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">System Commands</h2>
            </div>
            <div className="space-y-2">
              <button onClick={() => runScript('disk-usage')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Disk Usage</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
              </button>
              <button onClick={() => runScript('network-info')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Network Info</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
              </button>
              <button onClick={() => runScript('process-list')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-yellow-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Processes</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 transition-colors" />
              </button>
              <button onClick={() => runScript('port-check')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-green-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Port Check</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-green-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Development Tools */}
          <div className="p-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-bold text-white">Development Tools</h2>
            </div>
            <div className="space-y-2">
              <button onClick={() => runScript('git-status')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Git Status</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors" />
              </button>
              <button onClick={() => runScript('project-stats')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-pink-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Project Stats</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-pink-400 transition-colors" />
              </button>
              <button onClick={() => runScript('dependencies')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-teal-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Dependencies</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-teal-400 transition-colors" />
              </button>
              <button onClick={() => runScript('env-check')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Environment</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Maintenance */}
          <div className="p-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-yellow-400" />
              <h2 className="text-sm font-bold text-white">Maintenance</h2>
            </div>
            <div className="space-y-2">
              <button onClick={() => runScript('backup')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Backup</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
              </button>
              <button onClick={() => runScript('clean-project')} disabled={loading}
                className="group w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/30 rounded-lg transition-all disabled:opacity-50 text-left flex items-center justify-between hover:scale-[1.02]">
                <span className="text-white text-sm font-medium">Clean Project</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Terminal Actions */}
          <div className="p-6 flex-1">
            <h2 className="text-sm font-bold text-white mb-4">Terminal Actions</h2>
            <div className="space-y-2">
              <button
                onClick={downloadLogs}
                disabled={output.length === 0}
                className="w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/30 rounded-lg transition-all disabled:opacity-30 text-left flex items-center gap-3 hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-sm font-medium">Download Logs</span>
              </button>
              <button
                onClick={clearOutput}
                disabled={output.length === 0}
                className="w-full px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/30 rounded-lg transition-all disabled:opacity-30 text-left flex items-center gap-3 hover:scale-[1.02]"
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
