import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
    const raw = await fs.readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw);
    return NextResponse.json({
      submissions: parsed.creatorSubmissions || [],
    });
  } catch (err) {
    return NextResponse.json({ submissions: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
    const raw = await fs.readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!parsed.creatorSubmissions) {
      parsed.creatorSubmissions = [];
    }

    const newSubmission = {
      id: `sub-${Date.now()}`,
      title: body.title || 'बातमी फुटेज',
      category: body.category || 'Pune News',
      format: body.format || '9:16',
      videoUrl: body.videoUrl || '',
      thumbnail: body.thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
      duration: body.duration || '1:00 min',
      resolution: body.resolution || '1080x1920 Full HD',
      fileSize: body.fileSize || '45 MB',
      reporterName: body.reporterName || 'क्रिएटर',
      location: body.location || 'पुणे',
      scriptMarathi: body.scriptMarathi || '',
      scriptEnglish: body.scriptEnglish || '',
      requestedRoyalty: body.requestedRoyalty || '₹१,०००',
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    parsed.creatorSubmissions.unshift(newSubmission);

    await fs.writeFile(storePath, JSON.stringify(parsed, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      submission: newSubmission,
      message: 'तुमचे व्हिडिओ फुटेज Nexvarta संपादकीय मंडळाकडे यशस्वीरीत्या सादर झाले आहे!'
    });
  } catch (err) {
    console.error('Creator submission error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
