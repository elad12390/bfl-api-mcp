/**
 * 🧪 TDD Tests for Flux MCP Server
 * 
 * Tests for MCP server functionality, tools, and expert prompts
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Import the classes we'll implement
import { FluxMcpServer } from '../src/FluxMcpServer.js';
import { ExpertPrompts } from '../src/ExpertPrompts.js';

describe('🎨 FluxMcpServer', () => {
  let server;
  let mockApiClient;
  let mockFileManager;

  beforeEach(() => {
    // Mock dependencies
    mockApiClient = {
      submitGeneration: jest.fn().mockResolvedValue({ id: 'test-task-123' }),
      waitForCompletion: jest.fn().mockResolvedValue({
        status: 'Ready',
        result: { sample: 'https://example.com/generated-image.jpg' }
      })
    };
    
    mockFileManager = {
      saveGeneratedImage: jest.fn().mockResolvedValue({
        savedPath: '/tmp/test/generated_image_flux-pro_20240128_120000.jpg',
        filename: 'generated_image_flux-pro_20240128_120000.jpg',
        directory: '/tmp/test',
        size: 1024
      }),
      generateFilename: jest.fn().mockReturnValue('generated_image_flux-pro_20240128_120000'),
      resolvePath: jest.fn().mockReturnValue('/tmp/test')
    };

    server = new FluxMcpServer({
      apiClient: mockApiClient,
      fileManager: mockFileManager
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('🏗️ Server Initialization', () => {
    test('should initialize server with required dependencies', () => {
      expect(server).toBeDefined();
      expect(server.apiClient).toBe(mockApiClient);
      expect(server.fileManager).toBe(mockFileManager);
    });

    test('should throw error without API client', () => {
      expect(() => new FluxMcpServer({ fileManager: mockFileManager }))
        .toThrow('API client is required');
    });

    test('should throw error without file manager', () => {
      expect(() => new FluxMcpServer({ apiClient: mockApiClient }))
        .toThrow('File manager is required');
    });

    test('should have correct server name and version', () => {
      expect(server.name).toBe('flux-ai-mcp-server');
      expect(server.version).toBe('1.0.0');
    });
  });

  describe('📋 Resource Management', () => {
    test('should list expert prompt resources', async () => {
      const resources = await server.listResources();
      
      expect(resources).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            uri: 'flux-expert://image_expert',
            name: 'Image Expert',
            description: expect.stringContaining('Master image generation expert'),
            mimeType: 'text/plain'
          }),
          expect.objectContaining({
            uri: 'flux-expert://logo_expert',
            name: 'Logo Expert',
            description: expect.stringContaining('Elite logo design expert'),
            mimeType: 'text/plain'
          })
        ])
      );
    });

    test('should read image expert resource', async () => {
      const content = await server.readResource('flux-expert://image_expert');
      
      expect(content).toEqual({
        type: 'text',
        text: expect.stringContaining('master AI image generation expert')
      });
    });

    test('should read logo expert resource', async () => {
      const content = await server.readResource('flux-expert://logo_expert');
      
      expect(content).toEqual({
        type: 'text',
        text: expect.stringContaining('elite logo design expert')
      });
    });

    test('should throw error for unknown resource', async () => {
      await expect(
        server.readResource('flux-expert://unknown_expert')
      ).rejects.toThrow('Unknown resource');
    });
  });

  describe('🛠️ Tool Management', () => {
    test('should list all Flux AI tools', async () => {
      const tools = await server.listTools();
      
      expect(tools).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'flux_pro_generate',
            description: expect.stringContaining('FLUX.1 [pro]'),
            inputSchema: expect.objectContaining({
              type: 'object',
              properties: expect.objectContaining({
                prompt: expect.objectContaining({ type: 'string' }),
                width: expect.objectContaining({ type: 'integer' }),
                height: expect.objectContaining({ type: 'integer' })
              })
            })
          }),
          expect.objectContaining({
            name: 'flux_dev_generate',
            description: expect.stringContaining('FLUX.1 [dev]')
          }),
          expect.objectContaining({
            name: 'flux_pro_11_generate',
            description: expect.stringContaining('FLUX 1.1 [pro]')
          }),
          expect.objectContaining({
            name: 'flux_kontext_pro_generate',
            description: expect.stringContaining('Flux Kontext Pro')
          }),
          expect.objectContaining({
            name: 'flux_kontext_max_generate',
            description: expect.stringContaining('Flux Kontext Max')
          })
        ])
      );
    });

    test('should validate tool schemas', async () => {
      const tools = await server.listTools();
      
      tools.forEach(tool => {
        expect(tool.inputSchema).toMatchObject({
          type: 'object',
          properties: expect.objectContaining({
            prompt: expect.objectContaining({
              type: 'string',
              description: expect.any(String)
            })
          }),
          required: expect.arrayContaining(['prompt'])
        });
      });
    });

    test('should include custom file management parameters', async () => {
      const tools = await server.listTools();
      const fluxProTool = tools.find(t => t.name === 'flux_pro_generate');
      
      expect(fluxProTool.inputSchema.properties).toMatchObject({
        output_path: expect.objectContaining({
          type: 'string',
          description: expect.stringContaining('Custom output path')
        }),
        filename: expect.objectContaining({
          type: 'string', 
          description: expect.stringContaining('Custom filename')
        })
      });
    });
  });

  describe('⚡ Tool Execution', () => {
    const mockGenerationResult = {
      id: 'test-task-123',
      status: 'Ready',
      result: {
        sample: 'https://example.com/generated-image.jpg'
      }
    };

    const mockSaveResult = {
      savedPath: '/tmp/test/generated_image_flux-pro_20240128_120000.jpg',
      filename: 'generated_image_flux-pro_20240128_120000.jpg',
      directory: '/tmp/test',
      size: 1024000
    };

    beforeEach(() => {
      mockApiClient.submitGeneration.mockResolvedValue({ id: 'test-task-123' });
      mockApiClient.waitForCompletion.mockResolvedValue(mockGenerationResult);
      mockFileManager.saveGeneratedImage.mockResolvedValue(mockSaveResult);
    });

    test('should execute flux_pro_generate successfully', async () => {
      const args = {
        prompt: 'A beautiful landscape',
        width: 1920,
        height: 1088, // 1088 is divisible by 32 (34 * 32)
        output_path: '~/Projects/landscapes/',
        filename: 'epic_landscape'
      };

      const result = await server.callTool('flux_pro_generate', args);

      expect(mockApiClient.submitGeneration).toHaveBeenCalledWith('v1/flux-pro', {
        prompt: 'A beautiful landscape',
        width: 1920,
        height: 1088
      });

      expect(mockApiClient.waitForCompletion).toHaveBeenCalledWith('test-task-123');

      expect(mockFileManager.saveGeneratedImage).toHaveBeenCalledWith(
        'https://example.com/generated-image.jpg',
        expect.objectContaining({
          outputPath: '~/Projects/landscapes/',
          filename: 'epic_landscape',
          prompt: 'A beautiful landscape',
          model: 'flux-pro'
        })
      );

      expect(result).toEqual({
        type: 'text',
        text: expect.stringContaining('✅ **Image Generated Successfully!**')
      });
    });

    test('should execute flux_dev_generate with default parameters', async () => {
      const args = {
        prompt: 'Quick concept art'
      };

      const result = await server.callTool('flux_dev_generate', args);

      expect(mockApiClient.submitGeneration).toHaveBeenCalledWith('v1/flux-dev', {
        prompt: 'Quick concept art'
      });

      expect(result.text).toContain('Flux Dev Generate');
    });

    test('should execute flux_kontext_pro_generate with input image', async () => {
      const args = {
        prompt: 'Transform to cyberpunk style',
        input_image: 'base64-encoded-image-data',
        aspect_ratio: '16:9'
      };

      const result = await server.callTool('flux_kontext_pro_generate', args);

      expect(result.type).toBe('text');
      expect(result.text).toContain('Image Generated Successfully');
      
      expect(mockApiClient.submitGeneration).toHaveBeenCalledWith('v1/flux-kontext-pro', {
        prompt: 'Transform to cyberpunk style',
        input_image: 'base64-encoded-image-data',
        aspect_ratio: '16:9'
      });
    });

    test('should handle API errors gracefully', async () => {
      mockApiClient.submitGeneration.mockRejectedValue(new Error('API Error'));

      const args = { prompt: 'Test prompt' };

      const result = await server.callTool('flux_pro_generate', args);

      expect(result.text).toContain('❌ Error executing flux_pro_generate');
      expect(result.text).toContain('API Error');
    });

    test('should handle file saving errors', async () => {
      mockFileManager.saveGeneratedImage.mockRejectedValue(new Error('File save error'));

      const args = { prompt: 'Test prompt' };

      const result = await server.callTool('flux_pro_generate', args);

      expect(result.text).toContain('❌ Error');
      expect(result.text).toContain('File save error');
    });

    test('should validate required parameters', async () => {
      const result = await server.callTool('flux_pro_generate', {});

      expect(result.text).toContain('❌ Error');
      expect(result.text).toContain('prompt is required');
    });

    test('should reject unknown tools', async () => {
      await expect(
        server.callTool('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });

    test('should return detailed success information', async () => {
      const args = {
        prompt: 'A majestic mountain',
        width: 1024,
        height: 768,
        seed: 42
      };

      const result = await server.callTool('flux_pro_generate', args);

      expect(result.text).toContain('🎨 **Model:** Flux Pro Generate');
      expect(result.text).toContain('📝 **Prompt:** A majestic mountain');
      expect(result.text).toContain('💾 **Saved to:**');
      expect(result.text).toContain('🆔 **Task ID:** test-task-123');
      expect(result.text).toContain('- Dimensions: 1024x768');
      expect(result.text).toContain('- Seed: 42');
    });
  });

  describe('🎯 Parameter Processing', () => {
    test('should filter out file management parameters from API payload', async () => {
      const args = {
        prompt: 'Test image',
        width: 1024,
        height: 768,
        output_path: '~/custom/path/',
        filename: 'custom_name',
        steps: 40
      };

      await server.callTool('flux_pro_generate', args);

      expect(mockApiClient.submitGeneration).toHaveBeenCalledWith('v1/flux-pro', {
        prompt: 'Test image',
        width: 1024,
        height: 768,
        steps: 40
      });
    });

    test('should pass correct endpoint for each tool', async () => {
      const endpoints = [
        { tool: 'flux_pro_generate', endpoint: 'v1/flux-pro' },
        { tool: 'flux_dev_generate', endpoint: 'v1/flux-dev' },
        { tool: 'flux_pro_11_generate', endpoint: 'v1/flux-pro-1.1' },
        { tool: 'flux_kontext_pro_generate', endpoint: 'v1/flux-kontext-pro' },
        { tool: 'flux_kontext_max_generate', endpoint: 'v1/flux-kontext-max' }
      ];

      for (const { tool, endpoint } of endpoints) {
        mockApiClient.submitGeneration.mockClear();
        
        await server.callTool(tool, { prompt: 'Test' });
        
        expect(mockApiClient.submitGeneration).toHaveBeenCalledWith(
          endpoint,
          expect.objectContaining({ prompt: 'Test' })
        );
      }
    });
  });

  describe('📊 Progress Tracking', () => {
    test('should track generation progress', async () => {
      const progressSpy = jest.fn();
      server.onProgress = progressSpy;

      const args = { prompt: 'Test with progress' };

      await server.callTool('flux_pro_generate', args);

      // Verify progress tracking was called during waitForCompletion
      expect(mockApiClient.waitForCompletion).toHaveBeenCalledWith('test-task-123');
    });

    test('should handle timeout gracefully', async () => {
      mockApiClient.waitForCompletion.mockRejectedValue(new Error('Task timed out'));

      const args = { prompt: 'Test timeout' };

      const result = await server.callTool('flux_pro_generate', args);

      expect(result.text).toContain('❌ Error');
      expect(result.text).toContain('Task timed out');
    });
  });

  describe('🛡️ Input Validation', () => {
    test('should validate prompt is required', async () => {
      const result = await server.callTool('flux_pro_generate', {
        width: 1024,
        height: 768
      });

      expect(result.text).toContain('❌ Error');
    });

    test('should validate dimension constraints', async () => {
      const result = await server.callTool('flux_pro_generate', {
        prompt: 'Test',
        width: 100, // Not multiple of 32
        height: 768
      });

      expect(result.text).toContain('❌ Error');
    });

    test('should validate safety tolerance range', async () => {
      const result = await server.callTool('flux_pro_generate', {
        prompt: 'Test',
        safety_tolerance: 10 // Outside 0-6 range
      });

      expect(result.text).toContain('❌ Error');
    });
  });
});

describe('🎨 ExpertPrompts', () => {
  let expertPrompts;

  beforeEach(() => {
    expertPrompts = new ExpertPrompts();
  });

  describe('📝 Prompt Content', () => {
    test('should have image expert prompt', () => {
      const prompt = expertPrompts.getPrompt('image_expert');
      
      expect(prompt).toContain('master AI image generation expert');
      expect(prompt).toContain('Visual Composition Mastery');
      expect(prompt).toContain('Technical Excellence');
      expect(prompt).toContain('Specialization Areas');
    });

    test('should have logo expert prompt', () => {
      const prompt = expertPrompts.getPrompt('logo_expert');
      
      expect(prompt).toContain('elite logo design expert');
      expect(prompt).toContain('Brand Identity Mastery');
      expect(prompt).toContain('Design Excellence');
      expect(prompt).toContain('AI Optimization');
    });

    test('should throw error for unknown expert', () => {
      expect(() => expertPrompts.getPrompt('unknown_expert'))
        .toThrow('Unknown expert: unknown_expert');
    });

    test('should list available experts', () => {
      const experts = expertPrompts.listExperts();
      
      expect(experts).toEqual(['image_expert', 'logo_expert']);
    });

    test('should get expert metadata', () => {
      const metadata = expertPrompts.getExpertMetadata('image_expert');
      
      expect(metadata).toMatchObject({
        id: 'image_expert',
        name: 'Image Expert',
        description: expect.stringContaining('Master image generation expert'),
        specialties: expect.arrayContaining(['composition', 'styles', 'technical']),
        uri: 'flux-expert://image_expert'
      });
    });
  });

  describe('🔍 Expert Matching', () => {
    test('should suggest expert based on prompt content', () => {
      const suggestions = [
        { prompt: 'Create a logo for my startup', expected: 'logo_expert' },
        { prompt: 'Generate a beautiful landscape photo', expected: 'image_expert' },
        { prompt: 'Design a brand identity', expected: 'logo_expert' },
        { prompt: 'Create concept art for a game', expected: 'image_expert' }
      ];

      suggestions.forEach(({ prompt, expected }) => {
        const suggestion = expertPrompts.suggestExpert(prompt);
        expect(suggestion).toBe(expected);
      });
    });

    test('should default to image expert for ambiguous prompts', () => {
      const suggestion = expertPrompts.suggestExpert('Create something cool');
      expect(suggestion).toBe('image_expert');
    });
  });
}); 