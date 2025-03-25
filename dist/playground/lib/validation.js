"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationQuerySchema = exports.StripeWebhookSchema = exports.RegisterSchema = exports.LoginSchema = exports.CategorySchema = exports.ProductIdSchema = exports.ProductUpdateSchema = exports.ProductCreateSchema = exports.UserIdSchema = exports.UserUpdateSchema = exports.UserCreateSchema = void 0;
const zod_1 = require("zod");
// User schemas
exports.UserCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    role: zod_1.z.enum(['admin', 'user', 'guest']).optional()
});
exports.UserUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
    email: zod_1.z.string().email("Invalid email address").optional(),
    role: zod_1.z.enum(['admin', 'user', 'guest']).optional()
});
exports.UserIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid user ID format")
});
// Product schemas
exports.ProductCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Product name is required"),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive("Price must be a positive number"),
    stock: zod_1.z.number().nonnegative("Stock cannot be negative"),
    categoryId: zod_1.z.string().uuid("Invalid category ID format")
});
exports.ProductUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Product name is required").optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive("Price must be a positive number").optional(),
    stock: zod_1.z.number().nonnegative("Stock cannot be negative").optional(),
    categoryId: zod_1.z.string().uuid("Invalid category ID format").optional()
});
exports.ProductIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid product ID format")
});
// Category schemas
exports.CategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Category name is required"),
    description: zod_1.z.string().optional()
});
// Authentication schemas
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters")
});
exports.RegisterSchema = exports.LoginSchema.extend({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters")
});
// Webhook validation schemas
exports.StripeWebhookSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum([
        'payment_intent.succeeded',
        'payment_intent.failed',
        'customer.subscription.created'
    ]),
    data: zod_1.z.object({
        object: zod_1.z.object({
            id: zod_1.z.string(),
            amount: zod_1.z.number().optional(),
            status: zod_1.z.string().optional(),
            customer: zod_1.z.string().optional()
        })
    })
});
exports.PaginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(10)
});
