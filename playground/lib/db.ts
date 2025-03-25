/**
 * This is a mock database service for the playground
 * In a real application, you would use a real database like PostgreSQL, MongoDB, etc.
 */
import { 
  User, 
  UserCreateInput, 
  UserUpdateInput,
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  Category,
  LoginInput
} from '@/types';

// Mock data
const users: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Test User',
    email: 'user@example.com',
    role: 'user',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  }
];

const categories: Category[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Electronics',
    description: 'Electronic devices and accessories'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Books',
    description: 'Books and publications'
  }
];

const products: Product[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Laptop',
    description: 'High-performance laptop',
    price: 1299.99,
    stock: 10,
    categoryId: '550e8400-e29b-41d4-a716-446655440002',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Programming Book',
    description: 'Learn programming with this book',
    price: 29.99,
    stock: 50,
    categoryId: '550e8400-e29b-41d4-a716-446655440003',
    createdAt: new Date('2023-01-04'),
    updatedAt: new Date('2023-01-04')
  }
];

// Helper function to generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// User database functions
export const userDb = {
  getAll: async (page = 1, limit = 10): Promise<{ users: User[], total: number }> => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return { 
      users: users.slice(start, end),
      total: users.length
    };
  },
  
  getById: async (id: string): Promise<User | null> => {
    return users.find(user => user.id === id) || null;
  },
  
  create: async (data: UserCreateInput): Promise<User> => {
    const newUser: User = {
      id: generateUUID(),
      ...data,
      role: data.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },
  
  update: async (id: string, data: UserUpdateInput): Promise<User | null> => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    const updatedUser = {
      ...users[index],
      ...data,
      updatedAt: new Date()
    };
    
    users[index] = updatedUser;
    return updatedUser;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    users.splice(index, 1);
    return true;
  },
  
  authenticate: async (credentials: LoginInput): Promise<User | null> => {
    // In a real app, you would check password hash
    const user = users.find(u => u.email === credentials.email);
    return user || null;
  }
};

// Product database functions
export const productDb = {
  getAll: async (page = 1, limit = 10): Promise<{ products: Product[], total: number }> => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return { 
      products: products.slice(start, end),
      total: products.length
    };
  },
  
  getById: async (id: string): Promise<Product | null> => {
    return products.find(product => product.id === id) || null;
  },
  
  create: async (data: ProductCreateInput): Promise<Product> => {
    const newProduct: Product = {
      id: generateUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    products.push(newProduct);
    return newProduct;
  },
  
  update: async (id: string, data: ProductUpdateInput): Promise<Product | null> => {
    const index = products.findIndex(product => product.id === id);
    if (index === -1) return null;
    
    const updatedProduct = {
      ...products[index],
      ...data,
      updatedAt: new Date()
    };
    
    products[index] = updatedProduct;
    return updatedProduct;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const index = products.findIndex(product => product.id === id);
    if (index === -1) return false;
    
    products.splice(index, 1);
    return true;
  },
  
  getByCategoryId: async (categoryId: string): Promise<Product[]> => {
    return products.filter(product => product.categoryId === categoryId);
  }
};

// Category database functions
export const categoryDb = {
  getAll: async (): Promise<Category[]> => {
    return categories;
  },
  
  getById: async (id: string): Promise<Category | null> => {
    return categories.find(category => category.id === id) || null;
  },
  
  create: async (data: { name: string; description?: string }): Promise<Category> => {
    const newCategory: Category = {
      id: generateUUID(),
      ...data
    };
    categories.push(newCategory);
    return newCategory;
  }
};