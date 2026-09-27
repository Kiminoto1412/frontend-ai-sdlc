import { NextResponse } from "next/server";
import { getCartItems, getCartSummary, getDb } from "@/lib/db";
import { getOrCreateSessionId } from "@/lib/session";

export async function GET() {
  const sessionId = await getOrCreateSessionId();
  const items = getCartItems(sessionId);
  const { itemCount, subtotal } = getCartSummary(sessionId);
  return NextResponse.json({ items, subtotal, itemCount, freeDeliveryThreshold: 50 });
}

export async function DELETE() {
  const sessionId = await getOrCreateSessionId();
  getDb().prepare("DELETE FROM cart_items WHERE session_id = ?").run(sessionId);
  return new NextResponse(null, { status: 204 });
}
