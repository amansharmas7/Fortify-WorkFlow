# Fortify Workflow

[![CI](https://github.com/amansharmas7/Fortify-WorkFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/amansharmas7/Fortify-WorkFlow/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**An AI-assisted workspace for creating, organizing, and tracking standardized process documentation.**

Fortify Workflow is a React and TypeScript application prototype for turning process descriptions into structured documentation and keeping templates, workflow activity, and team information in one workspace.

> **Project status:** Application prototype. The core interface and integrations are present, but some controls and metrics remain demonstrative or are not fully wired (including export and invitation actions). The current Firestore rules are permissive for demonstration and are **not suitable for production or sensitive operational data**.

## Product areas

| Area | Capability |
| --- | --- |
| Dashboard | Overview of recent documentation and workflow activity |
| AI Process Generator | Drafts structured process templates with an audience, description, roles, tools, and ordered steps |
| Process Library | Stores generated process documentation in Cloud Firestore |
| Workflow Tracking | Displays workflow status, ownership, and progress |
| Team & Roles | Shows a team directory and admin/editor/viewer role labels |
| Appearance | Light, dark, and system theme preferences |

## Technology

- React 19 and TypeScript
- Vite 6
- Firebase Authentication and Cloud Firestore
- Google GenAI SDK (Gemini)
- Tailwind CSS, Base UI/Radix components, Lucide icons, Motion, and Sonner
- React Router

## Requirements

- Node.js 20 LTS or newer
- npm
- A Firebase project with Authentication and Cloud Firestore enabled
- A Gemini API key for process generation

## Run locally

### 1. Clone and install

```bash
git clone https://github.com/amansharmas7/Fortify-WorkFlow.git
cd Fortify-WorkFlow
npm ci
```

### 2. Configure environment variables

Copy the example file:

**macOS / Linux**

```bash
cp .env.example .env.local
```

**Windows PowerShell**

```powershell
Copy-Item .env.example .env.local
```

Set `GEMINI_API_KEY` in `.env.local`. Keep this file private. `APP_URL` is used by the hosted AI Studio environment and only needs to be set when your deployment requires it.

**Important:** Vite currently injects `GEMINI_API_KEY` into the browser bundle. A browser user can inspect and extract that key. Use a restricted key with appropriate API/referrer restrictions and quotas for local experimentation. For production, move Gemini requests behind a trusted server-side endpoint and keep the privileged key on the server.

### 3. Configure Firebase

The app reads its Firebase web configuration from `firebase-applet-config.json`. Point it to a Firebase project you control and enable the Authentication provider(s) and Firestore database required by the app.

Review [firestore.rules](firestore.rules) before deploying them. Firebase web configuration is not an access-control boundary; Firestore Security Rules determine what clients can read and write.

**Current rules are demonstration-only:** process and workflow documents are publicly readable, unauthenticated process creation is possible with the guest author marker, and any authenticated user can update workflow documents. Team-role UI checks do not replace server-enforced authorization. Do not use the current rules with confidential health, employee, patient, or operational data.

### 4. Start the development server

```bash
npm run dev
```

Vite serves the application on port `3000` (configured in `vite.config.ts`).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Type-check TypeScript without emitting files |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build |
| `npm run clean` | Remove the generated build directory (Windows/macOS/Linux) |

Run the checks before opening a pull request:

```bash
npm run lint
npm run build
```

GitHub Actions runs dependency installation, type-checking, and a production build on pushes and pull requests to `main`.

## Repository layout

```text
.
├── components/              # Reusable UI primitives
├── src/
│   ├── components/layout/   # App shell, navigation, sidebar, footer
│   ├── components/ui/       # Shared UI and error boundary
│   ├── lib/                 # Firebase and Gemini integrations
│   ├── pages/               # Dashboard, generator, library, workflows, team, settings
│   ├── App.tsx
│   └── main.tsx
├── firestore.rules          # Demonstration Firestore rules; review before deployment
├── firebase-applet-config.json
├── .env.example
├── package.json
├── package-lock.json
└── vite.config.ts
```

## Security and deployment checklist

- Never commit `.env.local`, API keys, service-account files, or other private credentials.
- Move Gemini calls to a server-side API before production deployment.
- Replace the demonstration Firestore rules with least-privilege rules aligned to the actual user, organization, and role model.
- Enforce role changes and workflow permissions in Firestore Security Rules or a trusted backend, not only in the UI.
- Add Firebase Emulator tests for allowed and denied access before deploying new rules.
- Remove placeholder dashboard metrics and wire export/invitation controls before describing those features as operational.
- Do not store personal, health, patient, or employee data in this prototype.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local checks and pull-request guidance. For security concerns, see [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
