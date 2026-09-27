import { NextRequest, NextResponse } from "next/server";
import { queryProducts } from "@/lib/db";

export function GET(request: NextRequest) {
  const s = request.nextUrl.searchParams;
  const result = queryProducts({
    q: s.get("q") ?? undefined,
    category: s.get("category") ?? undefined,
    sort: s.get("sort") ?? undefined,
    minPrice: s.has("minPrice") ? Number(s.get("minPrice")) : undefined,
    maxPrice: s.has("maxPrice") ? Number(s.get("maxPrice")) : undefined,
    page: s.has("page") ? Number(s.get("page")) : undefined,
    limit: s.has("limit") ? Number(s.get("limit")) : undefined,
  });
  return NextResponse.json(result);
}
