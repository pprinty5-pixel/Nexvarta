import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'कोणतीही फाईल निवडलेली नाही.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads/logos directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Sanitize filename
    const originalName = file.name || 'logo.png';
    const ext = path.extname(originalName) || '.png';
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save to public/uploads/logos/
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/logos/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName,
      message: 'लोगो यशस्वीरीत्या अपलोड झाला!' 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: error.message || 'लोगो अपलोड करताना एरर आला.' }, { status: 500 });
  }
}
