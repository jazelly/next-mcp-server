"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
// GET /api/test - Get test data
async function GET(request) {
    return Response.json({ message: 'Test route for router analysis' });
}
// POST /api/test - Create test data
async function POST(request) {
    const body = await request.json();
    // Validate the request body
    if (!body || !body.name) {
        return Response.json({ error: 'Missing required field: name' }, { status: 400 });
    }
    return Response.json({
        id: '123',
        name: body.name,
        createdAt: new Date().toISOString()
    }, { status: 201 });
}
