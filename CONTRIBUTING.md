# Contributing to Flux AI MCP Server

## Development Process

- Sign commits with DCO (`git commit -s`)
- Run lint/tests before PR; add/refresh unit tests
- No secrets or proprietary data in issues/PRs
- Semantic Versioning; maintainers cut releases

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/bfl-api-mcp.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/amazing-feature`

## Development Workflow

### Test-Driven Development

This project follows TDD principles:

1. **Red**: Write failing tests first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

```bash
npm run test:tdd    # TDD watch mode
npm test           # Run all tests
npm run lint       # Check code style
```

### Code Standards

- ES modules (`type: "module"`)
- Comprehensive error handling
- JSDoc documentation for public APIs
- Follow existing code style and patterns

### Commit Requirements

All commits must be signed with the Developer Certificate of Origin:

```bash
git commit -s -m "Add amazing feature"
```

### Pull Request Process

1. Ensure tests pass: `npm test`
2. Check linting: `npm run lint`
3. Update documentation if needed
4. Describe changes in PR description
5. Link related issues

## Testing

### Running Tests

```bash
npm test                # All tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:integration # Integration tests only
```

### Test Requirements

- All new features must have tests
- Maintain or improve coverage
- Mock external dependencies
- Test both success and error cases

## Code Review

- All PRs require review from maintainers
- Address feedback promptly
- Keep PRs focused and atomic
- Squash commits before merge

## Release Process

Maintainers handle releases following semantic versioning:

- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes