// SPDX-License-Identifier: MIT
/**
 * 🎨 Flux MCP Server
 * 
 * Main MCP server that integrates Flux API client, file management, and expert prompts
 */

import { ExpertPrompts } from './ExpertPrompts.js';

export class FluxMcpServer {
  constructor(options = {}) {
    const { apiClient, fileManager } = options;
    
    if (!apiClient) {
      throw new Error('API client is required');
    }
    
    if (!fileManager) {
      throw new Error('File manager is required');
    }
    
    this.apiClient = apiClient;
    this.fileManager = fileManager;
    this.expertPrompts = new ExpertPrompts();
    this.name = 'flux-ai-mcp-server';
    this.version = '1.0.0';
    
    // Tool endpoint mapping
    this.endpointMap = {
      'flux_pro_generate': 'v1/flux-pro',
      'flux_dev_generate': 'v1/flux-dev',
      'flux_pro_11_generate': 'v1/flux-pro-1.1',
      'flux_kontext_pro_generate': 'v1/flux-kontext-pro',
      'flux_kontext_max_generate': 'v1/flux-kontext-max'
    };
    
    // File management parameters that should be filtered from API calls
    this.fileManagementParams = ['output_path', 'filename'];
  }

  async listResources() {
    const experts = this.expertPrompts.listExperts();
    return experts.map(expertId => {
      const metadata = this.expertPrompts.getExpertMetadata(expertId);
      return {
        uri: metadata.uri,
        name: metadata.name,
        description: metadata.description,
        mimeType: 'text/plain'
      };
    });
  }

  async readResource(uri) {
    if (!uri.startsWith('flux-expert://')) {
      throw new Error('Unknown resource');
    }
    
    const expertId = uri.replace('flux-expert://', '');
    
    try {
      const promptContent = this.expertPrompts.getPrompt(expertId);
      return {
        type: 'text',
        text: promptContent
      };
    } catch (error) {
      throw new Error('Unknown resource');
    }
  }

