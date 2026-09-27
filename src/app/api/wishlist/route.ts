import { NextRequest, NextResponse } from "next/server";
import { getDb, getProductDetail } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  const auth = token ? await verifyToken(token) : null;
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const rows = getDb()
    .prepare(`
      SELECT p.* FROM wishlist_items wi
      INNER JOIN products p ON p.id = wi.product_id
      WHERE wi.user_id = ?
      ORDER BY wi.created_at DESC
    `)
    .all(auth.userId);
  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  const token = extractToken(request);
  const auth = token ? await verifyToken(token) : null;
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }
  const product = getProductDetail(body.productId as string);
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

  try {
    getDb()
      .prepare("INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)")
      .run(auth.userId, body.productId);
    return NextResponse.json({ message: "Added to wishlist" }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Already in wishlist" }, { status: 409 });
  }
}
