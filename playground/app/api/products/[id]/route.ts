import { NextRequest, NextResponse } from 'next/server';
import { productDb, categoryDb } from '@/lib/db';
import { ProductIdSchema, ProductUpdateSchema } from '@/lib/validation';
import { ApiResponse, Product, ProductUpdateInput } from '@/types';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/products/[id] - Get a product by ID
 * @param request - The incoming request object
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response with product data
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const { id } = context.params;
    
    // Validate ID format
    const validatedId = ProductIdSchema.safeParse({ id });
    
    if (!validatedId.success) {
      return NextResponse.json(
        {
          error: 'Invalid product ID format',
          status: 400
        },
        { status: 400 }
      );
    }
    
    // Find product by ID
    const product = await productDb.getById(id);
    
    if (!product) {
      return NextResponse.json(
        {
          error: 'Product not found',
          status: 404
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        data: product,
        status: 200
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id] - Update a product
 * @param request - The incoming request object with updated product data
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response with updated product data
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const { id } = context.params;
    const body: ProductUpdateInput = await request.json();
    
    // Validate ID format
    const validatedId = ProductIdSchema.safeParse({ id });
    
    if (!validatedId.success) {
      return NextResponse.json(
        {
          error: 'Invalid product ID format',
          status: 400
        },
        { status: 400 }
      );
    }
    
    // Validate request body
    const validatedData = ProductUpdateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          message: validatedData.error.message,
          status: 400
        },
        { status: 400 }
      );
    }
    
    // Check if category exists if categoryId is provided
    if (body.categoryId) {
      const category = await categoryDb.getById(body.categoryId);
      
      if (!category) {
        return NextResponse.json(
          {
            error: 'Category not found',
            status: 400
          },
          { status: 400 }
        );
      }
    }
    
    // Update product
    const updatedProduct = await productDb.update(id, validatedData.data);
    
    if (!updatedProduct) {
      return NextResponse.json(
        {
          error: 'Product not found',
          status: 404
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        data: updatedProduct,
        message: 'Product updated successfully',
        status: 200
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id] - Delete a product
 * @param request - The incoming request object
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response confirming deletion
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = context.params;
    
    // Validate ID format
    const validatedId = ProductIdSchema.safeParse({ id });
    
    if (!validatedId.success) {
      return NextResponse.json(
        {
          error: 'Invalid product ID format',
          status: 400
        },
        { status: 400 }
      );
    }
    
    // Delete product
    const deleted = await productDb.delete(id);
    
    if (!deleted) {
      return NextResponse.json(
        {
          error: 'Product not found',
          status: 404
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        message: 'Product deleted successfully',
        status: 200
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 500
      },
      { status: 500 }
    );
  }
}