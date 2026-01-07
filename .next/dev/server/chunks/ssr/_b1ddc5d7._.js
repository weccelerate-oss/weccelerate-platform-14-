module.exports = [
"[project]/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
        const { PrismaClient } = __turbopack_context__.r("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
        // For Prisma 7, we might need to use the adapter
        // But first try without it for compatibility
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { PrismaPg } = __turbopack_context__.r("[project]/node_modules/@prisma/adapter-pg/dist/index.js [app-rsc] (ecmascript)");
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { Pool } = __turbopack_context__.r("[externals]/pg [external] (pg, cjs, [project]/node_modules/pg)");
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
"[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Admin Server Actions
 * 
 * Server actions for content management in the admin dashboard.
 * All actions verify admin role before execution.
 */ /* __next_internal_action_entry_do_not_use__ [{"40034fc164eb1dba7e65466b788c5e9e4fb6d831d0":"deleteEventAction","4003d4fb6d7a1cc86e1ffdbac8f5ad17963f33f20b":"createUserAction","401544133c464efa021d3566366a42a5bd791e2818":"createVideoAction","4064c9275a5dd8a51cadc0c224589707f81afcb1d2":"createNewsAction","407fecefdf73b34046eae40651407861bc2a20c3e3":"deleteStoryAction","408f13fbdf6698742e338c5c0cd52268c0d094eeac":"toggleStoryFeaturedAction","409db0a7ac0915702b227c9f5fa5fef81dae5bc3ca":"deleteNewsAction","40bd823161cabf6900e90cb4305e81d35b925124fe":"deleteVideoAction","40c0834adad6c1ef01ca9306733bc199a4cf3a15eb":"createStoryAction","40c888f0baa0b76a0049d380ccfd46c3dada21d6c6":"createEventAction","40ddcd56780be308d0ecaf61b2c791c4d816bdab75":"resetUserPasswordAction","40def615b95ada202806ce56dbce31f156fc221a02":"toggleStoryActiveAction","40e240888895be694f8fbcd1eb82cb4838a850189a":"deleteUserAction","6039eefcab615736b376bef0e59b9ecd009f0500c1":"toggleUserActiveAction","6042942d2e43f59d874bd3c63f95d5c4b8ddfd08fb":"updateVideoAction","604af20f8edb0284e615e26c0c2df1f12b238cc1ce":"updateUserAction","60aa0a2350ac5449edf2179a1b789e931c93e23417":"updateEventAction","60b976d77fcf358c733b88e1c6ba91b72ec423d4a2":"updateNewsAction","60dcb622ccc5da8e947518945d648122e84b8f38bc":"updateStoryAction"},"",""] */ __turbopack_context__.s([
    "createEventAction",
    ()=>createEventAction,
    "createNewsAction",
    ()=>createNewsAction,
    "createStoryAction",
    ()=>createStoryAction,
    "createUserAction",
    ()=>createUserAction,
    "createVideoAction",
    ()=>createVideoAction,
    "deleteEventAction",
    ()=>deleteEventAction,
    "deleteNewsAction",
    ()=>deleteNewsAction,
    "deleteStoryAction",
    ()=>deleteStoryAction,
    "deleteUserAction",
    ()=>deleteUserAction,
    "deleteVideoAction",
    ()=>deleteVideoAction,
    "resetUserPasswordAction",
    ()=>resetUserPasswordAction,
    "toggleStoryActiveAction",
    ()=>toggleStoryActiveAction,
    "toggleStoryFeaturedAction",
    ()=>toggleStoryFeaturedAction,
    "toggleUserActiveAction",
    ()=>toggleUserActiveAction,
    "updateEventAction",
    ()=>updateEventAction,
    "updateNewsAction",
    ()=>updateNewsAction,
    "updateStoryAction",
    ()=>updateStoryAction,
    "updateUserAction",
    ()=>updateUserAction,
    "updateVideoAction",
    ()=>updateVideoAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/auth/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/auth.config.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
// =============================================================================
// HELPERS
// =============================================================================
async function verifyAdmin() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$auth$2e$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required');
    }
    return session.user;
}
async function createNewsAction(data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const news = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].newsUpdate.create({
            data: {
                title: data.title,
                titleEn: data.titleEn,
                excerpt: data.excerpt,
                link: data.link,
                urgencyLevel: data.urgencyLevel,
                isActive: data.isActive,
                isPinned: data.isPinned
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/news');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/'); // Revalidate homepage for ticker
        return {
            success: true,
            news
        };
    } catch (error) {
        console.error('[Admin] Error creating news:', error);
        return {
            success: false,
            error: 'Failed to create news update'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function updateNewsAction(id, data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const news = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].newsUpdate.update({
            where: {
                id
            },
            data
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/news');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
        return {
            success: true,
            news
        };
    } catch (error) {
        console.error('[Admin] Error updating news:', error);
        return {
            success: false,
            error: 'Failed to update news'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function deleteNewsAction(id) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].newsUpdate.delete({
            where: {
                id
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/news');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error deleting news:', error);
        return {
            success: false,
            error: 'Failed to delete news'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function createEventAction(data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const event = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].event.create({
            data: {
                name: data.name,
                nameEn: data.nameEn,
                slug: data.slug,
                description: data.description,
                date: new Date(data.date),
                time: data.time,
                endTime: data.endTime,
                locationType: data.locationType,
                address: data.address,
                city: data.city,
                virtualLink: data.virtualLink,
                registrationLink: data.registrationLink,
                registrationRequired: data.registrationRequired,
                capacity: data.capacity,
                isFree: data.isFree,
                price: data.price,
                currency: data.currency,
                category: data.category,
                host: data.host,
                status: data.status,
                isActive: data.isActive,
                isFeatured: data.isFeatured,
                imageUrl: data.imageUrl
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/events');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/events');
        return {
            success: true,
            event
        };
    } catch (error) {
        console.error('[Admin] Error creating event:', error);
        return {
            success: false,
            error: 'Failed to create event'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function updateEventAction(id, data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const updateData = {
            ...data
        };
        if (data.date) {
            updateData.date = new Date(data.date);
        }
        const event = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].event.update({
            where: {
                id
            },
            data: updateData
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/events');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/events');
        return {
            success: true,
            event
        };
    } catch (error) {
        console.error('[Admin] Error updating event:', error);
        return {
            success: false,
            error: 'Failed to update event'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function deleteEventAction(id) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].event.delete({
            where: {
                id
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/events');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/events');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error deleting event:', error);
        return {
            success: false,
            error: 'Failed to delete event'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function createVideoAction(data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const video = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].video.create({
            data: {
                title: data.title,
                titleEn: data.titleEn,
                slug: data.slug,
                description: data.description,
                youtubeUrl: data.youtubeUrl,
                vimeoUrl: data.vimeoUrl,
                thumbnail: data.thumbnail,
                duration: data.duration,
                category: data.category,
                tags: data.tags,
                speaker: data.speaker,
                speakerTitle: data.speakerTitle,
                isActive: data.isActive,
                isFeatured: data.isFeatured
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/videos');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/videos');
        return {
            success: true,
            video
        };
    } catch (error) {
        console.error('[Admin] Error creating video:', error);
        return {
            success: false,
            error: 'Failed to create video'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function updateVideoAction(id, data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const video = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].video.update({
            where: {
                id
            },
            data
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/videos');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/videos');
        return {
            success: true,
            video
        };
    } catch (error) {
        console.error('[Admin] Error updating video:', error);
        return {
            success: false,
            error: 'Failed to update video'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function deleteVideoAction(id) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].video.delete({
            where: {
                id
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/videos');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/videos');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error deleting video:', error);
        return {
            success: false,
            error: 'Failed to delete video'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function createUserAction(data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        // Check if email already exists
        const existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email: data.email.toLowerCase()
            }
        });
        if (existingUser) {
            return {
                success: false,
                error: 'משתמש עם אימייל זה כבר קיים'
            };
        }
        // Generate temporary password
        const tempPassword = generateTempPassword();
        const hashedPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].hash(tempPassword, 12);
        // Create user
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.create({
            data: {
                email: data.email.toLowerCase(),
                name: data.name,
                password: hashedPassword,
                phone: data.phone,
                company: data.company,
                position: data.position,
                role: data.role,
                isActive: true
            }
        });
        // Log activity
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].activityLog.create({
            data: {
                action: 'user.created',
                description: `User ${user.email} created by admin`,
                userId: user.id,
                metadata: {
                    createdBy: 'admin',
                    role: data.role
                }
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/users');
        // TODO: Send welcome email with temp password if sendWelcomeEmail is true
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            tempPassword
        };
    } catch (error) {
        console.error('[Admin] Error creating user:', error);
        return {
            success: false,
            error: 'Failed to create user'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function updateUserAction(id, data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.update({
            where: {
                id
            },
            data: {
                name: data.name,
                phone: data.phone,
                company: data.company,
                position: data.position,
                role: data.role
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/users');
        return {
            success: true,
            user
        };
    } catch (error) {
        console.error('[Admin] Error updating user:', error);
        return {
            success: false,
            error: 'Failed to update user'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function toggleUserActiveAction(id, isActive) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.update({
            where: {
                id
            },
            data: {
                isActive
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/users');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error toggling user status:', error);
        return {
            success: false,
            error: 'Failed to update user status'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function resetUserPasswordAction(id) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const tempPassword = generateTempPassword();
        const hashedPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].hash(tempPassword, 12);
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.update({
            where: {
                id
            },
            data: {
                password: hashedPassword
            }
        });
        // TODO: Send email with new password
        return {
            success: true,
            tempPassword
        };
    } catch (error) {
        console.error('[Admin] Error resetting password:', error);
        return {
            success: false,
            error: 'Failed to reset password'
        };
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$disconnect();
    }
}
async function deleteUserAction(id) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        // Soft delete - just deactivate
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.update({
            where: {
                id
            },
            data: {
                isActive: false
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/users');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error deleting user:', error);
        return {
            success: false,
            error: 'Failed to delete user'
        };
    }
}
async function createStoryAction(data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const story = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].successStory.create({
            data: {
                companyName: data.companyName,
                logoUrl: data.logoUrl || null,
                industry: data.industry || null,
                website: data.website || null,
                quote: data.quote,
                quoteEn: data.quoteEn || null,
                personName: data.personName || null,
                personRole: data.personRole || null,
                personImage: data.personImage || null,
                slug: data.slug,
                fullStory: data.fullStory || null,
                projectLink: data.projectLink || null,
                collaborationDate: data.collaborationDate || null,
                programName: data.programName || null,
                order: data.order,
                isActive: data.isActive,
                isFeatured: data.isFeatured
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/stories');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
        return {
            success: true,
            story
        };
    } catch (error) {
        console.error('[Admin] Error creating story:', error);
        return {
            success: false,
            error: 'Failed to create story'
        };
    }
}
async function updateStoryAction(id, data) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const story = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].successStory.update({
            where: {
                id
            },
            data: {
                companyName: data.companyName,
                logoUrl: data.logoUrl || null,
                industry: data.industry || null,
                website: data.website || null,
                quote: data.quote,
                quoteEn: data.quoteEn || null,
                personName: data.personName || null,
                personRole: data.personRole || null,
                personImage: data.personImage || null,
                slug: data.slug,
                fullStory: data.fullStory || null,
                projectLink: data.projectLink || null,
                collaborationDate: data.collaborationDate || null,
                programName: data.programName || null,
                order: data.order,
                isActive: data.isActive,
                isFeatured: data.isFeatured
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/stories');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
        return {
            success: true,
            story
        };
    } catch (error) {
        console.error('[Admin] Error updating story:', error);
        return {
            success: false,
            error: 'Failed to update story'
        };
    }
}
async function deleteStoryAction(id) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].successStory.delete({
            where: {
                id
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/stories');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error deleting story:', error);
        return {
            success: false,
            error: 'Failed to delete story'
        };
    }
}
async function toggleStoryActiveAction(id) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const story = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].successStory.findUnique({
            where: {
                id
            }
        });
        if (!story) throw new Error('Story not found');
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].successStory.update({
            where: {
                id
            },
            data: {
                isActive: !story.isActive
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/stories');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error toggling story active:', error);
        return {
            success: false,
            error: 'Failed to toggle story'
        };
    }
}
async function toggleStoryFeaturedAction(id) {
    await verifyAdmin();
    // Using shared prisma instance
    try {
        const story = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].successStory.findUnique({
            where: {
                id
            }
        });
        if (!story) throw new Error('Story not found');
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].successStory.update({
            where: {
                id
            },
            data: {
                isFeatured: !story.isFeatured
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/stories');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
        return {
            success: true
        };
    } catch (error) {
        console.error('[Admin] Error toggling story featured:', error);
        return {
            success: false,
            error: 'Failed to toggle story'
        };
    }
}
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
function generateTempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const specialChars = '!@#$%';
    let password = '';
    // 8 alphanumeric chars
    for(let i = 0; i < 8; i++){
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Add 1-2 special chars
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    return password;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createNewsAction,
    updateNewsAction,
    deleteNewsAction,
    createEventAction,
    updateEventAction,
    deleteEventAction,
    createVideoAction,
    updateVideoAction,
    deleteVideoAction,
    createUserAction,
    updateUserAction,
    toggleUserActiveAction,
    resetUserPasswordAction,
    deleteUserAction,
    createStoryAction,
    updateStoryAction,
    deleteStoryAction,
    toggleStoryActiveAction,
    toggleStoryFeaturedAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createNewsAction, "4064c9275a5dd8a51cadc0c224589707f81afcb1d2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateNewsAction, "60b976d77fcf358c733b88e1c6ba91b72ec423d4a2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteNewsAction, "409db0a7ac0915702b227c9f5fa5fef81dae5bc3ca", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createEventAction, "40c888f0baa0b76a0049d380ccfd46c3dada21d6c6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateEventAction, "60aa0a2350ac5449edf2179a1b789e931c93e23417", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteEventAction, "40034fc164eb1dba7e65466b788c5e9e4fb6d831d0", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createVideoAction, "401544133c464efa021d3566366a42a5bd791e2818", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateVideoAction, "6042942d2e43f59d874bd3c63f95d5c4b8ddfd08fb", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteVideoAction, "40bd823161cabf6900e90cb4305e81d35b925124fe", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createUserAction, "4003d4fb6d7a1cc86e1ffdbac8f5ad17963f33f20b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateUserAction, "604af20f8edb0284e615e26c0c2df1f12b238cc1ce", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(toggleUserActiveAction, "6039eefcab615736b376bef0e59b9ecd009f0500c1", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resetUserPasswordAction, "40ddcd56780be308d0ecaf61b2c791c4d816bdab75", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteUserAction, "40e240888895be694f8fbcd1eb82cb4838a850189a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createStoryAction, "40c0834adad6c1ef01ca9306733bc199a4cf3a15eb", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateStoryAction, "60dcb622ccc5da8e947518945d648122e84b8f38bc", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteStoryAction, "407fecefdf73b34046eae40651407861bc2a20c3e3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(toggleStoryActiveAction, "40def615b95ada202806ce56dbce31f156fc221a02", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(toggleStoryFeaturedAction, "408f13fbdf6698742e338c5c0cd52268c0d094eeac", null);
}),
"[project]/.next-internal/server/app/(admin)/admin/news/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)");
;
;
;
}),
"[project]/.next-internal/server/app/(admin)/admin/news/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4064c9275a5dd8a51cadc0c224589707f81afcb1d2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createNewsAction"],
    "409db0a7ac0915702b227c9f5fa5fef81dae5bc3ca",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteNewsAction"],
    "60b976d77fcf358c733b88e1c6ba91b72ec423d4a2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateNewsAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$admin$292f$admin$2f$news$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(admin)/admin/news/page/actions.js { ACTIONS_MODULE0 => "[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$admin$292f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/(admin)/admin/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_b1ddc5d7._.js.map