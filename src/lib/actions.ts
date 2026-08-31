'use server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { inquirySchema, quoteSchema, validateMOQ } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function createInquiry(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };
  if ((session.user as any).role !== 'BUYER') return { error: 'Only buyers can create inquiries' };

  const raw = {
    fabricId: formData.get('fabricId'),
    type: formData.get('type'),
    quantity: formData.get('quantity'),
    requiredDispatchDate: formData.get('requiredDispatchDate'),
    deliveryLocation: formData.get('deliveryLocation'),
    targetPrice: formData.get('targetPrice'),
    remarks: formData.get('remarks'),
  };
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const fabric = await prisma.fabric.findUnique({ where: { id: parsed.data.fabricId } });
  if (!fabric) return { error: 'Fabric not found' };
  if (!validateMOQ(parsed.data.quantity, fabric.moq)) return { error: `Quantity below MOQ (${fabric.moq}m)` };

  const inquiry = await prisma.inquiry.create({
    data: {
      buyerId: (session.user as any).id,
      fabricId: parsed.data.fabricId,
      type: parsed.data.type,
      quantity: parsed.data.quantity,
      requiredDispatchDate: parsed.data.requiredDispatchDate ? new Date(parsed.data.requiredDispatchDate as string) : null,
      deliveryLocation: parsed.data.deliveryLocation!,
      targetPrice: parsed.data.targetPrice ? Number(parsed.data.targetPrice) : null,
      remarks: parsed.data.remarks || null,
      status: 'PENDING_QUOTE',
    },
  });
  revalidatePath('/buyer/inquiries');
  revalidatePath('/supplier/inquiries');
  return { success: true, id: inquiry.id };
}

export async function createQuote(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };
  if ((session.user as any).role !== 'SUPPLIER') return { error: 'Only suppliers can quote' };
  const raw = {
    inquiryId: formData.get('inquiryId'),
    pricePerMeter: formData.get('pricePerMeter'),
    estimatedDispatchTimeline: formData.get('estimatedDispatchTimeline'),
    paymentTerms: formData.get('paymentTerms'),
    remarks: formData.get('remarks'),
  };
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const inquiry = await prisma.inquiry.findUnique({ where: { id: parsed.data.inquiryId }, include: { quotes: true } });
  if (!inquiry) return { error: 'Inquiry not found' };
  if (inquiry.status !== 'PENDING_QUOTE') return { error: 'Inquiry not in quotable state' };

  const quote = await prisma.quote.create({
    data: {
      inquiryId: parsed.data.inquiryId,
      supplierId: (session.user as any).id,
      pricePerMeter: Number(parsed.data.pricePerMeter),
      estimatedDispatchTimeline: parsed.data.estimatedDispatchTimeline!,
      paymentTerms: parsed.data.paymentTerms!,
      remarks: parsed.data.remarks || null,
    },
  });
  await prisma.inquiry.update({ where: { id: parsed.data.inquiryId }, data: { status: 'QUOTED' } });
  revalidatePath('/supplier/inquiries');
  revalidatePath('/buyer/inquiries');
  revalidatePath(`/buyer/inquiries/${parsed.data.inquiryId}`);
  return { success: true, id: quote.id };
}

export async function acceptQuote(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };
  const inquiryId = formData.get('inquiryId') as string;
  const quoteId = formData.get('quoteId') as string;
  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId }, include: { quotes: true } });
  if (!inquiry) return { error: 'Inquiry not found' };
  if (inquiry.buyerId !== (session.user as any).id) return { error: 'Not owner' };
  if (inquiry.status !== 'QUOTED') return { error: 'Inquiry not quoted' };
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote || quote.inquiryId !== inquiryId) return { error: 'Quote invalid' };

  const supplierId = quote.supplierId;
  await prisma.order.create({
    data: {
      inquiryId,
      quoteId,
      buyerId: inquiry.buyerId,
      supplierId,
      status: 'ORDER_CONFIRMED',
    },
  });
  await prisma.inquiry.update({ where: { id: inquiryId }, data: { status: 'ORDER_CONFIRMED' } });
  revalidatePath(`/buyer/inquiries/${inquiryId}`);
  revalidatePath(`/supplier/inquiries/${inquiryId}`);
  return { success: true };
}

export async function rejectQuote(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };
  const inquiryId = formData.get('inquiryId') as string;
  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) return { error: 'Inquiry not found' };
  if (inquiry.buyerId !== (session.user as any).id) return { error: 'Not owner' };
  if (inquiry.status !== 'QUOTED') return { error: 'Not quoted' };
  await prisma.inquiry.update({ where: { id: inquiryId }, data: { status: 'QUOTE_REJECTED' } });
  revalidatePath(`/buyer/inquiries/${inquiryId}`);
  return { success: true };
}

export async function updateOrderStatus(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };
  if ((session.user as any).role !== 'SUPPLIER') return { error: 'Only supplier' };
  const orderId = formData.get('orderId') as string;
  const nextStatus = formData.get('status') as string;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: 'Order not found' };
  if (order.supplierId !== (session.user as any).id) return { error: 'Not owner' };
  const validTransitions: Record<string, string[]> = {
    ORDER_CONFIRMED: ['IN_PRODUCTION'],
    IN_PRODUCTION: ['DISPATCHED'],
  };
  if (!validTransitions[order.status]?.includes(nextStatus)) return { error: 'Invalid transition' };
  await prisma.order.update({ where: { id: orderId }, data: { status: nextStatus as any } });
  // also update inquiry status for stepper
  await prisma.inquiry.update({ where: { id: order.inquiryId }, data: { status: nextStatus as any } });
  revalidatePath(`/supplier/inquiries/${order.inquiryId}`);
  revalidatePath(`/buyer/inquiries/${order.inquiryId}`);
  return { success: true };
}