  async listTools() {
    return [
      {
        name: 'flux_pro_generate',
        description: 'Generate high-quality images using FLUX.1 [pro] model - best for professional results, detailed scenes, and complex compositions',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Detailed text prompt for image generation'
            },
            image_prompt: {
              type: 'string',
              description: 'Optional base64 encoded image to use as visual prompt'
            },
            width: {
              type: 'integer',
              description: 'Width in pixels (multiple of 32, 256-1440)',
              default: 1024
            },
            height: {
              type: 'integer',
              description: 'Height in pixels (multiple of 32, 256-1440)',
              default: 768
            },
            steps: {
              type: 'integer',
              description: 'Generation steps (1-50, default 40)',
              default: 40
            },
            guidance: {
              type: 'number',
              description: 'Guidance scale (1.5-5, default 2.5)',
              default: 2.5
            },
            seed: {
              type: 'integer',
              description: 'Seed for reproducibility'
            },
            output_path: {
              type: 'string',
              description: 'Custom output path for the generated image (optional)'
            },
            filename: {
              type: 'string',
              description: 'Custom filename without extension (optional)'
            },
            safety_tolerance: {
              type: 'integer',
              description: 'Safety tolerance (0-6, default 2)',
              default: 2
            },
            prompt_upsampling: {
              type: 'boolean',
              description: 'Enable prompt upsampling for creativity',
              default: false
            }
          },
          required: ['prompt']
        }
      },
      {
        name: 'flux_dev_generate',
        description: 'Generate images using FLUX.1 [dev] model - fast, good quality, ideal for experimentation and iterations',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt for image generation'
            },
            image_prompt: {
              type: 'string',
              description: 'Optional base64 encoded image prompt'
            },
            width: {
              type: 'integer',
              description: 'Width in pixels (multiple of 32, 256-1440)',
              default: 1024
            },
            height: {
              type: 'integer',
              description: 'Height in pixels (multiple of 32, 256-1440)',
              default: 768
            },
            steps: {
              type: 'integer',
              description: 'Generation steps (1-50, default 28)',
              default: 28
            },
            guidance: {
              type: 'number',
              description: 'Guidance scale (1.5-5, default 3)',
              default: 3
            },
            seed: {
              type: 'integer',
              description: 'Seed for reproducibility'
            },
            output_path: {
              type: 'string',
              description: 'Custom output path for the generated image'
            },
            filename: {
              type: 'string',
              description: 'Custom filename without extension'
            },
            safety_tolerance: {
              type: 'integer',
              description: 'Safety tolerance (0-6, default 2)',
              default: 2
            },
            prompt_upsampling: {
              type: 'boolean',
              description: 'Enable prompt upsampling',
              default: false
            }
          },
          required: ['prompt']
        }
      },
      {
        name: 'flux_pro_11_generate',
        description: 'Generate images using FLUX 1.1 [pro] - latest model with improved quality and faster generation',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt for image generation'
            },
            image_prompt: {
              type: 'string',
              description: 'Optional base64 encoded image for Flux Redux'
            },
            width: {
              type: 'integer',
              description: 'Width in pixels (multiple of 32, 256-1440)',
              default: 1024
            },
            height: {
              type: 'integer',
              description: 'Height in pixels (multiple of 32, 256-1440)',
              default: 768
            },
            seed: {
              type: 'integer',
              description: 'Seed for reproducibility'
            },
            output_path: {
              type: 'string',
              description: 'Custom output path for the generated image'
            },
            filename: {
              type: 'string',
              description: 'Custom filename without extension'
            },
            safety_tolerance: {
              type: 'integer',
              description: 'Safety tolerance (0-6, default 2)',
              default: 2
            },
            prompt_upsampling: {
              type: 'boolean',
              description: 'Enable prompt upsampling',
              default: false
            }
          },
          required: ['prompt']
        }
      },
      {
        name: 'flux_kontext_pro_generate',
        description: 'Edit or create images using Flux Kontext Pro - specialized for image-to-image transformations and edits',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt describing the desired output'
            },
            input_image: {
              type: 'string',
              description: 'Base64 encoded input image or URL to edit/transform'
            },
            aspect_ratio: {
              type: 'string',
              description: 'Aspect ratio between 21:9 and 9:21 (e.g., \'16:9\', \'1:1\', \'4:3\')'
            },
            seed: {
              type: 'integer',
              description: 'Seed for reproducibility'
            },
            output_path: {
              type: 'string',
              description: 'Custom output path for the generated image'
            },
            filename: {
              type: 'string',
              description: 'Custom filename without extension'
            },
            safety_tolerance: {
              type: 'integer',
              description: 'Safety tolerance (0-2, default 2)',
              default: 2
            },
            prompt_upsampling: {
              type: 'boolean',
              description: 'Enable prompt upsampling',
              default: false
            }
          },
          required: ['prompt']
        }
      },
      {
        name: 'flux_kontext_max_generate',
        description: 'Edit or create images using Flux Kontext Max - maximum quality for image-to-image transformations',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt describing the desired output'
            },
            input_image: {
              type: 'string',
              description: 'Base64 encoded input image or URL to edit/transform'
            },
            aspect_ratio: {
              type: 'string',
              description: 'Aspect ratio between 21:9 and 9:21'
            },
            seed: {
              type: 'integer',
              description: 'Seed for reproducibility'
            },
            output_path: {
              type: 'string',
              description: 'Custom output path for the generated image'
            },
            filename: {
              type: 'string',
              description: 'Custom filename without extension'
            },
            safety_tolerance: {
              type: 'integer',
              description: 'Safety tolerance (0-2, default 2)',
              default: 2
            },
            prompt_upsampling: {
              type: 'boolean',
              description: 'Enable prompt upsampling',
              default: false
            }
          },
          required: ['prompt']
        }
      }
    ];
  }

  async callTool(toolName, args = {}) {
    // Validate tool exists
    if (!this.endpointMap[toolName]) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Validate required parameters
    if (!args.prompt) {
      return {
        type: 'text',
        text: '❌ Error: prompt is required'
      };
    }

    // Validate dimensions (must be multiple of 32)
    if (args.width && args.width % 32 !== 0) {
      return {
        type: 'text',
        text: '❌ Error: width must be a multiple of 32'
      };
    }

    if (args.height && args.height % 32 !== 0) {
      return {
        type: 'text',
        text: '❌ Error: height must be a multiple of 32'
      };
    }

    // Validate safety tolerance
    if (args.safety_tolerance && (args.safety_tolerance < 0 || args.safety_tolerance > 6)) {
      return {
        type: 'text',
        text: '❌ Error: safety_tolerance must be between 0 and 6'
      };
    }

    try {
      // Get endpoint
      const endpoint = this.endpointMap[toolName];
      
      // Filter out file management parameters for API call
      const apiPayload = { ...args };
      this.fileManagementParams.forEach(param => delete apiPayload[param]);

      // Submit generation
      const submissionResult = await this.apiClient.submitGeneration(endpoint, apiPayload);
      const taskId = submissionResult.id;

      // Wait for completion
      const completionResult = await this.apiClient.waitForCompletion(taskId);

      // Extract image URL
      let imageUrl;
      const resultData = completionResult.result;
      
      if (typeof resultData === 'object' && resultData.sample) {
        imageUrl = resultData.sample;
      } else if (Array.isArray(resultData) && resultData.length > 0) {
        imageUrl = typeof resultData[0] === 'string' ? resultData[0] : resultData[0].sample;
      } else {
        throw new Error('No image URL found in result');
      }

      // Save the image
      const model = toolName.replace('_generate', '').replace('_', '-');
      const saveResult = await this.fileManager.saveGeneratedImage(imageUrl, {
        outputPath: args.output_path,
        filename: args.filename,
        prompt: args.prompt,
        model,
        outputFormat: args.output_format
      });

      // Return detailed success message
      const modelDisplayName = toolName.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      return {
        type: 'text',
        text: `✅ **Image Generated Successfully!**

🎨 **Model:** ${modelDisplayName}
📝 **Prompt:** ${args.prompt.substring(0, 100)}${args.prompt.length > 100 ? '...' : ''}
💾 **Saved to:** ${saveResult.savedPath}
🆔 **Task ID:** ${taskId}
🔗 **Original URL:** ${imageUrl}

**Generation Parameters:**
- Dimensions: ${args.width || 'default'}x${args.height || 'default'}
- Seed: ${args.seed || 'random'}
- Steps: ${args.steps || 'default'}
- Guidance: ${args.guidance || 'default'}
- Safety: ${args.safety_tolerance || 2}

The image is ready to use in your project! 🚀`
      };

    } catch (error) {
      return {
        type: 'text',
        text: `❌ Error executing ${toolName}: ${error.message}`
      };
    }
  }
} 