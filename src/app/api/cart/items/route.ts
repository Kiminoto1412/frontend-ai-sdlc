import { NextRequest, NextResponse } from "next/server";
import { getDb, getCartItems, getCartSummary, getProductDetail } from "@/lib/db";
import { getOrCreateSessionId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  // Checked as a string, not just for truthiness: an object is truthy and would
  // reach better-sqlite3, which reads it as a named-parameter bag and throws
  // outside any catch — an unhandled 500 from a request body.
  if (typeof body?.productId !== "string" || body.productId === "") {
    return NextResponse.json({ message: "productId must be a non-empty string" }, { status: 400 });
  }
  const { productId, quantity } = body as { productId: string; quantity: unknown };
  // Integer, not just "a number >= 1": 1.5 stores a REAL in an INTEGER column,
  // and 1e400 parses to Infinity, which SQLite binds as NULL and the
  // CHECK(quantity > 0) constraint then rejects as a 500.
  if (!Number.isInteger(quantity) || (quantity as number) < 1) {
    return NextResponse.json({ message: "quantity must be a positive integer" }, { status: 400 });
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
