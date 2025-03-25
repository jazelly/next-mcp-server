import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/db';
import { UserIdSchema, UserUpdateSchema } from '@/lib/validation';
import { ApiResponse, User, UserUpdateInput } from '@/types';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/users/[id] - Get a user by ID
 * @param request - The incoming request object
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response with user data
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const { id } = context.params;
    
    // Validate ID format
    const validatedId = UserIdSchema.safeParse({ id });
    
    if (!validatedId.success) {
      return NextResponse.json(
        {
          error: 'Invalid user ID format',
          status: 400
        },
        { status: 400 }
      );
    }
    
    // Find user by ID
    const user = await userDb.getById(id);
    
    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
          status: 404
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        data: user,
        status: 200
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
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
 * PUT /api/users/[id] - Update a user
 * @param request - The incoming request object with updated user data
 * @param context - Contains route parameters
 * @returns {Promise<NextResponse>} JSON response with updated user data
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const { id } = context.params;
    const body: UserUpdateInput = await request.json();
    
    // Validate ID format
    const validatedId = UserIdSchema.safeParse({ id });
    
    if (!validatedId.success) {
      return NextResponse.json(
        {
          error: 'Invalid user ID format',
          status: 400
        },
        { status: 400 }
      );
    }
    
    // Validate request body
    const validatedData = UserUpdateSchema.safeParse(body);
    
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
    
    // Update user
    const updatedUser = await userDb.update(id, validatedData.data);
    
    if (!updatedUser) {
      return NextResponse.json(
        {
          error: 'User not found',
          status: 404
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        data: updatedUser,
        message: 'User updated successfully',
        status: 200
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
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
 * DELETE /api/users/[id] - Delete a user
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
    const validatedId = UserIdSchema.safeParse({ id });
    
    if (!validatedId.success) {
      return NextResponse.json(
        {
          error: 'Invalid user ID format',
          status: 400
        },
        { status: 400 }
      );
    }
    
    // Delete user
    const deleted = await userDb.delete(id);
    
    if (!deleted) {
      return NextResponse.json(
        {
          error: 'User not found',
          status: 404
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        message: 'User deleted successfully',
        status: 200
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 500
      },
      { status: 500 }
    );
  }
}