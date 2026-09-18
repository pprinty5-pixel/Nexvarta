import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';

// Helper to get R2 configuration from process.env or cmsStore.json
async function getR2Config() {
  const envConfig = {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET || '',
    publicDomain: process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN || '',
  };

  try {
    const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
    const raw = await fs.readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.r2Config) {
      return {
        accountId: parsed.r2Config.accountId || envConfig.accountId,
        accessKeyId: parsed.r2Config.accessKeyId || envConfig.accessKeyId,
        secretAccessKey: parsed.r2Config.secretAccessKey || envConfig.secretAccessKey,
        bucketName: parsed.r2Config.bucketName || envConfig.bucketName,
        publicDomain: parsed.r2Config.publicDomain || envConfig.publicDomain,
      };
    }
  } catch (e) {
    // fallback to env
  }

  return envConfig;
}

// GET: Check R2 Configuration Status
export async function GET() {
  const config = await getR2Config();
  const isConfigured = Boolean(
    config.accountId && 
    config.accessKeyId && 
    config.secretAccessKey && 
    config.bucketName
  );

  return NextResponse.json({
    isConfigured,
    bucketName: config.bucketName || 'Not Set',
    publicDomain: config.publicDomain || 'Not Set',
    accountIdMasked: config.accountId ? `${config.accountId.substring(0, 6)}...` : 'Not Set',
  });
}

// POST: Direct Upload to Cloudflare R2
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'कोणतीही फाईल आढळली नाही.' }, { status: 400 });
    }

    const config = await getR2Config();
    const isR2Ready = Boolean(
      config.accountId && 
      config.accessKeyId && 
      config.secretAccessKey && 
      config.bucketName
    );

    const originalName = file.name || 'video.mp4';
    const ext = path.extname(originalName) || '.mp4';
    const cleanBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueKey = `nexvarta_videos/${Date.now()}_${cleanBase}${ext}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || 'video/mp4';
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

    // 1. If Cloudflare R2 Credentials are configured, push directly to R2!
    if (isR2Ready) {
      try {
        const s3 = new S3Client({
          region: 'auto',
          endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        });

        const command = new PutObjectCommand({
          Bucket: config.bucketName,
          Key: uniqueKey,
          Body: buffer,
          ContentType: contentType,
        });

        await s3.send(command);

        // Build Public CDN URL
        let publicUrl = '';
        if (config.publicDomain) {
          const domain = config.publicDomain.replace(/\/+$/, '');
          publicUrl = domain.startsWith('http') ? `${domain}/${uniqueKey}` : `https://${domain}/${uniqueKey}`;
        } else {
          // Fallback dev domain format for Cloudflare R2
          publicUrl = `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com/${uniqueKey}`;
        }

        return NextResponse.json({
          success: true,
          storage: 'cloudflare-r2',
          url: publicUrl,
          key: uniqueKey,
          sizeMb: `${sizeMb} MB`,
          filename: originalName,
          message: 'Cloudflare R2 बकेटवर व्हिडिओ थेट यशस्वीरीत्या अपलोड झाला!'
        });
      } catch (r2Error) {
        console.error('R2 Direct Upload Error:', r2Error);
        // Fallback to local if R2 fails
      }
    }

    // 2. Fallback: Save to public uploads folder (always works for instant local dev & testing)
    const localDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    await fs.mkdir(localDir, { recursive: true });
    
    const localFileName = `${Date.now()}_${cleanBase}${ext}`;
    const localFilePath = path.join(localDir, localFileName);
    await fs.writeFile(localFilePath, buffer);

    const localUrl = `/uploads/videos/${localFileName}`;

    return NextResponse.json({
      success: true,
      storage: 'local-fallback',
      url: localUrl,
      sizeMb: `${sizeMb} MB`,
      filename: originalName,
      isR2Ready: false,
      message: 'व्हिडिओ यशस्वीरीत्या अपलोड झाला! (R2 क्रेडेंशियल्स जोडल्यास थेट Cloudflare CDN वर जाईल)'
    });

  } catch (error) {
    console.error('Video upload failed:', error);
    return NextResponse.json({ error: `अपलोड अयशस्वी: ${error.message}` }, { status: 500 });
  }
}
