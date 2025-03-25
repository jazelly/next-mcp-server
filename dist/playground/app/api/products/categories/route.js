"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const validation_1 = require("@/lib/validation");
/**
 * GET /api/products/categories - Get all product categories
 * @param request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with categories data
 */
async function GET(request) {
    try {
        const categories = await db_1.categoryDb.getAll();
        return server_1.NextResponse.json({
            data: categories,
            status: 200
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
/**
 * POST /api/products/categories - Create a new category
 * @param request - The incoming request object with category data
 * @returns {Promise<NextResponse>} JSON response with the created category
 */
async function POST(request) {
    try {
        const body = await request.json();
        // Validate request body
        const validatedData = validation_1.CategorySchema.safeParse(body);
        if (!validatedData.success) {
            return server_1.NextResponse.json({
                error: 'Invalid request data',
                message: validatedData.error.message,
                status: 400
            }, { status: 400 });
        }
        // Check if category name already exists
        const allCategories = await db_1.categoryDb.getAll();
        const nameExists = allCategories.some(category => category.name.toLowerCase() === body.name.toLowerCase());
        if (nameExists) {
            return server_1.NextResponse.json({
                error: 'Category name already exists',
                status: 409
            }, { status: 409 });
        }
        // Create new category
        const newCategory = await db_1.categoryDb.create(validatedData.data);
        return server_1.NextResponse.json({
            data: newCategory,
            message: 'Category created successfully',
            status: 201
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating category:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
