import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
    const raw = await fs.readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!parsed.payoutRequests) {
      parsed.payoutRequests = [];
    }

    const newRequest = {
      id: `payout-${Date.now()}`,
      amount: body.amount || 5000,
      upiId: body.upiId || 'creator@upi',
      status: 'processed',
      utr: `NV${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      requestedAt: new Date().toISOString(),
    };

    parsed.payoutRequests.unshift(newRequest);
    await fs.writeFile(storePath, JSON.stringify(parsed, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      payout: newRequest,
      message: `₹${body.amount} चे पेआउट यशस्वीरीत्या प्रोसेस झाले! UTR: ${newRequest.utr}`
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
