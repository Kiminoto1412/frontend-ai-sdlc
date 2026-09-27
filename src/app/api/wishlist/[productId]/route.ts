import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const token = extractToken(request);
  const auth = token ? await verifyToken(token) : null;
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { productId } = await params;
  getDb()
    .prepare("DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?")
    .run(auth.userId, productId);
  return new NextResponse(null, { status: 204 });
}
