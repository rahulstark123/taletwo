import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/authorization/session";
import { getInvoicePdf } from "@/server/services/receipts";

/**
 * GET /api/billing/receipts/[id]/invoice: streams the PDF invoice for one of the caller's paid orders.
 * Returns a plain PDF on success, so it does not use the JSON envelope.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "We could not find that invoice." } }, { status: 404 });
  }

  const user = await getCurrentUser();
  if (!user || !user.email_confirmed_at) {
    return NextResponse.json({ ok: false, error: { code: "UNAUTHENTICATED", message: "Please log in to continue." } }, { status: 401 });
  }

  const invoice = await getInvoicePdf(user.id, id);
  if (!invoice) {
    return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "We could not find that invoice." } }, { status: 404 });
  }

  return new Response(Buffer.from(invoice.bytes), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${invoice.filename}"`,
      "cache-control": "private, no-store",
    },
  });
}
