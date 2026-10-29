import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, simulateOutcome, paymentReference, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required.' }, { status: 400 });
    }

    const provider = getPaymentProvider();
    const result = await provider.verifyPayment({
      orderNumber,
      simulateOutcome: simulateOutcome || 'success',
      paymentReference,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: result.orderNumber,
      status: result.status,
      paymentReference: result.paymentReference
    });
  } catch (err: any) {
    console.error('Error in verify-payment route:', err);
    return NextResponse.json({ error: err.message || 'Payment verification error' }, { status: 500 });
  }
}
