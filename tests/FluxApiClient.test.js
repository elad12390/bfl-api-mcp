// SPDX-License-Identifier: MIT
/**
 * 🧪 TDD Tests for Flux API Client
 * 
 * Following Test-Driven Development - these tests define the expected behavior
 * before implementation.
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import nock from 'nock';

// Import the class we'll implement
import { FluxApiClient } from '../src/FluxApiClient.js';

describe('🎨 FluxApiClient', () => {
  let client;
  const mockApiKey = 'test-api-key';
  const baseUrl = 'https://api.bfl.ai';

  beforeEach(() => {
    client = new FluxApiClient(mockApiKey);
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('🏗️ Constructor and Configuration', () => {
    test('should create client with API key', () => {
      expect(client).toBeDefined();
      expect(client.apiKey).toBe(mockApiKey);
      expect(client.baseUrl).toBe(baseUrl);
    });

    test('should throw error without API key', () => {
      expect(() => new FluxApiClient()).toThrow('API key is required');
    });

    test('should have correct headers', () => {
      const headers = client.getHeaders();
      expect(headers).toEqual({
        'x-key': mockApiKey,
        'Content-Type': 'application/json'
      });
    });
  });

  describe('🚀 Image Generation Submission', () => {
    const mockPayload = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768
    };

    test('should submit flux-pro generation successfully', async () => {
      const mockResponse = {
        id: 'task-123',
        polling_url: 'https://api.bfl.ai/v1/get_result?id=task-123'
      };

      nock(baseUrl)
        .post('/v1/flux-pro')
        .reply(200, mockResponse);

      const result = await client.submitGeneration('v1/flux-pro', mockPayload);
      
      expect(result).toEqual(mockResponse);
      expect(result.id).toBe('task-123');
    });

    test('should submit flux-dev generation successfully', async () => {
      const mockResponse = {
        id: 'task-456',
        polling_url: 'https://api.bfl.ai/v1/get_result?id=task-456'
      };

      nock(baseUrl)
        .post('/v1/flux-dev')
        .reply(200, mockResponse);

      const result = await client.submitGeneration('v1/flux-dev', mockPayload);
      
      expect(result).toEqual(mockResponse);
    });

    test('should submit flux-kontext-pro generation successfully', async () => {
      const kontextPayload = {
        ...mockPayload,
        input_image: 'base64-encoded-image-data'
      };

      const mockResponse = {
        id: 'task-789',
        polling_url: 'https://api.bfl.ai/v1/get_result?id=task-789'
      };

      nock(baseUrl)
        .post('/v1/flux-kontext-pro')
        .reply(200, mockResponse);

      const result = await client.submitGeneration('v1/flux-kontext-pro', kontextPayload);
      
      expect(result).toEqual(mockResponse);
    });

    test('should handle API errors properly', async () => {
      nock(baseUrl)
        .post('/v1/flux-pro')
        .reply(400, { error: 'Invalid parameters' });

      await expect(
        client.submitGeneration('v1/flux-pro', mockPayload)
      ).rejects.toThrow('HTTP 400');
    });

    test('should handle network errors', async () => {
      nock(baseUrl)
        .post('/v1/flux-pro')
        .replyWithError('Network error');

      await expect(
        client.submitGeneration('v1/flux-pro', mockPayload)
      ).rejects.toThrow('Network error');
    });
  });

  describe('📊 Result Polling', () => {
    const taskId = 'test-task-123';

    test('should get result successfully', async () => {
      const mockResult = {
        id: taskId,
        status: 'Ready',
        result: {
          sample: 'https://example.com/image.jpg'
        }
      };

      nock(baseUrl)
        .get('/v1/get_result')
        .query({ id: taskId })
        .reply(200, mockResult);

      const result = await client.getResult(taskId);
      
      expect(result).toEqual(mockResult);
      expect(result.status).toBe('Ready');
    });

    test('should handle pending status', async () => {
      const mockResult = {
        id: taskId,
        status: 'Pending',
        progress: 50
      };

      nock(baseUrl)
        .get('/v1/get_result')
        .query({ id: taskId })
        .reply(200, mockResult);

      const result = await client.getResult(taskId);
      
      expect(result.status).toBe('Pending');
      expect(result.progress).toBe(50);
    });

    test('should handle error status', async () => {
      const mockResult = {
        id: taskId,
        status: 'Error',
        details: 'Generation failed'
      };

      nock(baseUrl)
        .get('/v1/get_result')
        .query({ id: taskId })
        .reply(200, mockResult);

      const result = await client.getResult(taskId);
      
      expect(result.status).toBe('Error');
    });
  });

  describe('⏳ Completion Waiting', () => {
    const taskId = 'test-task-wait';

    test('should wait for completion successfully', async () => {
      const finalResult = {
        id: taskId,
        status: 'Ready',
        result: {
          sample: 'https://example.com/completed-image.jpg'
        }
      };

      // First call returns Pending
      nock(baseUrl)
        .get('/v1/get_result')
        .query({ id: taskId })
        .reply(200, {
          id: taskId,
          status: 'Pending',
          progress: 25
        });

      // Second call returns Ready
      nock(baseUrl)
        .get('/v1/get_result')
        .query({ id: taskId })
        .reply(200, finalResult);

      const result = await client.waitForCompletion(taskId, { maxWaitTime: 5000, pollInterval: 100 });
      
      expect(result).toEqual(finalResult);
      expect(result.status).toBe('Ready');
    });

    test('should timeout after max wait time', async () => {
      // Always return Pending
      nock(baseUrl)
        .persist()
        .get('/v1/get_result')
        .query({ id: taskId })
        .reply(200, {
          id: taskId,
          status: 'Pending',
          progress: 50
        });

      await expect(
        client.waitForCompletion(taskId, { maxWaitTime: 500, pollInterval: 100 })
      ).rejects.toThrow('Task timed out');
    });

    test('should handle failure status', async () => {
      nock(baseUrl)
        .get('/v1/get_result')
        .query({ id: taskId })
        .reply(200, {
          id: taskId,
          status: 'Error',
          details: 'Content moderated'
        });

      await expect(
        client.waitForCompletion(taskId)
      ).rejects.toThrow('Task failed: Error');
    });

    test('should handle moderated content', async () => {
      nock(baseUrl)
        .get('/v1/get_result')
        .query({ id: taskId })
        .reply(200, {
          id: taskId,
          status: 'Content Moderated'
        });

      await expect(
        client.waitForCompletion(taskId)
      ).rejects.toThrow('Task failed: Content Moderated');
    });
  });

  describe('🔄 End-to-End Generation Flow', () => {
    test('should complete full generation workflow', async () => {
      const payload = {
        prompt: 'A majestic mountain landscape',
        width: 1920,
        height: 1080,
        seed: 42
      };

      const submitResponse = {
        id: 'e2e-task-123',
        polling_url: 'https://api.bfl.ai/v1/get_result?id=e2e-task-123'
      };

      const finalResult = {
        id: 'e2e-task-123',
        status: 'Ready',
        result: {
          sample: 'https://example.com/mountain-landscape.jpg'
        }
      };

      // Mock submission
      nock(baseUrl)
        .post('/v1/flux-pro')
        .reply(200, submitResponse);

      // Mock completion
      nock(baseUrl)
        .get('/v1/get_result')
        .query({ id: 'e2e-task-123' })
        .reply(200, finalResult);

      // Execute workflow
      const submissionResult = await client.submitGeneration('v1/flux-pro', payload);
      expect(submissionResult.id).toBe('e2e-task-123');

      const completionResult = await client.waitForCompletion('e2e-task-123', { maxWaitTime: 1000 });
      expect(completionResult.status).toBe('Ready');
      expect(completionResult.result.sample).toContain('mountain-landscape.jpg');
    });
  });

  describe('🛡️ Input Validation', () => {
    test('should validate endpoint parameter', async () => {
      await expect(
        client.submitGeneration('', {})
      ).rejects.toThrow('Endpoint is required');
    });

    test('should validate payload parameter', async () => {
      await expect(
        client.submitGeneration('v1/flux-pro', null)
      ).rejects.toThrow('Payload is required');
    });

    test('should validate task ID for results', async () => {
      await expect(
        client.getResult('')
      ).rejects.toThrow('Task ID is required');
    });
  });

  describe('📈 Progress Tracking', () => {
    test('should track progress correctly', async () => {
      const taskId = 'progress-task';
      const progressUpdates = [
        { status: 'Pending', progress: 0 },
        { status: 'Pending', progress: 25 },
        { status: 'Pending', progress: 50 },
        { status: 'Pending', progress: 75 },
        { status: 'Ready', progress: 100, result: { sample: 'image.jpg' } }
      ];

      // Mock multiple progress calls
      progressUpdates.forEach((update, index) => {
        nock(baseUrl)
          .get('/v1/get_result')
          .query({ id: taskId })
          .reply(200, { id: taskId, ...update });
      });

      const progressCallback = jest.fn();
      const result = await client.waitForCompletion(taskId, {
        maxWaitTime: 2000,
        pollInterval: 50,
        onProgress: progressCallback
      });

      expect(result.status).toBe('Ready');
      expect(progressCallback).toHaveBeenCalled();
    });
  });
}); 