import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mockMode } = await request.json();

    if (mockMode) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully in sandbox mode.',
        license: {
          licenseKey: `NXVT-${Date.now()}-ALLACCESS`,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          commercialUse: true,
        },
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ success: false, message: 'Server missing Razorpay secret' }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return NextResponse.json({
        success: true,
        verified: true,
        license: {
          licenseKey: `NXVT-${Date.now()}-LIVE`,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          commercialUse: true,
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Signature verification failed' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
