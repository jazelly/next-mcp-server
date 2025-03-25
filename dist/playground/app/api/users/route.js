"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const validation_1 = require("@/lib/validation");
/**
 * GET /api/users - Get a list of users with pagination
 * @param request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with users data
 */
async function GET(request) {
    try {
        // Parse query parameters for pagination
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        const limit = url.searchParams.get('limit');
        const queryParams = validation_1.PaginationQuerySchema.safeParse({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        });
        if (!queryParams.success) {
            return server_1.NextResponse.json({
                error: 'Invalid query parameters',
                status: 400
            }, { status: 400 });
        }
        const { page: validPage, limit: validLimit } = queryParams.data;
        const { users, total } = await db_1.userDb.getAll(validPage, validLimit);
        return server_1.NextResponse.json({
            data: { users, total },
            status: 200
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
/**
 * POST /api/users - Create a new user
 * @param request - The incoming request object with user data
 * @returns {Promise<NextResponse>} JSON response with the created user
 */
async function POST(request) {
    try {
        const body = await request.json();
        // Validate request body
        const validatedData = validation_1.UserCreateSchema.safeParse(body);
        if (!validatedData.success) {
            return server_1.NextResponse.json({
                error: 'Invalid request data',
                message: validatedData.error.message,
                status: 400
            }, { status: 400 });
        }
        // Check if email already exists
        const existingUsers = await db_1.userDb.getAll();
        const emailExists = existingUsers.users.some(user => user.email === body.email);
        if (emailExists) {
            return server_1.NextResponse.json({
                error: 'Email already in use',
                status: 409
            }, { status: 409 });
        }
        // Create new user
        const newUser = await db_1.userDb.create(validatedData.data);
        return server_1.NextResponse.json({
            data: newUser,
            message: 'User created successfully',
            status: 201
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating user:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
