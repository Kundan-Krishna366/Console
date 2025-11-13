import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Extended whitelist of safe commands
const SAFE_COMMANDS = [
  'ls', 'pwd', 'whoami', 'date', 'echo', 'cat', 'grep', 'find', 
  'df', 'du', 'ps', 'top', 'uptime', 'free', 'uname',
  'wc', 'head', 'tail', 'sort', 'uniq', 'tree',
  'git', 'npm', 'node', 'which', 'env', 'printenv',
  'hostname', 'ifconfig', 'netstat', 'ping', 'curl',
  'history', 'clear', 'man', 'help'
];

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    
    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'Invalid command' }, { status: 400 });
    }

    const baseCommand = command.trim().split(' ')[0];
    
    if (!SAFE_COMMANDS.includes(baseCommand)) {
      return NextResponse.json({ 
        error: `Command '${baseCommand}' is not allowed. Allowed: ${SAFE_COMMANDS.join(', ')}` 
      }, { status: 403 });
    }

    const { stdout, stderr } = await execAsync(command, {
      timeout: 10000,
      maxBuffer: 1024 * 1024
    });

    return NextResponse.json({ 
      output: stdout || stderr || 'Command executed successfully'
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Command execution failed'
    }, { status: 500 });
  }
}
