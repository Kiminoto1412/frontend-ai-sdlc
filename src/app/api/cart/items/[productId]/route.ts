import { NextRequest, NextResponse } from "next/server";
import { getDb, getCartItems, getCartSummary } from "@/lib/db";
import { getOrCreateSessionId } from "@/lib/session";

type Params = { params: Promise<{ productId: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { productId } = await params;
  const body = await request.json().catch(() => null);
  const quantity = body?.quantity;
  if (typeof quantity !== "number" || quantity < 0) {
    return NextResponse.json({ message: "quantity must be >= 0" }, { status: 400 });
  }
  const sessionId = await getOrCreateSessionId();
  const db = getDb();
  if (quantity === 0) {
    db.prepare("DELETE FROM cart_items WHERE session_id = ? AND product_id = ?").run(sessionId, productId);
  } else {
    db.prepare(
      "UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?"
    ).run(quantity, sessionId, productId);
  }
  const items = getCartItems(sessionId);
  const { itemCount, subtotal } = getCartSummary(sessionId);
  return NextResponse.json({ items, subtotal, itemCount, freeDeliveryThreshold: 50 });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { productId } = await params;
  const sessionId = await getOrCreateSessionId();
  getDb()
    .prepare("DELETE FROM cart_items WHERE session_id = ? AND product_id = ?")
    .run(sessionId, productId);
  const items = getCartItems(sessionId);
  const { itemCount, subtotal } = getCartSummary(sessionId);
  return NextResponse.json({ items, subtotal, itemCount, freeDeliveryThreshold: 50 });
}
