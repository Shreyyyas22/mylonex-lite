import { describe, it, expect } from 'vitest';
import { validateMOQ, inquirySchema, quoteSchema } from './validations';

describe('validateMOQ', () => {
  it('rejects below MOQ', () => expect(validateMOQ(400, 500)).toBe(false));
  it('accepts at MOQ', () => expect(validateMOQ(500, 500)).toBe(true));
  it('accepts above MOQ', () => expect(validateMOQ(800, 500)).toBe(true));
});

describe('inquirySchema', () => {
  it('fails when quantity missing', () => {
    const r = inquirySchema.safeParse({ fabricId: '1', type: 'BULK_RFQ', quantity: 0, deliveryLocation: 'Mumbai' });
    expect(r.success).toBe(false);
  });
  it('passes valid bulk rfq', () => {
    const r = inquirySchema.safeParse({ fabricId: '1', type: 'BULK_RFQ', quantity: 5000, deliveryLocation: 'Mumbai' });
    expect(r.success).toBe(true);
  });
});

describe('quoteSchema', () => {
  it('fails when price invalid', () => {
    const r = quoteSchema.safeParse({ inquiryId: '1', pricePerMeter: 0, estimatedDispatchTimeline: '15 days', paymentTerms: 'advance' });
    expect(r.success).toBe(false);
  });
  it('passes valid quote', () => {
    const r = quoteSchema.safeParse({ inquiryId: '1', pricePerMeter: 245, estimatedDispatchTimeline: '15-20 days', paymentTerms: '50% advance' });
    expect(r.success).toBe(true);
  });
});
