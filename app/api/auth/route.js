import { NextResponse } from 'next/server';

// In-memory / Mock User Database
let users = [
  { id: 'usr_1', email: 'creator@example.com', name: 'Pune Creator', plan: 'All-Access Pass', active: true }
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, phone, otp } = body;

    if (action === 'send-otp') {
      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to ${phone || email}. (Use 1234 for testing)`,
        testOtp: '1234'
      });
    }

    if (action === 'verify-otp') {
      if (otp === '1234') {
        const user = {
          id: `usr_${Date.now()}`,
          phone: phone || null,
          email: email || `${phone}@nexvarta.user`,
          name: 'Nexvarta Creator',
          plan: 'All-Access Pass',
          active: true,
          token: `jwt_${Date.now()}_nexvarta`
        };
        return NextResponse.json({ success: true, user });
      }
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
