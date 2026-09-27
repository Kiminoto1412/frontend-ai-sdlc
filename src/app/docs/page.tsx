import type { Metadata } from "next";
import SwaggerUI from "./SwaggerUI";

export const metadata: Metadata = {
  title: "API Docs — Farmart",
  description: "Farmart Grocery REST API — OpenAPI 3.0 interactive documentation",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            Farmart
          </span>
          <span className="text-zinc-300">|</span>
          <span className="text-sm font-medium text-zinc-500">API Documentation</span>
        </div>
      </div>
      <SwaggerUI url="/api/openapi.json" />
    </div>
  );
}
