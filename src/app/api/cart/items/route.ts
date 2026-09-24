import { NextRequest, NextResponse } from "next/server";
import { getDb, getCartItems, getCartSummary, getProductDetail } from "@/lib/db";
import { getOrCreateSessionId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.productId || !body?.quantity) {
    return NextResponse.json({ message: "productId and quantity are required" }, { status: 400 });
  }
  const { productId, quantity } = body as { productId: string; quantity: number };
  if (typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ message: "quantity must be >= 1" }, { status: 400 });
  }
  const product = getProductDetail(productId);
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
  const sessionId = await getOrCreateSessionId();
  getDb()
    .prepare(`
      INSERT INTO cart_items (session_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT (session_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity
    `)
    .run(sessionId, productId, quantity);
  const items = getCartItems(sessionId);
  const { itemCount, subtotal } = getCartSummary(sessionId);
  return NextResponse.json({ items, subtotal, itemCount, freeDeliveryThreshold: 50 });
}
