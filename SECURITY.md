# Security Policy

## Reporting Vulnerabilities

Report vulnerabilities to security@progressussoftware.com. Do not file public issues for suspected vulnerabilities.

We acknowledge within 2 business days. Supported versions: latest two minor releases.

## Security Best Practices

- Never commit API keys or secrets to the repository
- Use `.env` files for local development (not tracked by git)
- All sample environment variables in `.env.example` are placeholders only
- Validate all user inputs
- Keep dependencies updated via Dependabot

## Supported Versions

We provide security updates for the latest two minor versions of this project.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Development Security

- Secret scanning is enabled via GitHub
- Push protection prevents accidental secret commits
- Dependencies are scanned for vulnerabilities
- Static analysis via ESLint