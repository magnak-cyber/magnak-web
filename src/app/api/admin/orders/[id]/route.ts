import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/adminAuth';
import { deleteOrder, updateOrder } from '@/lib/ordersStore';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get('admin_session')?.value;
  const session = verifySessionToken(token);

  if (!session) {
    return unauthorized();
  }

  const { id } = await params;
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

  try {
    const order = await updateOrder(id, body);

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order.';
    const status = message === 'INVALID_STATUS' ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return unauthorized();
    }

    const { id } = await params;
    const removed = await deleteOrder(id);

    if (!removed) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order deleted.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete order.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
