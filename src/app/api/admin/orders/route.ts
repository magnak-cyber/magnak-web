import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/adminAuth';
import { createOrder, readOrders } from '@/lib/ordersStore';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const orders = await readOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load orders.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      location?: string;
      packageType?: string;
      startDate?: string;
      additionalInfo?: string;
      status?: 'new' | 'in_progress' | 'completed' | 'cancelled';
    };

    const name = body.name?.trim() || '';
    const phone = body.phone?.trim() || '';
    const email = body.email?.trim().toLowerCase() || '';

    if (!name || !phone || !email) {
      return NextResponse.json({ message: 'Name, phone, and email are required.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    const order = await createOrder({
      name,
      phone,
      email,
      location: body.location,
      packageType: body.packageType,
      startDate: body.startDate,
      additionalInfo: body.additionalInfo,
      consentGDPR: true,
      consentContact: true,
      attachment: null,
    });

    if (body.status && body.status !== 'new') {
      const { updateOrder } = await import('@/lib/ordersStore');
      const updated = await updateOrder(order.id, { status: body.status });
      return NextResponse.json({ order: updated ?? order }, { status: 201 });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
