# Security Policy

## Supported versions

Security fixes are currently provided for the latest revision on the `main` branch.

## Reporting a vulnerability

Please do not publish exploitable details in a public issue. Use GitHub's private vulnerability reporting feature for this repository, when available. Include the affected revision, reproduction steps, impact, and a suggested mitigation. Do not include real credentials or personal data.

## Deployment warning

This repository is a prototype. The current Firestore rules permit public reads of process and workflow documents, unauthenticated process creation, and workflow updates by any authenticated user. The Gemini API key is also currently injected into the browser bundle. Do not deploy the current configuration with confidential, health, patient, employee, or operational data.

Before production use, replace the rules with a tested least-privilege policy and move Gemini requests behind a trusted server-side endpoint.
