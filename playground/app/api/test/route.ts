// GET /api/test - Get test data
export async function GET(request: Request) {
  return Response.json({ message: 'Test route for router analysis' });
}

// POST /api/test - Create test data
export async function POST(request: Request) {
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