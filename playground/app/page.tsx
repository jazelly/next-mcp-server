import React from 'react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Next.js API Routes Playground</h1>
      
      <p className="mb-4">
        This is a simple playground for testing Next.js API routes. The following API endpoints are available:
      </p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">User Endpoints</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><code>GET /api/users</code> - Get all users (with pagination)</li>
            <li><code>POST /api/users</code> - Create a new user</li>
            <li><code>GET /api/users/[id]</code> - Get a user by ID</li>
            <li><code>PUT /api/users/[id]</code> - Update a user</li>
            <li><code>DELETE /api/users/[id]</code> - Delete a user</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Product Endpoints</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><code>GET /api/products</code> - Get all products (with pagination)</li>
            <li><code>POST /api/products</code> - Create a new product</li>
            <li><code>GET /api/products/[id]</code> - Get a product by ID</li>
            <li><code>PUT /api/products/[id]</code> - Update a product</li>
            <li><code>DELETE /api/products/[id]</code> - Delete a product</li>
            <li><code>GET /api/products/categories</code> - Get all product categories</li>
            <li><code>POST /api/products/categories</code> - Create a new product category</li>
          </ul>
        </section>
      </div>
    </div>
  );
}