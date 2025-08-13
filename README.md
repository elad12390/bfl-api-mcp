# 🎨 Flux AI MCP Server

## About

General-purpose developer tool for integrating Black Forest Labs' Flux AI image generation models into Cursor IDE via Model Context Protocol (MCP). **No customer data, proprietary prompts, or core product logic.**

## Install

```bash
git clone https://github.com/stanley-marketing/bfl-api-mcp.git
cd bfl-api-mcp
npm install
```

## Configure

Create `.env` from `.env.example`. Do not commit secrets.

```bash
cp .env.example .env
# Edit .env with your Black Forest Labs API key
```

### MCP Configuration

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

Copy to Cursor IDE:

```bash
# Linux/macOS
cp mcp-config.json ~/.cursor/mcp-config.json

# Windows
copy mcp-config.json %APPDATA%\Cursor\mcp-config.json
```

## Usage

### Basic Image Generation

```javascript
await flux_pro_generate({
  prompt: "A majestic mountain landscape at sunset",
  width: 1920,
  height: 1080,
  output_path: "~/Projects/landscapes/",
  filename: "mountain_sunset_masterpiece"
});
```

### Available Tools

| Tool | Model | Description |
|------|-------|-------------|
| `flux_pro_generate` | FLUX.1 [pro] | Highest quality, professional results |
| `flux_dev_generate` | FLUX.1 [dev] | Fast iterations, good quality |
| `flux_pro_11_generate` | FLUX 1.1 [pro] | Latest model, improved speed |
| `flux_kontext_pro_generate` | Kontext Pro | Image-to-image transformations |
| `flux_kontext_max_generate` | Kontext Max | Maximum quality editing |

## Testing

```bash
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # Coverage report
```

## Safety & Privacy

Do not upload PII or confidential data. See SECURITY.md.

## License

MIT. See LICENSE and NOTICE.