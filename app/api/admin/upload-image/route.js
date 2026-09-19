import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle fix-existing action (e.g., converting an existing CMYK image to sRGB PNG)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (body.action === 'fix-existing' && body.url) {
        const relativePath = body.url.replace(/^\//, '');
        const targetPath = path.join(process.cwd(), 'public', relativePath);

        if (fs.existsSync(targetPath)) {
          let sharpModule = null;
          try {
            sharpModule = (await import('sharp')).default;
          } catch (e) {
            console.warn('Sharp not available for fix-existing:', e.message);
          }

          if (sharpModule) {
            const rawBuffer = fs.readFileSync(targetPath);
            const convertedBuffer = await sharpModule(rawBuffer)
              .rotate()
              .toColorspace('srgb')
              .png({ quality: 90 })
              .toBuffer();

            const parsed = path.parse(targetPath);
            const newFileName = `${parsed.name}_srgb.png`;
            const newFilePath = path.join(parsed.dir, newFileName);
            fs.writeFileSync(newFilePath, convertedBuffer);

            const newUrl = body.url.replace(parsed.base, newFileName);
            return NextResponse.json({
              success: true,
              url: newUrl,
              message: 'इमेज यशस्वीरीत्या sRGB PNG मध्ये रूपांतरित झाली!'
            });
          }
        }
        return NextResponse.json({ error: 'फाईल सापडली नाही किंवा रूपांतरित करता आली नाही.' }, { status: 404 });
      }
    }

    // Handle standard FormData file upload
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

    let processedBuffer = buffer;
    let finalExt = ext.toLowerCase();

    // Process with sharp: auto-orient, convert CMYK to sRGB, optimize for web
    try {
      const sharpModule = (await import('sharp')).default;
      const image = sharpModule(buffer);
      const metadata = await image.metadata();

      // If CMYK (common in print/vinyl files) or JPG, convert to sRGB PNG for 100% browser rendering & transparency
      if (metadata.space === 'cmyk' || metadata.channels === 4 || finalExt === '.jpg' || finalExt === '.jpeg') {
        processedBuffer = await image
          .rotate()
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .toColorspace('srgb')
          .png({ quality: 90, compressionLevel: 8 })
          .toBuffer();
        finalExt = '.png';
      } else if (finalExt === '.png' || finalExt === '.webp') {
        processedBuffer = await image
          .rotate()
          .toColorspace('srgb')
          .toBuffer();
      }
    } catch (sharpError) {
      console.warn('Sharp image conversion error, saving original buffer:', sharpError.message);
      processedBuffer = buffer;
    }

    const fileName = `${baseName}_${Date.now()}${finalExt}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save to public/uploads/logos/
    fs.writeFileSync(filePath, processedBuffer);

    const publicUrl = `/uploads/logos/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName,
      message: 'लोगो यशस्वीरीत्या अपलोड आणि वेब-सुसंगत (sRGB) फॉरमॅटमध्ये सेव्ह झाला!' 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: error.message || 'लोगो अपलोड करताना एरर आला.' }, { status: 500 });
  }
}
