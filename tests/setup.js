// SPDX-License-Identifier: MIT
/**
 * 🧪 Jest Test Setup for Flux AI MCP Server
 * 
 * Global setup and utilities for TDD testing
 */

import { jest } from '@jest/globals';

// Global test timeout (for async operations)
jest.setTimeout(30000);

// Mock environment variables for testing
process.env.BFL_API_KEY = 'test-api-key-for-testing';
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  // Mock API responses
  mockApiResponse: (status = 'Ready', result = null) => ({
    id: 'test-task-id',
    status,
    result,
    progress: status === 'Ready' ? 100 : 50
  }),
  
  // Mock image generation request
  mockGenerationRequest: () => ({
    prompt: 'A beautiful sunset landscape',
    width: 1024,
    height: 768,
    seed: 42
  }),
  
  // Mock expert prompts
  mockExpertPrompts: {
    image_expert: 'Test image expert prompt content...',
    logo_expert: 'Test logo expert prompt content...'
  },
  
  // Test file paths
  testPaths: {
    outputDir: '/tmp/test-flux-output',
    testImage: '/tmp/test-image.jpg'
  }
};

// Console logging control for tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // Suppress logs during tests unless explicitly needed
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: originalConsole.error // Keep errors visible
};

// Clean up after each test
afterEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
});

// Global setup
beforeAll(() => {
  console.log('🧪 Setting up Flux AI MCP Server test environment...');
});

// Global cleanup
afterAll(() => {
  console.log('✅ Test environment cleaned up');
}); 