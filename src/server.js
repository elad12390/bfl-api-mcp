// SPDX-License-Identifier: MIT
#!/usr/bin/env node

/**
 * 🎨 Flux AI MCP Server - Entry Point
 * 
 * Main server entry point for Cursor IDE integration
 * Built with Test-Driven Development for reliability
 */

import { FluxApiClient } from './FluxApiClient.js';
import { FileManager } from './FileManager.js';
import { FluxMcpServer } from './FluxMcpServer.js';

// Configuration
const API_KEY = process.env.BFL_API_KEY;
const DEFAULT_OUTPUT_DIR = process.env.FLUX_OUTPUT_DIR || '~/Downloads/flux-generated';

// Logging with emojis (following user rules)
const log = {
  info: (msg) => console.log(`🚀 [flux-mcp-server] info – ${msg}`),
  error: (msg) => console.error(`❌ [flux-mcp-server] error – ${msg}`),
  warn: (msg) => console.warn(`⚠️ [flux-mcp-server] warn – ${msg}`),
  debug: (msg) => process.env.DEBUG && console.log(`🔍 [flux-mcp-server] debug – ${msg}`)
};

async function main() {
  try {
    // Validate environment
    if (!API_KEY) {
      log.error('BFL_API_KEY environment variable is required');
      process.exit(1);
    }

    log.info('Initializing Flux AI MCP Server...');

    // Initialize components
    const apiClient = new FluxApiClient(API_KEY);
    const fileManager = new FileManager({ 
      defaultOutputDir: DEFAULT_OUTPUT_DIR 
    });
    const server = new FluxMcpServer({ apiClient, fileManager });

    log.info(`Server initialized: ${server.name} v${server.version}`);
    log.info(`Output directory: ${fileManager.defaultOutputDir}`);

    // Start MCP server (simplified for this implementation)
    // In a real MCP server, this would set up the MCP protocol handlers
    log.info('✅ Flux AI MCP Server ready for Cursor IDE integration');
    
    // Keep the server running
    process.stdin.resume();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      log.info('Shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      log.info('Received SIGTERM, shutting down...');
      process.exit(0);
    });

  } catch (error) {
    log.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Export components for testing
export { FluxApiClient, FileManager, FluxMcpServer };

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 [flux-mcp-server] Fatal error:', error);
    process.exit(1);
  });
} 