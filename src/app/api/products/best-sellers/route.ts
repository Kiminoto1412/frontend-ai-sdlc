import { NextRequest, NextResponse } from "next/server";
import { queryBestSellers } from "@/lib/db";

export function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const data = queryBestSellers(category);
  return NextResponse.json({ data });
}
