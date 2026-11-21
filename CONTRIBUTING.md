# Contributing

Thanks for considering a contribution to Fortify Workflow.

## Before opening a pull request

1. Describe the problem or proposed enhancement in an issue.
2. Keep the change focused and explain its user impact.
3. Preserve the current prototype boundaries; do not describe placeholder controls as completed features.
4. Add or update tests when introducing testable business logic.
5. Update the README when installation, configuration, or behaviour changes.
6. Never commit API keys, Firebase service-account credentials, or private data.

## Local checks

```bash
npm ci
npm run lint
npm run build
```

All checks should pass before requesting review.
