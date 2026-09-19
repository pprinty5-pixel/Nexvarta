import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');

export async function GET(request) {
  try {

    if (!fs.existsSync(storePath)) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    const fileContent = fs.readFileSync(storePath, 'utf8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const updatedData = await request.json();
    fs.writeFileSync(storePath, JSON.stringify(updatedData, null, 2), 'utf8');

    // Create persistent backup
    try {
      const backupDir = path.join(process.cwd(), 'data', 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(path.join(backupDir, 'cmsStore_latest.json'), JSON.stringify(updatedData, null, 2), 'utf8');
      fs.writeFileSync(path.join(backupDir, `cmsStore_${Date.now()}.json`), JSON.stringify(updatedData, null, 2), 'utf8');
    } catch (bErr) {
      console.error('Backup write error:', bErr.message);
    }

    return NextResponse.json({ success: true, message: 'CMS Store updated successfully!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
