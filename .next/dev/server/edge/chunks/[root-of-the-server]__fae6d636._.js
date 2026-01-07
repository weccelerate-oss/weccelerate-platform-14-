(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__fae6d636._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/ [middleware-edge] (unsupported edge import 'crypto', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`crypto`));
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[project]/ [middleware-edge] (unsupported edge import 'dns', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`dns`));
}),
"[project]/ [middleware-edge] (unsupported edge import 'fs', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`fs`));
}),
"[project]/ [middleware-edge] (unsupported edge import 'net', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`net`));
}),
"[project]/ [middleware-edge] (unsupported edge import 'tls', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`tls`));
}),
"[project]/ [middleware-edge] (unsupported edge import 'path', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`path`));
}),
"[project]/ [middleware-edge] (unsupported edge import 'stream', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`stream`));
}),
"[project]/ [middleware-edge] (unsupported edge import 'string_decoder', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`string_decoder`));
}),
"[project]/lib/db.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Prisma Client Singleton
 * 
 * This file creates a singleton instance of PrismaClient.
 * For Prisma 7, you may need to use the adapter approach.
 * 
 * Usage:
 * import { prisma } from '@/lib/db';
 * const users = await prisma.user.findMany();
 * 
 * Note: Run `npx prisma generate` after setting up your database
 * to generate the Prisma client.
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "prisma",
    ()=>prisma
]);
// Mock client for when Prisma isn't available
function createMockPrismaClient() {
    const createMockMethod = ()=>async ()=>null;
    const mockModel = {
        findMany: async ()=>[],
        findUnique: async ()=>null,
        findFirst: async ()=>null,
        create: async (args)=>({
                id: 'mock-id',
                ...args.data
            }),
        update: async (args)=>({
                id: 'mock-id',
                ...args.data
            }),
        delete: async ()=>({
                id: 'mock-id'
            }),
        count: async ()=>0,
        upsert: async (args)=>({
                id: 'mock-id',
                ...args.create
            }),
        deleteMany: async ()=>({
                count: 0
            }),
        updateMany: async ()=>({
                count: 0
            }),
        createMany: async ()=>({
                count: 0
            }),
        aggregate: async ()=>({}),
        groupBy: async ()=>[]
    };
    const handler = {
        get: (_target, prop)=>{
            if (prop === '$connect' || prop === '$disconnect') {
                return async ()=>{};
            }
            if (prop === '$transaction') {
                return async (fn)=>fn(createMockPrismaClient());
            }
            if (prop === '$queryRaw' || prop === '$executeRaw') {
                return async ()=>[];
            }
            // Return mock model for any model access
            return mockModel;
        }
    };
    return new Proxy({}, handler);
}
// Lazy load PrismaClient
function getPrismaClient() {
    try {
        // Check if DATABASE_URL is set
        if (!process.env.DATABASE_URL) {
            console.warn('⚠️ DATABASE_URL not set. Using mock Prisma client.');
            return createMockPrismaClient();
        }
        // Dynamic import to avoid build errors when Prisma hasn't been generated
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaClient } = __turbopack_context__.r("[project]/node_modules/@prisma/client/default.js [middleware-edge] (ecmascript)");
        // For Prisma 7, we might need to use the adapter
        // But first try without it for compatibility
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { PrismaPg } = __turbopack_context__.r("[project]/node_modules/@prisma/adapter-pg/dist/index.js [middleware-edge] (ecmascript)");
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { Pool } = __turbopack_context__.r("[project]/node_modules/pg/lib/index.js [middleware-edge] (ecmascript)");
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL
            });
            const adapter = new PrismaPg(pool);
            return new PrismaClient({
                adapter,
                log: ("TURBOPACK compile-time truthy", 1) ? [
                    'error',
                    'warn'
                ] : "TURBOPACK unreachable"
            });
        } catch  {
            // Fallback to standard Prisma client (for Prisma < 7)
            return new PrismaClient({
                log: ("TURBOPACK compile-time truthy", 1) ? [
                    'error',
                    'warn'
                ] : "TURBOPACK unreachable"
            });
        }
    } catch (error) {
        // Return a mock client for development without database
        console.warn('⚠️ Prisma client not available. Using mock client.', error);
        return createMockPrismaClient();
    }
}
// Create a singleton instance
const prisma = global.prisma || getPrismaClient();
// In development, attach to global to prevent multiple instances
if ("TURBOPACK compile-time truthy", 1) {
    global.prisma = prisma;
}
;
const __TURBOPACK__default__export__ = prisma;
}),
"[project]/lib/auth/auth.config.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "auth",
    ()=>auth,
    "authConfig",
    ()=>authConfig,
    "authOptions",
    ()=>authOptions,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
