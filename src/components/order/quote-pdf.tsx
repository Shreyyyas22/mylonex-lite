'use client';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';

type Props = {
  inquiry: any;
  fabric: any;
  quote: any;
  buyer?: any;
};

export function QuotePDFButton({ inquiry, fabric, quote, buyer }: Props) {
  function handleDownload() {
    const doc = new jsPDF();
    const primary = '#0f172a';
    const muted = '#64748b';
    const accent = '#059669';

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor('#fff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MyloNex Lite', 14, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('B2B Textile Sourcing & RFQ Marketplace — Quotation', 14, 20);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 26);

    let y = 42;
    // Title
    doc.setTextColor(primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Quotation', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(muted);
    doc.text(`Inquiry ${inquiry.id.slice(0, 8)} • ${inquiry.type.replace('_', ' ')} • ${inquiry.status}`, 14, y);
    y += 10;

    function section(title: string, rows: [string, string][]) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 6 + rows.length * 7, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primary);
      doc.text(title, 16, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      let ry = y + 11;
      for (const [k, v] of rows) {
        doc.setTextColor(muted);
        doc.text(k, 16, ry);
        doc.setTextColor(primary);
        doc.text(v || '-', 58, ry);
        ry += 7;
      }
      y = y + 12 + rows.length * 7;
    }

    section('Fabric', [
      ['Name', fabric.name],
      ['Composition', fabric.composition],
      ['Weave / Width', `${fabric.weave} • ${fabric.width}`],
      ['GSM / MOQ', `${fabric.gsm} GSM • MOQ ${fabric.moq}m`],
      ['Production', fabric.productionStatus.replace('_', ' ')],
      ['Dispatch', `${fabric.dispatchMinDays}–${fabric.dispatchMaxDays} days`],
      ['Certifications', (fabric.certifications || []).join(' • ') || '-'],
    ]);

    section('Inquiry (Buyer)', [
      ['Buyer', buyer?.name || inquiry.buyer?.name || '-'],
      ['Quantity', `${inquiry.quantity}m`],
      ['Delivery', inquiry.deliveryLocation || '-'],
      ['Required Date', inquiry.requiredDispatchDate ? new Date(inquiry.requiredDispatchDate).toLocaleDateString() : '-'],
      ['Target Price', inquiry.targetPrice ? `₹${inquiry.targetPrice}/m` : '-'],
      ['Remarks', inquiry.remarks || '-'],
    ]);

    // Quote price box
    const total = quote.pricePerMeter * inquiry.quantity;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'FD');
    doc.setTextColor(accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Supplier Quote', 16, y + 7);
    doc.setTextColor(primary);
    doc.setFontSize(16);
    doc.text(`₹${quote.pricePerMeter}/m`, 16, y + 15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(muted);
    doc.text(`Total approx: ₹${total.toLocaleString('en-IN')} for ${inquiry.quantity}m`, 16, y + 21);
    doc.setTextColor(primary);
    doc.setFontSize(9);
    doc.text(`Timeline: ${quote.estimatedDispatchTimeline}`, 100, y + 7);
    doc.text(`Payment: ${quote.paymentTerms}`, 100, y + 13);
    if (quote.remarks) {
      doc.setFontSize(8);
      doc.setTextColor(muted);
      const lines = doc.splitTextToSize(`Remarks: ${quote.remarks}`, 80);
      doc.text(lines, 100, y + 19);
    }
    y += 34;

    section('Commercial', [
      ['Payment Terms', quote.paymentTerms],
      ['Dispatch Timeline', quote.estimatedDispatchTimeline],
      ['Quote Remarks', quote.remarks || '-'],
    ]);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(muted);
    doc.text('This is a system-generated quotation from MyloNex Lite. Prices valid as per supplier quote. Contact supplier for final order confirmation.', 14, 285);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 288, 196, 288);
    doc.text('MyloNex Lite • RFQ to Dispatch • mylonex-lite.onrender.com', 14, 292);

    const safeName = fabric.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
    doc.save(`Quotation_${safeName}_${quote.pricePerMeter}per_m.pdf`);
  }

  return (
    <Button variant="outline" onClick={handleDownload} className="gap-1.5">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      Download PDF
    </Button>
  );
}
