import crypto from 'crypto';
import { Collection } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { CreateOrderInput, Order, OrderStatus } from '@/types/orders';

const COLLECTION_NAME = 'orders';

async function getOrdersCollection(): Promise<Collection<Order>> {
  const db = await getDb();
  return db.collection<Order>(COLLECTION_NAME);
}

function ensureAllowedStatus(status: OrderStatus) {
  const allowedStatuses: OrderStatus[] = ['new', 'in_progress', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('INVALID_STATUS');
  }
}

function normalizeNewOrder(input: CreateOrderInput): Order {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: 'new',
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    location: input.location?.trim() || 'N/A',
    packageType: input.packageType?.trim() || 'N/A',
    startDate: input.startDate?.trim() || 'N/A',
    additionalInfo: input.additionalInfo?.trim() || 'N/A',
    consentGDPR: input.consentGDPR,
    consentContact: input.consentContact,
    attachment: input.attachment,
  };
}

export async function readOrders(): Promise<Order[]> {
  const collection = await getOrdersCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const collection = await getOrdersCollection();
  const order = normalizeNewOrder(input);
  await collection.insertOne(order);
  return order;
}

export async function updateOrder(
  orderId: string,
  patch: Partial<
    Pick<
      Order,
      'name' | 'phone' | 'email' | 'location' | 'packageType' | 'startDate' | 'additionalInfo' | 'status'
    >
  >
): Promise<Order | null> {
  const collection = await getOrdersCollection();
  const current = await collection.findOne({ id: orderId });

  if (!current) {
    return null;
  }

  const nextStatus = patch.status ?? current.status;
  ensureAllowedStatus(nextStatus);

  const updated: Order = {
    ...current,
    name: patch.name?.trim() || current.name,
    phone: patch.phone?.trim() || current.phone,
    email: patch.email?.trim().toLowerCase() || current.email,
    location: patch.location?.trim() || current.location,
    packageType: patch.packageType?.trim() || current.packageType,
    startDate: patch.startDate?.trim() || current.startDate,
    additionalInfo: patch.additionalInfo?.trim() || current.additionalInfo,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  await collection.updateOne({ id: orderId }, { $set: updated });
  return updated;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const collection = await getOrdersCollection();
  const result = await collection.deleteOne({ id: orderId });
  return result.deletedCount === 1;
}
