import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const { scriptName } = await req.json();
  const scriptPath = path.join(process.cwd(), 'scripts', `${scriptName}.sh`);

  try {
    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`, {
      timeout: 10000,
      maxBuffer: 1024 * 1024
    });
    
    return NextResponse.json({ output: stdout || stderr, scriptName });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, scriptName }, { status: 500 });
  }
}