import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { $config } from "./config";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    console.log({ config: process.env.customKey, key: process.env.NEXT_PUBLIC_KEY })
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
