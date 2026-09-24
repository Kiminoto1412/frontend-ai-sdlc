import { NextResponse } from "next/server";
import { queryJustLanding } from "@/lib/db";

export function GET() {
  const data = queryJustLanding();
  return NextResponse.json({ data });
}
