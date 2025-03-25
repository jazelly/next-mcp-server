"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryDb = exports.productDb = exports.userDb = void 0;
// Mock data
const users = [
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
const categories = [
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
const products = [
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
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
// User database functions
exports.userDb = {
    getAll: async (page = 1, limit = 10) => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            users: users.slice(start, end),
            total: users.length
        };
    },
    getById: async (id) => {
        return users.find(user => user.id === id) || null;
    },
    create: async (data) => {
        const newUser = {
            id: generateUUID(),
            ...data,
            role: data.role || 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        users.push(newUser);
        return newUser;
    },
    update: async (id, data) => {
        const index = users.findIndex(user => user.id === id);
        if (index === -1)
            return null;
        const updatedUser = {
            ...users[index],
            ...data,
            updatedAt: new Date()
        };
        users[index] = updatedUser;
        return updatedUser;
    },
    delete: async (id) => {
        const index = users.findIndex(user => user.id === id);
        if (index === -1)
            return false;
        users.splice(index, 1);
        return true;
    },
    authenticate: async (credentials) => {
        // In a real app, you would check password hash
        const user = users.find(u => u.email === credentials.email);
        return user || null;
    }
};
// Product database functions
exports.productDb = {
    getAll: async (page = 1, limit = 10) => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            products: products.slice(start, end),
            total: products.length
        };
    },
    getById: async (id) => {
        return products.find(product => product.id === id) || null;
    },
    create: async (data) => {
        const newProduct = {
            id: generateUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        products.push(newProduct);
        return newProduct;
    },
    update: async (id, data) => {
        const index = products.findIndex(product => product.id === id);
        if (index === -1)
            return null;
        const updatedProduct = {
            ...products[index],
            ...data,
            updatedAt: new Date()
        };
        products[index] = updatedProduct;
        return updatedProduct;
    },
    delete: async (id) => {
        const index = products.findIndex(product => product.id === id);
        if (index === -1)
            return false;
        products.splice(index, 1);
        return true;
    },
    getByCategoryId: async (categoryId) => {
        return products.filter(product => product.categoryId === categoryId);
    }
};
// Category database functions
exports.categoryDb = {
    getAll: async () => {
        return categories;
    },
    getById: async (id) => {
        return categories.find(category => category.id === id) || null;
    },
    create: async (data) => {
        const newCategory = {
            id: generateUUID(),
            ...data
        };
        categories.push(newCategory);
        return newCategory;
    }
};
