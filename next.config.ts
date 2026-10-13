import type { NextConfig } from "next";

function buildCsp(isProd: boolean): string {
  const directives = [
    "default-src 'self'",
    // 'unsafe-inline': Next.js emits inline bootstrap/RSC scripts and no nonce is wired up.
    // 'unsafe-eval' only in dev (React Refresh / HMR). cdnjs serves mermaid on the static /mermaid.html.
    `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://cdnjs.cloudflare.com`,
    // 'unsafe-inline': Next.js, swagger-ui-react and React Flow all inject inline styles at runtime.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  return directives.join("; ");
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const headers = [
      { key: "Content-Security-Policy", value: buildCsp(isProd) },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    if (isProd) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
