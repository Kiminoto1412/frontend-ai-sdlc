import { NextResponse } from "next/server";
import { queryTopSavers } from "@/lib/db";

export function GET() {
  const result = queryTopSavers();
  return NextResponse.json(result);
}
