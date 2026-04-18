import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.json({ message: "Proxy is working" });
}


export const config = {
  // match all routes under /api/proxy
  matcher: "/api/proxy/:path*",
};