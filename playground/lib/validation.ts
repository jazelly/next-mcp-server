import { z } from 'zod';
import { UserRole } from '@/types';

// User schemas
export const UserCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(['admin', 'user', 'guest'] as const).optional()
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(['admin', 'user', 'guest'] as const).optional()
});

export const UserIdSchema = z.object({
  id: z.string().uuid("Invalid user ID format")
});

// Product schemas
export const ProductCreateSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().nonnegative("Stock cannot be negative"),
  categoryId: z.string().uuid("Invalid category ID format")
});

export const ProductUpdateSchema = z.object({
  name: z.string().min(1, "Product name is required").optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  stock: z.number().nonnegative("Stock cannot be negative").optional(),
  categoryId: z.string().uuid("Invalid category ID format").optional()
});

export const ProductIdSchema = z.object({
  id: z.string().uuid("Invalid product ID format")
});

// Category schemas
export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional()
});

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters")
});

// Webhook validation schemas
export const StripeWebhookSchema = z.object({
  id: z.string(),
  type: z.enum([
    'payment_intent.succeeded', 
    'payment_intent.failed', 
    'customer.subscription.created'
  ]),
  data: z.object({
    object: z.object({
      id: z.string(),
      amount: z.number().optional(),
      status: z.string().optional(),
      customer: z.string().optional()
    })
  })
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10)
});