import { NextRequest, NextResponse } from 'next/server';
import { categoryDb } from '@/lib/db';
import { CategorySchema } from '@/lib/validation';
import { ApiResponse, Category } from '@/types';

/**
 * GET /api/products/categories - Get all product categories
 * @param request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with categories data
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Category[]>>> {
  try {
    const categories = await categoryDb.getAll();
    
    return NextResponse.json(
      {
        data: categories,
        status: 200
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
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
 * POST /api/products/categories - Create a new category
 * @param request - The incoming request object with category data
 * @returns {Promise<NextResponse>} JSON response with the created category
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = CategorySchema.safeParse(body);
    
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
    
    // Check if category name already exists
    const allCategories = await categoryDb.getAll();
    const nameExists = allCategories.some(
      category => category.name.toLowerCase() === body.name.toLowerCase()
    );
    
    if (nameExists) {
      return NextResponse.json(
        {
          error: 'Category name already exists',
          status: 409
        },
        { status: 409 }
      );
    }
    
    // Create new category
    const newCategory = await categoryDb.create(validatedData.data);
    
    return NextResponse.json(
      {
        data: newCategory,
        message: 'Category created successfully',
        status: 201
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 500
      },
      { status: 500 }
    );
  }
}