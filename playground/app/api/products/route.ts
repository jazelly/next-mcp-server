import { NextRequest, NextResponse } from 'next/server';
import { productDb, categoryDb } from '@/lib/db';
import { PaginationQuerySchema, ProductCreateSchema } from '@/lib/validation';
import { ApiResponse, Product, ProductCreateInput } from '@/types';

/**
 * GET /api/products - Get a list of products with pagination
 * @param request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with products data
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ products: Product[]; total: number }>>> {
  try {
    // Parse query parameters for pagination
    const url = new URL(request.url);
    const page = url.searchParams.get('page');
    const limit = url.searchParams.get('limit');
    
    const queryParams = PaginationQuerySchema.safeParse({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10
    });
    
    if (!queryParams.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          status: 400
        },
        { status: 400 }
      );
    }
    
    const { page: validPage, limit: validLimit } = queryParams.data;
    const { products, total } = await productDb.getAll(validPage, validLimit);
    
    return NextResponse.json(
      {
        data: { products, total },
        status: 200
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
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
 * POST /api/products - Create a new product
 * @param request - The incoming request object with product data
 * @returns {Promise<NextResponse>} JSON response with the created product
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const body: ProductCreateInput = await request.json();
    
    // Validate request body
    const validatedData = ProductCreateSchema.safeParse(body);
    
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
    
    // Check if category exists
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
    
    // Create new product
    const newProduct = await productDb.create(validatedData.data);
    
    return NextResponse.json(
      {
        data: newProduct,
        message: 'Product created successfully',
        status: 201
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 500
      },
      { status: 500 }
    );
  }
}