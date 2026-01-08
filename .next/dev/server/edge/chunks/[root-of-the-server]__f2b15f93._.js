(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f2b15f93._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$jwt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/jwt.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$jwt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/node_modules/@auth/core/jwt.js [middleware-edge] (ecmascript)");
;
;
const SUBDOMAIN_MAP = {
    leumit: 'leumit',
    biz: 'biz',
    landing: 'landing'
};
const ROOT_DOMAINS = [
    'weccelerate.co.il',
    'www.weccelerate.co.il',
    'localhost:3000',
    'localhost'
];
const PROTECTED_ROUTES = [
    '/portal',
    '/dashboard',
    '/settings'
];
const ADMIN_ROUTES = [
    '/admin'
];
const AUTH_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
];
const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
    ]
};
function getSubdomain(hostname) {
    const cleanHost = hostname.split(':')[0];
    if (ROOT_DOMAINS.some((d)=>hostname.includes(d.split(':')[0]) && !hostname.startsWith('leumit') && !hostname.startsWith('biz') && !hostname.startsWith('landing'))) {
        return null;
    }
    const parts = cleanHost.split('.');
    if (parts.length > 2 && SUBDOMAIN_MAP[parts[0]]) {
        return parts[0];
    }
    return null;
}
function getDevSubdomain(request) {
    const siteParam = request.nextUrl.searchParams.get('site');
    if (siteParam && SUBDOMAIN_MAP[siteParam]) return siteParam;
    const headerSubdomain = request.headers.get('x-subdomain');
    if (headerSubdomain && SUBDOMAIN_MAP[headerSubdomain]) return headerSubdomain;
    return null;
}
function matchesRoute(pathname, routes) {
    return routes.some((route)=>pathname.startsWith(route));
}
async function middleware(request) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    const pathname = url.pathname;
    const subdomain = getSubdomain(hostname) || getDevSubdomain(request);
    const siteFolder = subdomain ? SUBDOMAIN_MAP[subdomain] : 'main';
    const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
    const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES);
    const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);
    if (isProtectedRoute || isAdminRoute || isAuthRoute) {
        const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$jwt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getToken"])({
            req: request,
            secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
        });
        const isLoggedIn = !!token;
        const userRole = token?.role;
        if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
            const loginUrl = new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
        }
        if (isAdminRoute && userRole !== 'ADMIN') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/portal?error=unauthorized', request.url));
        }
        if (isAuthRoute && isLoggedIn) {
            const callbackUrl = url.searchParams.get('callbackUrl');
            const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : '/portal';
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(redirectUrl, request.url));
        }
    }
    if (pathname.startsWith('/sites/') || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    if (isAuthRoute || isAdminRoute || isProtectedRoute) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    url.pathname = `/sites/${siteFolder}${pathname === '/' ? '' : pathname}`;
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(url);
    response.headers.set('x-site', siteFolder);
    response.headers.set('x-subdomain', subdomain || 'main');
    return response;
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f2b15f93._.js.map