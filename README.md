# Fortify Workflow

**An AI-assisted workspace for creating and organizing standardized process documentation.**

Fortify Workflow is a React and TypeScript application prototype for turning process descriptions into structured documentation and keeping process templates and workflow activity in one workspace.

## Product areas

- **Dashboard** — overview of recent documentation, workflows, and team activity.
- **AI Process Generator** — uses the Google Gemini API to draft process templates with an audience, description, and ordered steps.
- **Process Library** — stores generated process documentation in Cloud Firestore.
- **Workflow Tracking** — displays workflow status, ownership, and progress data.
- **Team & Roles** — provides a team directory with admin, editor, and viewer role labels.
- **Appearance Settings** — supports light, dark, and system theme preferences.

> **Prototype status:** This repository contains an application prototype. Some controls and metrics in the UI are demonstrative or not fully wired yet (for example, export and invitation actions). Review the implementation and Firebase security rules before using it with operational or sensitive data.

## Technology stack

- React 19 and TypeScript
- Vite
- Firebase Authentication and Cloud Firestore
- Google GenAI SDK (Gemini)
- Tailwind CSS, Radix-based UI components, Lucide icons, and Motion
- React Router

## Prerequisites

- Node.js 20 LTS or newer
- npm
- A configured Firebase project with Authentication and Cloud Firestore enabled
- A Gemini API key for AI template generation

## Run locally

### 1. Clone and install

```bash
git clone https://github.com/amansharmas7/Fortify-WorkFlow.git
cd Fortify-WorkFlow
npm install
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

Set `GEMINI_API_KEY` in `.env.local`. Keep local environment files out of Git. `APP_URL` is used by the hosted AI Studio environment; set it only when your deployment requires it.

The Vite configuration currently injects `GEMINI_API_KEY` into the client bundle. Treat that key as visible to browser users: use a restricted key with appropriate API/referrer restrictions and quotas. For a production deployment, move Gemini requests behind a trusted server-side endpoint rather than shipping a privileged API key to the browser.

### 3. Configure Firebase

The app uses the Firebase web configuration in `firebase-applet-config.json`. Make sure it points to a Firebase project you control, with the required Authentication provider(s) and Firestore database enabled.

Review and deploy [firestore.rules](firestore.rules) for your target project before using real data. Firebase client configuration is not a substitute for database security rules. Do not commit service-account credentials or other server-side secrets.

### 4. Start the development server

```bash
npm run dev
```

Vite starts the local development server on port `3000` (see `vite.config.ts`).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run the TypeScript compiler without emitting files |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run clean` | Remove the generated build directory |

Run the checks before opening a pull request:

```bash
npm run lint
npm run build
```

GitHub Actions runs the same type-check and production-build commands on pushes and pull requests to `main`.

## Repository layout

```text
.
├── src/
│   ├── components/       # Layout and reusable UI components
│   ├── lib/              # Firebase and Gemini integrations
│   ├── pages/            # Dashboard, generator, library, workflows, team, settings
│   ├── App.tsx
│   └── main.tsx
├── docs/                 # (Add project documentation here)
├── firestore.rules       # Firestore access and data validation rules
├── firebase-applet-config.json
├── .env.example
├── package.json
└── vite.config.ts
```

## Security and deployment notes

- Never commit `.env.local`, API keys, service-account files, or private credentials.
- The Gemini key is currently exposed to the browser by the Vite configuration; use a restricted key and prefer a server-side proxy for production.
- Validate Firestore rules against your actual user and role model. Do not assume UI role checks enforce database permissions.
- Avoid storing personal, health, or other sensitive information in this prototype until access rules, auditability, and data handling have been reviewed.
- Some displayed dashboard values are placeholders; do not treat them as live operational metrics.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
