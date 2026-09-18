import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
    const raw = await fs.readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw);
    const r2 = parsed.r2Config || {};

    return NextResponse.json({
      accountId: r2.accountId || process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
      accessKeyId: r2.accessKeyId || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
      bucketName: r2.bucketName || process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      publicDomain: r2.publicDomain || process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || '',
      hasSecret: Boolean(r2.secretAccessKey || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
    const raw = await fs.readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw);

    parsed.r2Config = {
      accountId: body.accountId?.trim() || '',
      accessKeyId: body.accessKeyId?.trim() || '',
      secretAccessKey: body.secretAccessKey?.trim() || parsed.r2Config?.secretAccessKey || '',
      bucketName: body.bucketName?.trim() || '',
      publicDomain: body.publicDomain?.trim() || '',
    };

    await fs.writeFile(storePath, JSON.stringify(parsed, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Cloudflare R2 क्रेडेंशियल्स यशस्वीरीत्या सेव्ह झाले!'
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
