#!/usr/bin/env node

/**
 * 🧪 Integration Tests for Flux AI MCP Server
 * 
 * These tests use the REAL Flux AI API and require a valid BFL_API_KEY.
 * They will make actual API calls and generate real images.
 * 
 * Usage: BFL_API_KEY=your_token_here npm run test:integration
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { FluxApiClient } from '../src/FluxApiClient.js';
import { FileManager } from '../src/FileManager.js';
import { FluxMcpServer } from '../src/FluxMcpServer.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('🌟 Integration Tests - Real API', () => {
  let apiClient;
  let fileManager;
  let server;
  let testOutputDir;
  
  beforeAll(async () => {
    // Check for API key
    if (!process.env.BFL_API_KEY) {
      throw new Error(`
❌ BFL_API_KEY environment variable is required for integration tests!

Usage: BFL_API_KEY=your_token_here npm run test:integration

Get your API key from: https://api.bfl.ai/
      `);
    }
    
    console.log('🚀 [integration-test] Starting integration tests with real API...');
    
    // Create test output directory
    testOutputDir = path.join(os.tmpdir(), 'flux-integration-test', Date.now().toString());
    await fs.mkdir(testOutputDir, { recursive: true });
    console.log(`📁 [integration-test] Test output directory: ${testOutputDir}`);
    
    // Initialize components
    apiClient = new FluxApiClient(process.env.BFL_API_KEY);
    fileManager = new FileManager(testOutputDir);
    server = new FluxMcpServer({
      apiClient,
      fileManager
    });
  });
  
  afterAll(async () => {
    // Clean up test files (optional - you might want to keep them to verify)
    try {
      const files = await fs.readdir(testOutputDir);
      console.log(`🧹 [integration-test] Generated ${files.length} test files in ${testOutputDir}`);
      
      // Uncomment the next lines if you want to auto-cleanup
      // await fs.rmdir(testOutputDir, { recursive: true });
      // console.log('🧹 [integration-test] Cleaned up test directory');
    } catch (error) {
      console.log('ℹ️ [integration-test] No cleanup needed');
    }
  });

  describe('🎨 Real API Client Tests', () => {
    test('should submit and complete flux-dev generation', async () => {
      console.log('🎨 [integration-test] Testing Flux Dev generation...');
      
      const payload = {
        prompt: 'A simple red circle on white background',
        width: 512,
        height: 512,
        steps: 4
      };
      
      // Submit generation
      const submission = await apiClient.submitGeneration('v1/flux-dev', payload);
      expect(submission).toBeDefined();
      expect(submission.id).toBeDefined();
      console.log(`📋 [integration-test] Task submitted: ${submission.id}`);
      
      // Wait for completion
      const result = await apiClient.waitForCompletion(submission.id);
      expect(result.status).toBe('Ready');
      expect(result.result.sample).toBeDefined();
      console.log(`✅ [integration-test] Generation completed: ${result.result.sample}`);
      
    }, 120000); // 2 minute timeout for API calls
    
    test('should handle API errors gracefully', async () => {
      console.log('🔍 [integration-test] Testing error handling...');
      
      // Test with invalid payload
      await expect(
        apiClient.submitGeneration('v1/flux-dev', {
          prompt: '', // Empty prompt should fail
          width: 123  // Invalid dimension
        })
      ).rejects.toThrow();
      
      console.log('✅ [integration-test] Error handling verified');
    });
  });

  describe('📁 Real File Manager Tests', () => {
    test('should save real generated image', async () => {
      console.log('💾 [integration-test] Testing file saving...');
      
      // Generate a simple image first
      const submission = await apiClient.submitGeneration('v1/flux-dev', {
        prompt: 'A blue square',
        width: 512,
        height: 512,
        steps: 4
      });
      
      const result = await apiClient.waitForCompletion(submission.id);
      const imageUrl = result.result.sample;
      
      // Save the image
      const saveOptions = {
        prompt: 'A blue square',
        model: 'flux-dev',
        filename: 'integration_test_blue_square'
      };
      
      const saveResult = await fileManager.saveGeneratedImage(imageUrl, saveOptions);
      
      expect(saveResult.savedPath).toBeDefined();
      expect(saveResult.filename).toContain('integration_test_blue_square');
      expect(saveResult.size).toBeGreaterThan(0);
      
      // Verify file exists
      const fileExists = await fileManager.fileExists(saveResult.savedPath);
      expect(fileExists).toBe(true);
      
      console.log(`💾 [integration-test] Image saved: ${saveResult.savedPath} (${saveResult.size} bytes)`);
      
    }, 120000);
  });

  describe('🎯 End-to-End MCP Server Tests', () => {
    test('should execute flux_dev_generate tool end-to-end', async () => {
      console.log('🎯 [integration-test] Testing full MCP tool execution...');
      
      const args = {
        prompt: 'A simple green circle for integration testing',
        width: 512,
        height: 512,
        steps: 4,
        filename: 'e2e_test_green_circle',
        output_path: testOutputDir
      };
      
      const result = await server.callTool('flux_dev_generate', args);
      
      expect(result.type).toBe('text');
      expect(result.text).toContain('Image Generated Successfully');
      expect(result.text).toContain('e2e_test_green_circle');
      
      console.log('✅ [integration-test] End-to-end test completed');
      console.log(result.text);
      
    }, 120000);
    
    test('should execute flux_pro_generate tool with expert prompt', async () => {
      console.log('🎨 [integration-test] Testing Flux Pro with expert prompt...');
      
      // Get expert prompt
      const imageExpertResource = await server.readResource('flux-expert://image_expert');
      expect(imageExpertResource.type).toBe('text');
      expect(imageExpertResource.text).toContain('professional image generation');
      
      const args = {
        prompt: 'A professional headshot photo, studio lighting, high quality',
        width: 1024,
        height: 1024,
        filename: 'pro_headshot_test',
        output_path: testOutputDir
      };
      
      const result = await server.callTool('flux_pro_generate', args);
      
      expect(result.type).toBe('text');
      expect(result.text).toContain('Image Generated Successfully');
      expect(result.text).toContain('Flux Pro Generate');
      
      console.log('✅ [integration-test] Flux Pro test completed');
      
    }, 180000); // 3 minute timeout for Pro model
  });

  describe('📊 Progress and Monitoring', () => {
    test('should track generation progress in real-time', async () => {
      console.log('📊 [integration-test] Testing progress tracking...');
      
      const submission = await apiClient.submitGeneration('v1/flux-dev', {
        prompt: 'A progress test image - yellow triangle',
        width: 512,
        height: 512,
        steps: 8 // More steps to see progress
      });
      
      let progressCalls = 0;
      const originalGetResult = apiClient.getResult.bind(apiClient);
      
      // Mock to track progress calls
      apiClient.getResult = async (taskId) => {
        progressCalls++;
        const result = await originalGetResult(taskId);
        if (result.status === 'Pending') {
          console.log(`⏳ [integration-test] Progress check ${progressCalls}: ${result.status}`);
        }
        return result;
      };
      
      const result = await apiClient.waitForCompletion(submission.id);
      
      expect(result.status).toBe('Ready');
      expect(progressCalls).toBeGreaterThan(0);
      
      console.log(`📊 [integration-test] Tracked ${progressCalls} progress updates`);
      
      // Restore original method
      apiClient.getResult = originalGetResult;
      
    }, 120000);
  });

  describe('🛡️ Validation and Error Handling', () => {
    test('should validate dimensions are multiples of 32', async () => {
      console.log('🛡️ [integration-test] Testing dimension validation...');
      
      const result = await server.callTool('flux_dev_generate', {
        prompt: 'Test image',
        width: 513, // Not multiple of 32
        height: 512
      });
      
      expect(result.type).toBe('text');
      expect(result.text).toContain('width must be a multiple of 32');
      
      console.log('✅ [integration-test] Dimension validation working');
    });
    
    test('should require prompt parameter', async () => {
      console.log('🛡️ [integration-test] Testing prompt requirement...');
      
      const result = await server.callTool('flux_dev_generate', {
        width: 512,
        height: 512
        // No prompt
      });
      
      expect(result.type).toBe('text');
      expect(result.text).toContain('prompt is required');
      
      console.log('✅ [integration-test] Prompt validation working');
    });
  });
}); 