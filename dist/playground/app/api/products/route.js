"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const validation_1 = require("@/lib/validation");
/**
 * GET /api/products - Get a list of products with pagination
 * @param request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with products data
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
        const { products, total } = await db_1.productDb.getAll(validPage, validLimit);
        return server_1.NextResponse.json({
            data: { products, total },
            status: 200
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
/**
 * POST /api/products - Create a new product
 * @param request - The incoming request object with product data
 * @returns {Promise<NextResponse>} JSON response with the created product
 */
async function POST(request) {
    try {
        const body = await request.json();
        // Validate request body
        const validatedData = validation_1.ProductCreateSchema.safeParse(body);
        if (!validatedData.success) {
            return server_1.NextResponse.json({
                error: 'Invalid request data',
                message: validatedData.error.message,
                status: 400
            }, { status: 400 });
        }
        // Check if category exists
        const category = await db_1.categoryDb.getById(body.categoryId);
        if (!category) {
            return server_1.NextResponse.json({
                error: 'Category not found',
                status: 400
            }, { status: 400 });
        }
        // Create new product
        const newProduct = await db_1.productDb.create(validatedData.data);
        return server_1.NextResponse.json({
            data: newProduct,
            message: 'Product created successfully',
            status: 201
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating product:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
