"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const validation_1 = require("@/lib/validation");
/**
 * GET /api/products/[id] - Get a product by ID
 * @param request - The incoming request object
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response with product data
 */
async function GET(request, context) {
    try {
        const { id } = context.params;
        // Validate ID format
        const validatedId = validation_1.ProductIdSchema.safeParse({ id });
        if (!validatedId.success) {
            return server_1.NextResponse.json({
                error: 'Invalid product ID format',
                status: 400
            }, { status: 400 });
        }
        // Find product by ID
        const product = await db_1.productDb.getById(id);
        if (!product) {
            return server_1.NextResponse.json({
                error: 'Product not found',
                status: 404
            }, { status: 404 });
        }
        return server_1.NextResponse.json({
            data: product,
            status: 200
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching product:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
/**
 * PUT /api/products/[id] - Update a product
 * @param request - The incoming request object with updated product data
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response with updated product data
 */
async function PUT(request, context) {
    try {
        const { id } = context.params;
        const body = await request.json();
        // Validate ID format
        const validatedId = validation_1.ProductIdSchema.safeParse({ id });
        if (!validatedId.success) {
            return server_1.NextResponse.json({
                error: 'Invalid product ID format',
                status: 400
            }, { status: 400 });
        }
        // Validate request body
        const validatedData = validation_1.ProductUpdateSchema.safeParse(body);
        if (!validatedData.success) {
            return server_1.NextResponse.json({
                error: 'Invalid request data',
                message: validatedData.error.message,
                status: 400
            }, { status: 400 });
        }
        // Check if category exists if categoryId is provided
        if (body.categoryId) {
            const category = await db_1.categoryDb.getById(body.categoryId);
            if (!category) {
                return server_1.NextResponse.json({
                    error: 'Category not found',
                    status: 400
                }, { status: 400 });
            }
        }
        // Update product
        const updatedProduct = await db_1.productDb.update(id, validatedData.data);
        if (!updatedProduct) {
            return server_1.NextResponse.json({
                error: 'Product not found',
                status: 404
            }, { status: 404 });
        }
        return server_1.NextResponse.json({
            data: updatedProduct,
            message: 'Product updated successfully',
            status: 200
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error updating product:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
/**
 * DELETE /api/products/[id] - Delete a product
 * @param request - The incoming request object
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response confirming deletion
 */
async function DELETE(request, context) {
    try {
        const { id } = context.params;
        // Validate ID format
        const validatedId = validation_1.ProductIdSchema.safeParse({ id });
        if (!validatedId.success) {
            return server_1.NextResponse.json({
                error: 'Invalid product ID format',
                status: 400
            }, { status: 400 });
        }
        // Delete product
        const deleted = await db_1.productDb.delete(id);
        if (!deleted) {
            return server_1.NextResponse.json({
                error: 'Product not found',
                status: 404
            }, { status: 404 });
        }
        return server_1.NextResponse.json({
            message: 'Product deleted successfully',
            status: 200
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        return server_1.NextResponse.json({
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}
