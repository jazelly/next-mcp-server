import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
/**
 * Resolve port from command line args or environment variables
 * Returns port number with 8080 as the default
 *
 * Note: The port option is only applicable when using --transport=sse
 * as it controls the HTTP server port for SSE connections.
 */
export function resolvePort() {
    // Get command line arguments
    const args = parseCommandLineArgs();
    // 1. Check command line arguments first (highest priority)
    if (args.port) {
        const port = parseInt(args.port, 10);
        return { port, source: 'command line argument' };
    }
    // 2. Check environment variables
    if (process.env.PORT) {
        const port = parseInt(process.env.PORT, 10);
        return { port, source: 'environment variable' };
    }
    // 3. Default to 4857
    return { port: 4857, source: 'default' };
}
export async function setupSSE(base, server) {
    const app = express();
    const transports = new Map();
    app.use(`${base}/sse`, async (req, res) => {
        const transport = new SSEServerTransport(`${base}/messages`, res);
        transports.set(transport.sessionId, transport);
        res.on('close', () => {
            transports.delete(transport.sessionId);
        });
        await server.connect(transport);
    });
    app.use(`${base}/messages`, async (req, res) => {
        if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
        }
        const query = new URLSearchParams(req.url?.split('?').pop() || '');
        const clientId = query.get('sessionId');
        if (!clientId || typeof clientId !== 'string') {
            res.statusCode = 400;
            res.end('Bad Request due to missing sessionId');
            return;
        }
        const transport = transports.get(clientId);
        if (!transport) {
            res.statusCode = 404;
            res.end('Not Found due to invalid sessionId');
            return;
        }
        await transport.handlePostMessage(req, res);
    });
    return app;
}
/**
 * Parse command line arguments
 * @returns {Record<string, string>}
 */
export function parseCommandLineArgs() {
    // Check if any args start with '--' (the way tsx passes them)
    const args = process.argv.slice(2);
    const parsedManually = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            if (value) {
                // Handle --key=value format
                parsedManually[key] = value;
            }
            else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                // Handle --key value format
                parsedManually[key] = args[i + 1];
                i++; // Skip the next argument as it's the value
            }
            else {
                // Handle --key format (boolean flag)
                parsedManually[key] = 'true';
            }
        }
    }
    // Just use the manually parsed args - removed parseArgs dependency for Node.js <18.3.0 compatibility
    return parsedManually;
}
/**
 * Resolve transport type from command line args or environment variables
 * Returns 'stdio' or 'sse', with 'stdio' as the default
 */
export function resolveTransport() {
    // Get command line arguments
    const args = parseCommandLineArgs();
    // 1. Check command line arguments first (highest priority)
    if (args.transport) {
        const type = args.transport === 'sse' ? 'sse' : 'stdio';
        return { type, source: 'command line argument' };
    }
    // 2. Check environment variables
    if (process.env.TRANSPORT) {
        const type = process.env.TRANSPORT === 'sse' ? 'sse' : 'stdio';
        return { type, source: 'environment variable' };
    }
    // 3. Default to localhost sse
    return { type: 'sse', source: 'default' };
}
