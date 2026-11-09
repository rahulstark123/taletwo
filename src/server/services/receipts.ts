import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { APP_PLANS } from "@/config/subscriptions";

export type { ReceiptDTO } from "@/lib/billing-types";
import type { ReceiptDTO } from "@/lib/billing-types";

const PLAN_NAME: Record<string, string> = Object.fromEntries(APP_PLANS.map((p) => [p.id, p.name]));

/** The user's own paid payments, newest first. Only paid orders appear here. */
export async function listMyReceipts(userId: string): Promise<ReceiptDTO[]> {
  const rows = await prisma.payment.findMany({
    where: { userId, status: "PAID" },
    orderBy: { paidAt: "desc" },
    take: 200,
  });
  return rows.map((r) => ({
    id: r.id,
    plan: r.plan,
    cycle: r.cycle === "MONTH" ? "month" : "year",
    amountMinor: r.amountMinor,
    currency: r.currency,
    paidAt: (r.paidAt ?? r.createdAt).toISOString(),
  }));
}

/** Standard PDF fonts only cover basic Latin text, so anything else is replaced to keep the file valid. */
function plain(text: string): string {
  return text.replace(/[^\x20-\x7E]/g, "?");
}

function invoiceNumber(id: string, paidAt: Date): string {
  const d = paidAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `TT-${d}-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function drawRow(page: PDFPage, font: PDFFont, label: string, value: string, y: number) {
  page.drawText(plain(label), { x: 56, y, size: 11, font, color: rgb(0.32, 0.27, 0.28) });
  page.drawText(plain(value), { x: 260, y, size: 11, font, color: rgb(0.1, 0.09, 0.1) });
}

/**
 * Builds a one-page invoice for one paid order. Generated on request from the stored record,
 * so there is no separate file to keep in sync.
 */
export async function buildInvoicePdf(input: {
  id: string;
  payerName: string;
  payerEmail: string;
  plan: string;
  cycle: "MONTH" | "YEAR";
  amountMinor: number;
  currency: string;
  paidAt: Date;
  razorpayPaymentId: string | null;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`TaleTwo invoice ${invoiceNumber(input.id, input.paidAt)}`);
  doc.setAuthor("TaleTwo");
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawText("TaleTwo", { x: 56, y: 770, size: 26, font: bold, color: rgb(0.79, 0.49, 0.55) });
  page.drawText("Tax invoice for your subscription", { x: 56, y: 748, size: 11, font, color: rgb(0.32, 0.27, 0.28) });
  page.drawText("INVOICE", { x: 420, y: 770, size: 18, font: bold, color: rgb(0.1, 0.09, 0.1) });
  page.drawText(plain(invoiceNumber(input.id, input.paidAt)), { x: 420, y: 750, size: 10, font, color: rgb(0.32, 0.27, 0.28) });

  page.drawLine({ start: { x: 56, y: 720 }, end: { x: 539, y: 720 }, thickness: 0.8, color: rgb(0.85, 0.8, 0.8) });

  const cycleWord = input.cycle === "MONTH" ? "Monthly (one month)" : "Yearly (one year)";
  // Every order is created in INR (see the billing service), so the price is always formatted as INR.
  // Plain text only: the PDF font has no rupee or other symbols, so the code is written out.
  const amount = `${input.currency} ${(input.amountMinor / 100).toLocaleString("en-US")}`;
  let y = 690;
  drawRow(page, bold, "Billed to", input.payerName, y); y -= 20;
  drawRow(page, font, "Email", input.payerEmail, y); y -= 20;
  drawRow(page, font, "Date paid", input.paidAt.toISOString().slice(0, 10), y); y -= 20;
  drawRow(page, font, "Plan", `${PLAN_NAME[input.plan] ?? input.plan} plan`, y); y -= 20;
  drawRow(page, font, "Billing period", cycleWord, y); y -= 20;
  drawRow(page, font, "Payment reference", input.razorpayPaymentId ?? "-", y); y -= 20;
  drawRow(page, font, "Status", "Paid", y);

  page.drawLine({ start: { x: 56, y: 470 }, end: { x: 539, y: 470 }, thickness: 0.8, color: rgb(0.85, 0.8, 0.8) });
  page.drawText("Total paid", { x: 56, y: 440, size: 13, font: bold, color: rgb(0.1, 0.09, 0.1) });
  page.drawText(plain(amount), { x: 420, y: 440, size: 13, font: bold, color: rgb(0.1, 0.09, 0.1) });

  page.drawText(
    "This is a one-time payment for the period above. It does not renew automatically.",
    { x: 56, y: 380, size: 10, font, color: rgb(0.32, 0.27, 0.28) }
  );
  page.drawText("Payments are processed by Razorpay. Questions about this invoice: contact TaleTwo support.", { x: 56, y: 364, size: 10, font, color: rgb(0.32, 0.27, 0.28) });

  return doc.save();
}

/** Loads one of the caller's own paid orders and builds its invoice. Null if it is not theirs or not paid. */
export async function getInvoicePdf(userId: string, paymentId: string): Promise<{ bytes: Uint8Array; filename: string } | null> {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId, status: "PAID" },
    include: { user: { select: { displayName: true, email: true } } },
  });
  if (!payment || !payment.paidAt) return null;

  const bytes = await buildInvoicePdf({
    id: payment.id,
    payerName: payment.user.displayName,
    payerEmail: payment.user.email,
    plan: payment.plan,
    cycle: payment.cycle,
    amountMinor: payment.amountMinor,
    currency: payment.currency,
    paidAt: payment.paidAt,
    razorpayPaymentId: payment.razorpayPaymentId,
  });
  return { bytes, filename: `${invoiceNumber(payment.id, payment.paidAt)}.pdf` };
}
