import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/db';
import { PaginationQuerySchema, UserCreateSchema } from '@/lib/validation';
import { ApiResponse, User, UserCreateInput } from '@/types';

/**
 * GET /api/users - Get a list of users with pagination
 * @param request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with users data
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ users: User[]; total: number }>>> {
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
    const { users, total } = await userDb.getAll(validPage, validLimit);
    
    return NextResponse.json(
      {
        data: { users, total },
        status: 200
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
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
 * POST /api/users - Create a new user
 * @param request - The incoming request object with user data
 * @returns {Promise<NextResponse>} JSON response with the created user
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const body: UserCreateInput = await request.json();
    
    // Validate request body
    const validatedData = UserCreateSchema.safeParse(body);
    
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
    
    // Check if email already exists
    const existingUsers = await userDb.getAll();
    const emailExists = existingUsers.users.some(user => user.email === body.email);
    
    if (emailExists) {
      return NextResponse.json(
        {
          error: 'Email already in use',
          status: 409
        },
        { status: 409 }
      );
    }
    
    // Create new user
    const newUser = await userDb.create(validatedData.data);
    
    return NextResponse.json(
      {
        data: newUser,
        message: 'User created successfully',
        status: 201
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 500
      },
      { status: 500 }
    );
  }
}