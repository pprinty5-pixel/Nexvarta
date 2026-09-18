import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { duration, amount } = await request.json();
    const finalAmount = duration === 'yearly' ? 699900 : 79900; // in paise

    // Check if real Razorpay keys exist
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      // Real Razorpay API integration
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            service: 'Nexvarta All-Access Creator Pass',
            duration: duration || 'monthly',
          },
        }),
      });

      const order = await res.json();
      return NextResponse.json({ success: true, order, mode: 'live', keyId });
    }

    // Fallback: Intelligent Simulated Order for Testing & Local Execution
    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      entity: 'order',
      amount: finalAmount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      status: 'created',
      notes: {
        service: 'Nexvarta All-Access Creator Pass',
        duration: duration || 'monthly',
      },
    };

    return NextResponse.json({
      success: true,
      order: mockOrder,
      mode: 'test_simulation',
      message: 'Razorpay keys not detected in .env - running in high-fidelity sandbox mode.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
