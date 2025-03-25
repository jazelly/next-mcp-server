// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  role?: UserRole;
}

// Product related types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

// Authentication related types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

// Webhook types
export interface WebhookPayload {
  id: string;
  type: string;
  data: Record<string, any>;
  createdAt: number;
}

export interface StripeWebhookPayload extends WebhookPayload {
  type: 'payment_intent.succeeded' | 'payment_intent.failed' | 'customer.subscription.created';
  data: {
    object: {
      id: string;
      amount?: number;
      status?: string;
      customer?: string;
    }
  };
}