// next-route-analyzer.js
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { z } from 'zod';
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

// Define Zod schemas for route information
export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);

export const GetRoutersInfoSchema = z.object({
  projectDir: z.string().describe('The directory of the Next.js project. Must be absolute path.')
});

export const RouteParameterSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(true)
});

export const RouteHandlerSchema = z.object({
  method: HttpMethodSchema,
  path: z.string(),
  functionSignature: z.string(),
  description: z.string().optional(),
  parameters: z.array(RouteParameterSchema).default([]),
  requestBodySchema: z.string().optional(),
  responseType: z.string().optional(),
  statusCodes: z.array(
    z.object({
      code: z.number(),
      description: z.string().optional()
    })
  ).default([])
});

export const RouteInfoSchema = z.object({
  filePath: z.string(),
  implementationPath: z.string(),
  apiPath: z.string(),
  handlers: z.array(RouteHandlerSchema).default([]),
  imports: z.array(z.string()).default([]),
  validationSchemas: z.array(z.string()).default([])
});

/**
 * Main function to analyze Next.js routes
 * @returns {Promise<Array<z.infer<typeof RouteInfoSchema>>>} - Array of route information
 */
async function analyzeNextRoutes(projectDir: string): Promise<Array<z.infer<typeof RouteInfoSchema>>> {
  const routeFiles = await findRouteFiles(projectDir);
  const routesInfo = [];

  for (const filePath of routeFiles) {
    try {
      let implementationContent: string | null = null;
      
      try {
        implementationContent = await readFile(filePath, 'utf8');
      } catch (error) {
        console.warn(`Could not read implementation file ${filePath}: ${error.message}`);
        continue;
      }
      
      // Parse the route information
      const apiPath = extractApiPath(filePath, implementationContent);
      const handlers = extractRouteHandlers(implementationContent, apiPath);
      const imports = extractImports(implementationContent);
      const validationSchemas = extractValidationSchemas(implementationContent);
      
      const routeInfo = RouteInfoSchema.parse({
        filePath,
        implementationPath: filePath,
        apiPath,
        handlers,
        imports,
        validationSchemas
      });
      
      routesInfo.push(routeInfo);
    } catch (error) {
      console.error(`Error processing route file ${filePath}:`, error);
    }
  }

  return routesInfo;
}


/**
 * Find all route.ts/js files directly in the project directory
 * @param {string} dir - Project directory to search
 * @returns {Promise<Array<string>>} - Array of file paths
 */
