"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const validation_1 = require("@/lib/validation");
/**
 * GET /api/users/[id] - Get a user by ID
 * @param request - The incoming request object
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response with user data
 */
async function GET(request, context) {
    try {
        const { id } = context.params;
        // Validate ID format
        const validatedId = validation_1.UserIdSchema.safeParse({ id });
        if (!validatedId.success) {
            return server_1.NextResponse.json({
                error: 'Invalid user ID format',
                status: 400
            }, { status: 400 });
        }
        // Find user by ID
        const user = await db_1.userDb.getById(id);
        if (!user) {
            return server_1.NextResponse.json({
                error: 'User not found',
                status: 404
            }, { status: 404 });
        }
        return server_1.NextResponse.json({
            data: user,
            status: 200
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
/**
 * PUT /api/users/[id] - Update a user
 * @param request - The incoming request object with updated user data
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response with updated user data
 */
async function PUT(request, context) {
    try {
        const { id } = context.params;
        const body = await request.json();
        // Validate ID format
        const validatedId = validation_1.UserIdSchema.safeParse({ id });
        if (!validatedId.success) {
            return server_1.NextResponse.json({
                error: 'Invalid user ID format',
                status: 400
            }, { status: 400 });
        }
        // Validate request body
        const validatedData = validation_1.UserUpdateSchema.safeParse(body);
        if (!validatedData.success) {
            return server_1.NextResponse.json({
                error: 'Invalid request data',
                message: validatedData.error.message,
                status: 400
            }, { status: 400 });
        }
        // Update user
        const updatedUser = await db_1.userDb.update(id, validatedData.data);
        if (!updatedUser) {
            return server_1.NextResponse.json({
                error: 'User not found',
                status: 404
            }, { status: 404 });
        }
        return server_1.NextResponse.json({
            data: updatedUser,
            message: 'User updated successfully',
            status: 200
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error updating user:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
/**
 * DELETE /api/users/[id] - Delete a user
 * @param request - The incoming request object
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response confirming deletion
 */
async function DELETE(request, context) {
    try {
        const { id } = context.params;
        // Validate ID format
        const validatedId = validation_1.UserIdSchema.safeParse({ id });
        if (!validatedId.success) {
            return server_1.NextResponse.json({
                error: 'Invalid user ID format',
                status: 400
            }, { status: 400 });
        }
        // Delete user
        const deleted = await db_1.userDb.delete(id);
        if (!deleted) {
            return server_1.NextResponse.json({
                error: 'User not found',
                status: 404
            }, { status: 404 });
        }
        return server_1.NextResponse.json({
            message: 'User deleted successfully',
            status: 200
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
