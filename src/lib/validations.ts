import { z } from 'zod';

export const inquirySchema = z.object({
  fabricId: z.string().min(1),
  type: z.enum(['SAMPLE_REQUEST', 'BULK_RFQ']),
  quantity: z.coerce.number().int().min(1, 'Quantity required'),
  requiredDispatchDate: z.string().optional().nullable(),
  deliveryLocation: z.string().min(2, 'Delivery location required'),
  targetPrice: z.coerce.number().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const quoteSchema = z.object({
  inquiryId: z.string().min(1),
  pricePerMeter: z.coerce.number().min(0.01),
  estimatedDispatchTimeline: z.string().min(3),
  paymentTerms: z.string().min(3),
  remarks: z.string().optional().nullable(),
});

export function validateMOQ(quantity: number, moq: number) {
  return quantity >= moq;
}
