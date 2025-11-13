import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    const cpus = os.cpus();
    
    return NextResponse.json({
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpuModel: cpus[0]?.model || 'Unknown',
      cpuCores: cpus.length,
      totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB',
      freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',
      uptime: Math.floor(os.uptime() / 3600) + ' hours'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}