import path from 'path';
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { getRoutersInfo } from '../router.js';

describe('NextJS Router Analysis', () => {
  // Capture console logs for verification
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleLogSpy) consoleLogSpy.mockRestore();
    if (consoleErrorSpy) consoleErrorSpy.mockRestore();
    if (consoleWarnSpy) consoleWarnSpy.mockRestore();
  });

  test('should analyze NextJS routes from playground directory', async () => {
    // Get absolute path to playground directory
    const playgroundDir = path.resolve(process.cwd(), 'playground');
    
    // Call the function we're testing
    const routesInfo = await getRoutersInfo(playgroundDir);
    
    // Expect routesInfo to be an array
    expect(Array.isArray(routesInfo)).toBe(true);
    
    // We should have at least logged information about the routes
    expect(consoleLogSpy).toHaveBeenCalled();
    
    // Verify structure of returned route info
    if (routesInfo.length > 0) {
      const firstRoute = routesInfo[0];
      
      // Check that the structure matches our schema
      expect(firstRoute).toHaveProperty('filePath');
      expect(firstRoute).toHaveProperty('implementationPath');
      expect(firstRoute).toHaveProperty('apiPath');
      expect(firstRoute).toHaveProperty('handlers');
      expect(Array.isArray(firstRoute.handlers)).toBe(true);
      
      // Check handlers if they exist
      if (firstRoute.handlers.length > 0) {
        const firstHandler = firstRoute.handlers[0];
        expect(firstHandler).toHaveProperty('method');
        expect(firstHandler).toHaveProperty('path');
        expect(firstHandler).toHaveProperty('functionSignature');
      }
    }
  });

  test('should handle invalid directory gracefully', async () => {
    // Testing error handling with non-existent directory
    const nonExistentDir = path.resolve(process.cwd(), 'non-existent-dir');
    
    // Expect the function to throw an error for invalid directory
    await expect(getRoutersInfo(nonExistentDir)).resolves.toEqual([]);
  });
});