async function findRouteFiles(dir: string): Promise<Array<string>> {
  const routeFiles: string[] = [];
  
  async function searchDir(currentDir: string) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules, .git, .next, and other common directories to avoid excessive scanning
          if (['node_modules', '.git', '.next', 'dist', 'build', 'out'].includes(entry.name)) {
            continue;
          }
          await searchDir(fullPath);
        } else if (entry.name === 'route.ts' || entry.name === 'route.js' || 
                  entry.name === 'route.tsx' || entry.name === 'route.jsx') {
          // Only include routes inside the app directory
          if (fullPath.includes(`${path.sep}app${path.sep}`)) {
            routeFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}:`, error.message);
    }
  }
  
  await searchDir(dir);
  return routeFiles;
}

/**
 * Extract the path to the actual implementation file from a type file
 * @param {string} fileContent - Content of the route.ts type file
 * @returns {string|null} - Path to the implementation file or null
 */
function extractImplementationPath(fileContent: string): string | null {
  const pathRegex = /\/\/ File: (.+)/;
  const match = fileContent.match(pathRegex);
  
  if (match && match[1]) {
    // Convert Windows path if necessary
    return match[1].replace(/\\/g, path.sep);
  }
  
  return null;
}

/**
 * Extract the API path from the file path and implementation
 * @param {string} filePath - Path to the route.ts type file
 * @param {string} implementationContent - Content of the implementation file
 * @returns {string} - API path
 */
function extractApiPath(filePath: string, implementationContent: string): string {
  // Try to extract from comments in the implementation file first
  const commentPathRegex = /\/\/ (GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS) (\/api\/[^\s]+) -/;
  const commentMatch = implementationContent.match(commentPathRegex);
  
  if (commentMatch && commentMatch[2]) {
    return commentMatch[2];
  }
  
  // Fall back to deriving from file path
  const pathParts = filePath.split(path.sep);
  const apiIndex = pathParts.indexOf('api');
  
  if (apiIndex !== -1) {
    const routeParts = pathParts.slice(apiIndex, pathParts.length - 1);
    return '/' + routeParts.join('/');
  }
  
  return '';
}

/**
 * Extract route handlers from the implementation file
 * @param {string} content - Content of the implementation file
 * @param {string} apiPath - API path
 * @returns {Array} - Array of route handlers
 */
function extractRouteHandlers(content: string, apiPath: string): Array<z.infer<typeof RouteHandlerSchema>> {
  const handlers: Array<z.infer<typeof RouteHandlerSchema>> = [];
  const methodRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*\(([^)]*)\)/g;
  const statusCodeRegex = /status:\s*(\d+)/g;
  const commentRegex = /\/\/\s*(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+([^\s]+)\s*-\s*([^\n]+)/g;
  
  // Extract descriptions from comments
  const descriptions: Record<string, string> = {};
  let commentMatch: RegExpExecArray | null;
  while ((commentMatch = commentRegex.exec(content)) !== null) {
    const method = commentMatch[1];
    const description = commentMatch[3].trim();
    descriptions[method] = description;
  }
  
  // Extract handlers
  let methodMatch: RegExpExecArray | null = null;
  while ((methodMatch = methodRegex.exec(content)) !== null) {
    const method = methodMatch[1] as z.infer<typeof HttpMethodSchema>;
    const functionSignature = methodMatch[0];
    const parameterString = methodMatch[2];
    
    // Extract parameters
    const parameters = extractParameters(parameterString);
    
    // Extract status codes
    const handlerContent = extractFunctionBody(content, methodMatch.index);
    const statusCodes = [];
    let statusMatch;
    while ((statusMatch = statusCodeRegex.exec(handlerContent)) !== null) {
      statusCodes.push({
        code: parseInt(statusMatch[1]),
        description: getStatusCodeDescription(parseInt(statusMatch[1]))
      });
    }
    
    // Extract request body schema if applicable
    const requestBodySchema = extractRequestBodySchema(handlerContent);
    
    // Extract response type
    const responseType = extractResponseType(handlerContent);
    
    handlers.push({
      method,
      path: apiPath,
      functionSignature,
      description: descriptions[method] || undefined,
      parameters,
      requestBodySchema,
      responseType,
      statusCodes
    });
  }
  
  return handlers;
}

/**
 * Extract parameters from a function signature
 * @param {string} parameterString - Parameter string from function signature
 * @returns {Array} - Array of parameters
 */
function extractParameters(parameterString: string): Array<z.infer<typeof RouteParameterSchema>> {
  const parameters: Array<z.infer<typeof RouteParameterSchema>> = [];
  
  // Split by comma, but handle nested objects
  const paramParts = [];
  let currentPart = '';
  let braceCount = 0;
  
  for (let i = 0; i < parameterString.length; i++) {
    const char = parameterString[i];
    
    if (char === '{') braceCount++;
    else if (char === '}') braceCount--;
    
    if (char === ',' && braceCount === 0) {
      paramParts.push(currentPart.trim());
      currentPart = '';
    } else {
      currentPart += char;
    }
  }
  
  if (currentPart.trim()) {
    paramParts.push(currentPart.trim());
  }
  
  for (const part of paramParts) {
    // Parse parameter name and type
    const matches = part.match(/(\w+)\s*:\s*(.+)/);
    
    if (matches) {
      const [, name, type] = matches;
      parameters.push({
        name,
        type: type.trim(),
        required: !type.includes('?') && !type.includes('undefined')
      });
    }
  }
  
  return parameters;
}

/**
 * Extract the function body
 * @param {string} content - Content of the implementation file
 * @param {number} startIndex - Start index of the function
 * @returns {string} - Function body
 */
function extractFunctionBody(content: string, startIndex: number): string {
  // Find the opening bracket
  let openBracketIndex = content.indexOf('{', startIndex);
  if (openBracketIndex === -1) return '';
  
  // Find the closing bracket (accounting for nested brackets)
  let bracketCount = 1;
  let endIndex = openBracketIndex + 1;
  
  while (bracketCount > 0 && endIndex < content.length) {
    const char = content[endIndex];
    if (char === '{') bracketCount++;
    else if (char === '}') bracketCount--;
    endIndex++;
  }
  
  return content.substring(openBracketIndex, endIndex);
}

/**
 * Extract request body schema from a function body
 * @param {string} functionBody - Function body
 * @returns {string|undefined} - Request body schema
 */
function extractRequestBodySchema(functionBody: string): string | undefined {
  // Look for schema validation
  const schemaRegex = /(\w+)\.safeParse\(body\)/;
  const match = functionBody.match(schemaRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return undefined;
}

/**
 * Extract response type from a function body
 * @param {string} functionBody - Function body
 * @returns {string} - Response type
 */
function extractResponseType(functionBody: string): string {
  if (functionBody.includes('NextResponse.json(')) {
    return 'JSON';
  } else if (functionBody.includes('new NextResponse(')) {
    return 'Raw';
  } else if (functionBody.includes('Response.json(')) {
    return 'JSON';
  } else if (functionBody.includes('new Response(')) {
    return 'Raw';
  }
  
  return 'Unknown';
}

/**
 * Extract imports from the implementation file
 * @param {string} content - Content of the implementation file
 * @returns {Array<string>} - Array of imports
 */
function extractImports(content: string): Array<string> {
  const imports = [];
  const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"];?/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(`import ${match[1]} from '${match[2]}'`);
  }
  
  return imports;
}

/**
 * Extract validation schemas from the implementation file
 * @param {string} content - Content of the implementation file
 * @returns {Array<string>} - Array of validation schema names
 */
function extractValidationSchemas(content: string): Array<string> {
  const schemas: string[] = [];
  const schemaRegex = /(\w+)Schema\.safeParse/g;
  
  let match;
  while ((match = schemaRegex.exec(content)) !== null) {
    schemas.push(match[1]);
  }
  
  return [...new Set(schemas)]; // Remove duplicates
}

/**
 * Get a description for an HTTP status code
 * @param {number} code - HTTP status code
 * @returns {string} - Description
 */
function getStatusCodeDescription(code: number): string {
  const statusCodes: Record<number, string> = {
    200: 'OK - Successful request',
    201: 'Created - Resource created successfully',
    204: 'No Content - Request succeeded with no response body',
    400: 'Bad Request - Invalid request data',
    401: 'Unauthorized - Authentication required',
    403: 'Forbidden - Permission denied',
    404: 'Not Found - Resource not found',
    500: 'Internal Server Error - Server error occurred'
  };
  
  return statusCodes[code] || 'Unknown status code';
}

/**
 * Run the analyzer and print the results
 */
export async function getRoutersInfo(projectDir: string) {
  try {
    const routesInfo = await analyzeNextRoutes(projectDir);

    console.log('API Routes Analysis:');
    console.log(JSON.stringify(routesInfo, null, 2));
    
    // Also output a more human-readable summary
    console.log('\nAPI Routes Summary:');
    for (const route of routesInfo) {
      console.log(`\n${route.apiPath}`);
      for (const handler of route.handlers) {
        console.log(`  ${handler.method} - ${handler.description || 'No description'}`);
        console.log(`    Parameters: ${handler.parameters.length ? handler.parameters.map(p => p.name).join(', ') : 'None'}`);
        console.log(`    Status Codes: ${handler.statusCodes.map(s => s.code).join(', ')}`);
      }
    }
    
    return routesInfo;
  } catch (error) {
    console.error('Error analyzing routes:', error);
    throw error;
  }
}
