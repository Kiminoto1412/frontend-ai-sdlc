import { NextResponse } from "next/server";
import { queryCategories } from "@/lib/db";

export function GET() {
  const data = queryCategories();
  return NextResponse.json({ data });
}
