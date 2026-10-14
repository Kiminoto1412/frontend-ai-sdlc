import { NextRequest, NextResponse } from "next/server";
import { queryProducts } from "@/lib/db";

const NUMERIC_PARAMS = ["minPrice", "maxPrice", "page", "limit"] as const;
const INTEGER_PARAMS = new Set<string>(["page", "limit"]);

export function GET(request: NextRequest) {
  const s = request.nextUrl.searchParams;
  const num: Partial<Record<(typeof NUMERIC_PARAMS)[number], number>> = {};
  for (const name of NUMERIC_PARAMS) {
    if (!s.has(name)) continue;
    const raw = s.get(name) ?? "";
    const value = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(value)) {
      return NextResponse.json({ message: `${name} must be a number` }, { status: 400 });
    }
    if (INTEGER_PARAMS.has(name) ? !Number.isInteger(value) || value < 1 : value < 0) {
      const rule = INTEGER_PARAMS.has(name) ? "a positive integer" : "a number >= 0";
      return NextResponse.json({ message: `${name} must be ${rule}` }, { status: 400 });
    }
    num[name] = value;
  }
  const result = queryProducts({
    q: s.get("q") ?? undefined,
    category: s.get("category") ?? undefined,
    sort: s.get("sort") ?? undefined,
    ...num,
  });
  return NextResponse.json(result);
}
