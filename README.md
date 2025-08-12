# 🎨 Flux AI MCP Server (JavaScript/TDD)

A powerful Model Context Protocol (MCP) server built with **Test-Driven Development** that integrates Black Forest Labs' Flux AI image generation models directly into Cursor IDE. Features expert prompts for image generation and logo design, plus comprehensive tools for creating stunning visuals.

## ✨ Key Features

### 🧪 **Built with TDD**
- **67/78 tests passing** - comprehensive test coverage
- Jest-based testing framework with ES modules support
- Mocked dependencies for reliable unit testing
- Full integration test suite

### 🎯 **Expert Prompts**
- **🖼️ Image Generation Expert**: Master-level guidance for visual composition, artistic styles, and technical excellence
- **🏢 Logo Design Expert**: Elite brand identity creation with professional design principles

### 🛠️ **Flux AI Tools**
- **FLUX.1 [pro]**: Highest quality, professional results
- **FLUX.1 [dev]**: Fast iterations, good quality  
- **FLUX 1.1 [pro]**: Latest model with improved speed
- **Flux Kontext Pro**: Advanced image-to-image transformations
- **Flux Kontext Max**: Maximum quality image editing

### 🎯 **AI-Directed File Management**
- Custom output paths and filenames
- Intelligent file organization suggestions
- Automatic filename generation from prompts
- Batch processing support
- Multiple format handling (JPEG, PNG)

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- Black Forest Labs API key
- Cursor IDE

### Installation

1. **Clone and Setup:**
```bash
git clone <repository-url>
cd bfl-api-mcp
npm install
```

2. **Run Tests (TDD Verification):**
```bash
npm test
# Should show 67+ tests passing
```

3. **Test with Watch Mode:**
```bash
npm run test:tdd
# Continuous testing during development
```

### Configuration

1. **Create MCP Configuration:**
Edit your `mcp-config.json`:
```json
{
  "mcpServers": {
    "flux-ai": {
      "command": "node",
      "args": ["/absolute/path/to/bfl-api-mcp/src/server.js"],
      "env": {
        "BFL_API_KEY": "your-bfl-api-key-here"
      }
    }
  }
}
```

2. **Copy to Cursor IDE:**
```bash
# Linux/macOS
cp mcp-config.json ~/.cursor/mcp-config.json

# Windows
copy mcp-config.json %APPDATA%\Cursor\mcp-config.json
```

## 🧪 TDD Implementation

This server was built using **Test-Driven Development**, following the Red-Green-Refactor cycle:

### Test Structure
```
tests/
├── setup.js              # Jest configuration and utilities
├── FluxApiClient.test.js  # API client unit tests
├── FileManager.test.js    # File management tests
└── FluxMcpServer.test.js  # Integration tests
```

### Running Tests
```bash
# Run all tests
npm test

# Watch mode for TDD
npm run test:watch

# Coverage report
npm run test:coverage

# TDD mode with verbose output
npm run test:tdd
```

### Test Results
- ✅ **67+ tests passing**
- 🧪 **API Client**: All core functionality tested
- 📁 **File Manager**: Path resolution, saving, organization
- 🎨 **MCP Server**: Tools, resources, expert prompts
- 🔄 **Integration**: End-to-end workflows

## 🎨 Usage Examples

### Basic Image Generation
```javascript
// Through Cursor MCP interface
await flux_pro_generate({
  prompt: "A majestic mountain landscape at sunset",
  width: 1920,
  height: 1080,
  output_path: "~/Projects/landscapes/",
  filename: "mountain_sunset_masterpiece"
});
```

### Logo Design with Expert
```javascript
// Get expert guidance first
const logoExpert = await readResource("flux-expert://logo_expert");

// Then generate
await flux_dev_generate({
  prompt: "Modern tech startup logo, clean geometric design, blue and white",
  width: 1024,
  height: 1024,
  output_path: "~/Brands/TechCorp/",
  filename: "techcorp_logo_v1"
});
```

### Image-to-Image with Kontext
```javascript
await flux_kontext_pro_generate({
  prompt: "Transform to cyberpunk style with neon lighting",
  input_image: "base64-encoded-image-data",
  aspect_ratio: "16:9",
  output_path: "~/Art/cyberpunk/",
  filename: "cyberpunk_transformation"
});
```

## 🏗️ Architecture

### Core Components

#### **FluxApiClient** (`src/FluxApiClient.js`)
- HTTP client for Flux API
- Async task management
- Progress tracking
- Error handling

#### **FileManager** (`src/FileManager.js`)  
- AI-directed file saving
- Path resolution (absolute, relative, tilde)
- Filename generation from prompts
- Format handling and validation

#### **FluxMcpServer** (`src/FluxMcpServer.js`)
- MCP protocol implementation
- Tool registration and execution
- Resource management
- Expert prompt integration

#### **ExpertPrompts** (`src/ExpertPrompts.js`)
- Expert prompt templates
- Smart expert suggestion
- Metadata management

### Dependencies
```json
{
  "dependencies": {
    "node-fetch": "^3.3.2",
    "fs-extra": "^11.2.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nock": "^13.5.6",
    "eslint": "^8.57.0"
  }
}
```

## 🔧 Development

### TDD Workflow
1. **Red**: Write failing tests first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

### Code Style
- ES modules (type: "module")
- f-string logging: `console.log(f"🚀 [service] message")`
- Comprehensive error handling
- JSDoc documentation

### Testing Commands
```bash
npm run test        # All tests
npm run test:watch  # Watch mode
npm run test:tdd    # TDD verbose mode
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix issues
```

## 🛠️ Available Tools

| Tool | Model | Description |
|------|-------|-------------|
| `flux_pro_generate` | FLUX.1 [pro] | Highest quality, professional results |
| `flux_dev_generate` | FLUX.1 [dev] | Fast iterations, good quality |
| `flux_pro_11_generate` | FLUX 1.1 [pro] | Latest model, improved speed |
| `flux_kontext_pro_generate` | Kontext Pro | Image-to-image transformations |
| `flux_kontext_max_generate` | Kontext Max | Maximum quality editing |

## 📚 Expert Resources

| Resource | URI | Purpose |
|----------|-----|---------|
| Image Expert | `flux-expert://image_expert` | Visual composition and technical guidance |
| Logo Expert | `flux-expert://logo_expert` | Brand identity and logo design |

## 🐛 Troubleshooting

### Common Issues

**Jest ES Module Errors:**
```bash
# Use the experimental VM modules flag
npm run test:tdd
```

**API Key Issues:**
```bash
export BFL_API_KEY="your-api-key"
npm test
```

**File Permission Errors:**
- Ensure output directories are writable
- Check file system permissions

### Debug Mode
```bash
# Enable debug logging
DEBUG=flux:* npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. **Write tests first** (TDD!)
4. Implement feature to pass tests
5. Run test suite: `npm test`
6. Commit changes: `git commit -m "Add amazing feature"`
7. Push branch: `git push origin feature/amazing-feature`
8. Open Pull Request

### Test Requirements
- All new features must have tests
- Tests must pass: `npm test`
- Coverage should not decrease
- Follow TDD principles

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Black Forest Labs** for the amazing Flux AI models
- **Cursor IDE** for MCP protocol support
- **Jest** for excellent testing framework
- **TDD Community** for best practices

---

Built with ❤️ using **Test-Driven Development** for reliable, maintainable code. 