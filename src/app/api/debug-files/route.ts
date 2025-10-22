import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cwd = process.cwd();
    const publicPath = path.join(cwd, 'public');
    const dataPath = path.join(cwd, 'public', 'data');
    const season1Path = path.join(cwd, 'public', 'data', '1');
    
    const checks = {
      cwd,
      publicExists: fs.existsSync(publicPath),
      publicContents: fs.existsSync(publicPath) ? fs.readdirSync(publicPath) : [],
      dataExists: fs.existsSync(dataPath),
      dataContents: fs.existsSync(dataPath) ? fs.readdirSync(dataPath).slice(0, 10) : [],
      season1Exists: fs.existsSync(season1Path),
      season1Contents: fs.existsSync(season1Path) ? fs.readdirSync(season1Path) : [],
    };
    
    return NextResponse.json(checks);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

