import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');

export async function GET(request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('inspect') === 'uploads') {
      const getFiles = (dir) => {
        let results = [];
        try {
          const list = fs.readdirSync(dir);
          list.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat && stat.isDirectory()) {
              results = results.concat(getFiles(fullPath));
            } else {
              results.push({ path: fullPath, size: stat.size, mtime: stat.mtime });
            }
          });
        } catch (e) {}
        return results;
      };
      const uploads = getFiles(path.join(process.cwd(), 'public', 'uploads'));
      let pm2Logs = [];
      try {
        const pm2Dir = path.join(process.env.HOME || '/root', '.pm2', 'logs');
        if (fs.existsSync(pm2Dir)) {
          pm2Logs = fs.readdirSync(pm2Dir);
        }
      } catch (e) {}
      return NextResponse.json({ uploads, pm2Logs });
    }

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
    return NextResponse.json({ success: true, message: 'CMS Store updated successfully!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
