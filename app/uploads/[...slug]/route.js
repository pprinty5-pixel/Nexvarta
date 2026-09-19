import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    // e.g. /uploads/logos/like_1789824410366.png
    let relativePath = url.pathname.replace(/^\/uploads\/?/, '');
    relativePath = decodeURIComponent(relativePath);

    // Prevent directory traversal attacks
    const normalizedParts = relativePath.split(/[/\\]+/).filter(part => part && part !== '..');
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...normalizedParts);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse('Not a file', { status: 400 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const rawBuffer = fs.readFileSync(filePath);

    // On-the-fly CMYK fix: if a JPEG is in CMYK print mode, browsers fail to display it.
    // Convert it to standard sRGB PNG on the fly so all browsers display it seamlessly!
    if (ext === '.jpg' || ext === '.jpeg') {
      try {
        const sharpModule = (await import('sharp')).default;
        const meta = await sharpModule(rawBuffer).metadata();
        if (meta.space === 'cmyk' || meta.channels === 4) {
          const srgbBuffer = await sharpModule(rawBuffer)
            .rotate()
            .toColorspace('srgb')
            .png({ quality: 90 })
            .toBuffer();

          return new NextResponse(srgbBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Content-Length': srgbBuffer.length.toString(),
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      } catch (sharpErr) {
        // Fall back to raw buffer if sharp fails
      }
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(rawBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Upload serving error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
