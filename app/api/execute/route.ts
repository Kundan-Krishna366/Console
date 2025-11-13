import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const SAFE_COMMANDS = ['ls', 'pwd', 'whoami', 'date', 'echo', 'cat', 'grep', 'find', 'df', 'free', 'uptime'];

export async function POST(req: NextRequest) {
  const { command } = await req.json();
  
  if (!command) {
    return NextResponse.json({ error: 'Command is required' }, { status: 400 });
  }

  const baseCmd = command.trim().split(' ')[0];

  if (!SAFE_COMMANDS.includes(baseCmd)) {
    return NextResponse.json({ 
      error: `Command '${baseCmd}' not allowed. Safe commands: ${SAFE_COMMANDS.join(', ')}` 
    }, { status: 403 });
  }

  try {
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 5000,
      maxBuffer: 1024 * 1024 
    });
    
    return NextResponse.json({ output: stdout || stderr, command });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}