/**
 * NextAuth.js v5 Configuration
 * 
 * Authentication configuration for WeCcelerate platform.
 * 
 * Security Features:
 * - Credentials provider with bcrypt password hashing
 * - JWT session strategy with encrypted tokens
 * - Role-based access control (ADMIN, ENTREPRENEUR, etc.)
 * - Session includes user ID and role for authorization
 * - Protection against common attack vectors
 * 
 * @see https://authjs.dev/getting-started/installation
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/node_modules/@auth/core/providers/credentials.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [middleware-edge] (ecmascript)");
;
;
;
// =============================================================================
// AUTH CONFIGURATION
// =============================================================================
const authConfig = {
    // Session configuration
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60
    },
    // JWT configuration
    jwt: {
        maxAge: 30 * 24 * 60 * 60
    },
    // Pages configuration
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
        verifyRequest: '/verify-email',
        newUser: '/onboarding'
    },
    // Providers
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])({
            id: 'credentials',
            name: 'Email & Password',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'your@email.com'
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            async authorize (credentials) {
                // Validate input
                if (!credentials?.email || !credentials?.password) {
                    console.error('[Auth] Missing credentials');
                    return null;
                }
                const email = credentials.email;
                const password = credentials.password;
                // Basic validation
                if (!email.includes('@') || password.length < 6) {
                    console.error('[Auth] Invalid email or password format');
                    return null;
                }
                try {
                    // Dynamic import Prisma only in Node.js runtime (not edge)
                    // This authorize function runs in Node.js, not edge
                    const { prisma } = await Promise.resolve().then(()=>__turbopack_context__.i("[project]/lib/db.ts [middleware-edge] (ecmascript)"));
                    // Find user by email
                    const user = await prisma.user.findUnique({
                        where: {
                            email: email.toLowerCase().trim()
                        },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            password: true,
                            role: true,
                            image: true,
                            avatar: true,
                            company: true,
                            isActive: true
                        }
                    });
                    // User not found
                    if (!user) {
                        console.error('[Auth] User not found:', email);
                        return null;
                    }
                    // Check if user is active
                    if (!user.isActive) {
                        console.error('[Auth] User is deactivated:', email);
                        return null;
                    }
                    // Check if user has password (might be OAuth-only user)
                    if (!user.password) {
                        console.error('[Auth] User has no password (OAuth only):', email);
                        return null;
                    }
                    // Verify password
                    const isValidPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].compare(password, user.password);
                    if (!isValidPassword) {
                        console.error('[Auth] Invalid password for:', email);
                        return null;
                    }
                    // Update last login time (non-blocking)
                    prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            lastLoginAt: new Date()
                        }
                    }).catch((err)=>console.error('[Auth] Failed to update last login:', err));
                    // Log successful login (non-blocking)
                    prisma.activityLog.create({
                        data: {
                            action: 'user.login',
                            description: 'User logged in successfully',
                            userId: user.id,
                            metadata: {
                                provider: 'credentials',
                                timestamp: new Date().toISOString()
                            }
                        }
                    }).catch((err)=>console.error('[Auth] Failed to log activity:', err));
                    console.log('[Auth] Login successful:', email);
                    // Return user object (without password)
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image || user.avatar,
                        company: user.company,
                        isActive: user.isActive
                    };
                } catch (error) {
                    console.error('[Auth] Error during authentication:', error);
                    return null;
                }
            }
        })
    ],
    // Callbacks
    callbacks: {
        /**
     * JWT Callback
     * Called whenever a JWT is created or updated
     * This is where we add custom claims to the token
     */ async jwt ({ token, user, trigger, session }) {
            // Initial sign in - add user data to token
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.company = user.company;
            }
            // Handle session update (e.g., user updates their profile)
            if (trigger === 'update' && session) {
                if (session.name) token.name = session.name;
                if (session.company) token.company = session.company;
            }
            return token;
        },
        /**
     * Session Callback
     * Called whenever a session is checked
     * This is where we expose token data to the client
     */ async session ({ session, token }) {
            // Add custom fields to session
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.company = token.company;
            }
            return session;
        },
        /**
     * Authorized Callback
     * Called to check if user is authorized to access a route
     * Used by middleware for route protection
     * 
     * NOTE: This runs in edge runtime - no Prisma access here!
     */ async authorized ({ auth, request }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = request.nextUrl;
            // Define protected routes
            const protectedRoutes = [
                '/portal',
                '/dashboard',
                '/admin'
            ];
            const adminRoutes = [
                '/admin'
            ];
            // Check if current path is protected
            const isProtectedRoute = protectedRoutes.some((route)=>pathname.startsWith(route));
            const isAdminRoute = adminRoutes.some((route)=>pathname.startsWith(route));
            // Redirect unauthenticated users from protected routes
            if (isProtectedRoute && !isLoggedIn) {
                return false; // Will redirect to signIn page
            }
            // Check admin access
            if (isAdminRoute && auth?.user?.role !== 'ADMIN') {
                return false;
            }
            // Redirect authenticated users away from auth pages
            const authRoutes = [
                '/login',
                '/register',
                '/forgot-password'
            ];
            const isAuthRoute = authRoutes.some((route)=>pathname.startsWith(route));
            if (isAuthRoute && isLoggedIn) {
                // Redirect based on role
                const redirectUrl = auth?.user?.role === 'ADMIN' ? '/admin' : '/portal/dashboard';
                return Response.redirect(new URL(redirectUrl, request.nextUrl));
            }
            return true;
        },
        /**
     * SignIn Callback
     * Called after a successful sign in
     * Can be used to add additional checks
     */ async signIn ({ user }) {
            // Check if user is active
            if (user && 'isActive' in user && !user.isActive) {
                return false;
            }
            return true;
        }
    },
    // Events
    events: {
        async signIn ({ user, account }) {
            console.log(`[Auth Event] User signed in: ${user.email} via ${account?.provider}`);
        },
        async signOut ({ token }) {
            console.log(`[Auth Event] User signed out: ${token?.email}`);
        }
    },
    // Security options
    trustHost: true,
    debug: ("TURBOPACK compile-time value", "development") === 'development'
};
const { handlers: { GET, POST }, auth, signIn, signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(authConfig);
;
const authOptions = authConfig;
}),
"[project]/lib/auth/auth.utils.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCurrentUser",
    ()=>getCurrentUser,
    "getSession",
    ()=>getSession,
    "hasAnyRole",
    ()=>hasAnyRole,
    "hasRole",
    ()=>hasRole,
    "hashPassword",
    ()=>hashPassword,
    "isAuthenticated",
    ()=>isAuthenticated,
    "requireAnyRole",
    ()=>requireAnyRole,
    "requireAuth",
    ()=>requireAuth,
    "requireRole",
    ()=>requireRole,
    "validatePasswordStrength",
    ()=>validatePasswordStrength,
    "verifyPassword",
    ()=>verifyPassword
]);
/**
 * Authentication Utilities
 * 
 * Helper functions for authentication and authorization.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.config.ts [middleware-edge] (ecmascript)");
;
;
async function hashPassword(password) {
    const saltRounds = 12; // Higher = more secure but slower
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].hash(password, saltRounds);
}
async function verifyPassword(password, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
async function getSession() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth"])();
}
async function getCurrentUser() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth"])();
    return session?.user ?? null;
}
async function isAuthenticated() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth"])();
    return !!session?.user;
}
async function hasRole(role) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth"])();
    return session?.user?.role === role;
}
async function hasAnyRole(roles) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth"])();
    return !!session?.user?.role && roles.includes(session.user.role);
}
async function requireAuth() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth"])();
    if (!session?.user) {
        throw new Error('Unauthorized: Authentication required');
    }
    return session.user;
}
async function requireRole(role) {
    const user = await requireAuth();
    if (user.role !== role) {
        throw new Error(`Forbidden: ${role} role required`);
    }
    return user;
}
async function requireAnyRole(roles) {
    const user = await requireAuth();
    if (!roles.includes(user.role)) {
        throw new Error(`Forbidden: One of [${roles.join(', ')}] roles required`);
    }
    return user;
} // =============================================================================
 // TYPES - exported above
 // =============================================================================
}),
"[project]/lib/auth/index.ts [middleware-edge] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * Authentication Module
 * 
 * Exports all authentication-related functionality.
 */ // Main auth exports
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.config.ts [middleware-edge] (ecmascript)");
// Utility functions
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$utils$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.utils.ts [middleware-edge] (ecmascript)");
;
;
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/auth/index.ts [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.config.ts [middleware-edge] (ecmascript)");
;
;
/**
 * WeCcelerate Multi-Domain Middleware with Authentication
 * 
 * Routes requests to appropriate site folders based on subdomain:
 * - weccelerate.co.il (main) → /app/sites/main
 * - leumit.weccelerate.co.il → /app/sites/leumit
 * - biz.weccelerate.co.il → /app/sites/biz
 * - landing.weccelerate.co.il → /app/sites/landing
 * 
 * Also handles:
 * - Authentication checks for protected routes
 * - Role-based access control
 */ // Define valid subdomains and their corresponding site folders
const SUBDOMAIN_MAP = {
    leumit: 'leumit',
    biz: 'biz',
    landing: 'landing'
};
// Domains to exclude from subdomain parsing (apex/main domains)
const ROOT_DOMAINS = [
    'weccelerate.co.il',
    'www.weccelerate.co.il',
    'localhost:3000',
    'localhost'
];
// Protected routes requiring authentication
const PROTECTED_ROUTES = [
    '/portal',
    '/dashboard',
    '/settings'
];
// Admin-only routes
const ADMIN_ROUTES = [
    '/admin'
];
// Auth pages (redirect if already logged in)
const AUTH_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
];
const config = {
    matcher: [
        /*
     * Match all paths except:
     * - API routes (/api/...)
     * - Static files (/_next/static/...)
     * - Image optimization files (/_next/image/...)
     * - Favicon and other root-level static assets
     */ '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
    ]
};
/**
 * Extract subdomain from hostname
 */ function getSubdomain(hostname) {
    // Remove port if present
    const cleanHost = hostname.split(':')[0];
    // Check if it's a root domain
    if (ROOT_DOMAINS.some((domain)=>hostname.includes(domain.split(':')[0]) && !hostname.startsWith('leumit') && !hostname.startsWith('biz') && !hostname.startsWith('landing'))) {
        // For localhost development, check for subdomain simulation via query param or header
        return null;
    }
    // Extract subdomain from production domains
    // Format: subdomain.weccelerate.co.il
    const parts = cleanHost.split('.');
    // If we have more than 2 parts (subdomain.domain.tld) or 3 parts for .co.il
    if (parts.length > 2) {
        const potentialSubdomain = parts[0];
        // Verify it's a valid subdomain
        if (SUBDOMAIN_MAP[potentialSubdomain]) {
            return potentialSubdomain;
        }
    }
    return null;
}
/**
 * Get subdomain from development query parameter
 * Allows testing subdomains locally: localhost:3000?site=biz
 */ function getDevSubdomain(request) {
    const siteParam = request.nextUrl.searchParams.get('site');
    if (siteParam && SUBDOMAIN_MAP[siteParam]) {
        return siteParam;
    }
    // Also check for x-subdomain header (useful for testing with tools like Postman)
    const headerSubdomain = request.headers.get('x-subdomain');
    if (headerSubdomain && SUBDOMAIN_MAP[headerSubdomain]) {
        return headerSubdomain;
    }
    return null;
}
/**
 * Check if path matches any of the given routes
 */ function matchesRoute(pathname, routes) {
    return routes.some((route)=>pathname.startsWith(route));
}
async function middleware(request) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    const pathname = url.pathname;
    // Get subdomain (production) or dev subdomain (development)
    const subdomain = getSubdomain(hostname) || getDevSubdomain(request);
    // Determine target site folder
    const siteFolder = subdomain ? SUBDOMAIN_MAP[subdomain] : 'main';
    // =========================================================================
    // AUTHENTICATION CHECK
    // =========================================================================
    // Check if this is a protected route
    const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
    const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES);
    const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);
    if (isProtectedRoute || isAdminRoute || isAuthRoute) {
        // Get session
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth"])();
        const isLoggedIn = !!session?.user;
        const userRole = session?.user?.role;
        // Redirect unauthenticated users from protected routes
        if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
            const callbackUrl = encodeURIComponent(pathname);
            const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
        }
        // Check admin access
        if (isAdminRoute && userRole !== 'ADMIN') {
            const portalUrl = new URL('/portal?error=unauthorized', request.url);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(portalUrl);
        }
        // Redirect authenticated users away from auth pages
        if (isAuthRoute && isLoggedIn) {
            const callbackUrl = url.searchParams.get('callbackUrl');
            const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : '/portal';
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(redirectUrl, request.url));
        }
    }
    // =========================================================================
    // SUBDOMAIN ROUTING
    // =========================================================================
    // Skip rewriting if already in a sites path
    if (pathname.startsWith('/sites/')) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Skip rewriting for special paths (auth routes handled at root level)
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Don't rewrite auth routes - they live at root level
    if (isAuthRoute) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Don't rewrite admin and portal routes - they live at root level
    if (isAdminRoute || isProtectedRoute) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Rewrite to the appropriate site folder
    // e.g., /about → /sites/main/about or /dashboard → /sites/biz/dashboard
    const newPathname = `/sites/${siteFolder}${pathname === '/' ? '' : pathname}`;
    url.pathname = newPathname;
    // Add site context to headers for use in components
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(url);
    response.headers.set('x-site', siteFolder);
    response.headers.set('x-subdomain', subdomain || 'main');
    return response;
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__fae6d636._.js.map