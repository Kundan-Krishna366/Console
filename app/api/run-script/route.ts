import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const ALLOWED_SCRIPTS: Record<string, string> = {
  'disk-usage': 'disk-usage.sh',
  'network-info': 'network-info.sh',
  'process-list': 'process-list.sh',
  'backup': 'backup.sh',
  'git-status': 'git-status.sh',
  'project-stats': 'project-stats.sh',
  'dependencies': 'dependencies.sh',
  'env-check': 'env-check.sh',
  'clean-project': 'clean-project.sh',
  'port-check': 'port-check.sh'
};

export async function POST(request: NextRequest) {
  try {
    const { scriptName } = await request.json();
    
    if (!scriptName || !ALLOWED_SCRIPTS[scriptName]) {
      return NextResponse.json({ 
        error: 'Invalid script name' 
      }, { status: 400 });
    }

    const scriptFile = ALLOWED_SCRIPTS[scriptName];
    const scriptPath = path.join(process.cwd(), 'scripts', scriptFile);

    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`, {
      timeout: 15000,
      maxBuffer: 1024 * 1024
    });

    return NextResponse.json({ 
      output: stdout || stderr || 'Script executed successfully'
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Script execution failed'
    }, { status: 500 });
  }
}
