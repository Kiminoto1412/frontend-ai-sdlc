import { NextRequest, NextResponse } from "next/server";
import { getProductDetail, getProductImages, getRelatedProducts } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProductDetail(id);
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
  const images = getProductImages(id);
  const related = getRelatedProducts(id);
  return NextResponse.json({ ...product, images, related });
}
