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
- Express server for Gemini requests
- Firebase Authentication and Cloud Firestore
- Google GenAI SDK (server-side only)
- Tailwind CSS, Base UI/Radix components, Lucide icons, Motion, and Sonner
- React Router

## Requirements

- Node.js 20 LTS or newer
- npm
- A Firebase project with Authentication and Cloud Firestore enabled
- A Gemini API key stored only in the server environment

## Run locally

### 1. Clone and install

~~~bash
git clone https://github.com/amansharmas7/Fortify-WorkFlow.git
cd Fortify-WorkFlow
npm ci
~~~

### 2. Configure the server environment

Copy the example file to .env:

**macOS / Linux**

~~~bash
cp .env.example .env
~~~

**Windows PowerShell**

~~~powershell
Copy-Item .env.example .env
~~~

Set GEMINI_API_KEY to your Gemini key. Keep .env private and never prefix the key with VITE_. PORT defaults to 3001; ALLOWED_ORIGINS is a comma-separated allowlist of browser origins. The local Vite origin is already included in the example.

### 3. Configure Firebase

The app reads its Firebase web configuration from firebase-applet-config.json. Point it to a Firebase project you control and enable the Authentication provider(s) and Firestore database required by the app.

Review firestore.rules before deploying them. Firebase web configuration is not an access-control boundary; Firestore Security Rules determine what clients can read and write.

**Current rules are demonstration-only:** process and workflow documents are publicly readable, unauthenticated process creation is possible with the guest author marker, and any authenticated user can update workflow documents. Team-role UI checks do not replace server-enforced authorization. Do not use the current rules with confidential health, employee, patient, or operational data.

### 4. Start the API and Vite

Open two terminals from the repository root.

Terminal 1 — server-side Gemini API:

~~~bash
npm run dev:api
~~~

Terminal 2 — React/Vite frontend:

~~~bash
npm run dev
~~~

Vite serves the app on port 3000 and proxies /api/* to the Express server on port 3001. The browser sends only the process prompt to the same-origin endpoint; the Gemini API key remains in the server process.

## Production deployment

Build the frontend and run the Express server in the same deployment:

~~~bash
npm ci
npm run lint
npm test
npm run build
npm start
~~~

Set GEMINI_API_KEY, PORT, and ALLOWED_ORIGINS in the hosting provider's server-side environment or secret manager. The Express process serves the built dist/ directory and the /api/generate-process endpoint. Do not deploy dist/ as a standalone static site if AI generation is required; a trusted server endpoint must remain available.

The API validates prompt length and generated response shape, limits JSON request size, applies a per-process IP rate limit, checks configured browser origins, and returns generic upstream errors. The in-memory rate limiter is a basic abuse-control measure, not a distributed quota system. For multi-instance or public production deployments, add a shared rate limiter (for example Redis), authenticated user quotas, monitoring, and provider-side spending limits.

## Available scripts

| Command | Description |
| --- | --- |
| npm run dev | Start the Vite frontend |
| npm run dev:api | Start the Express API for local development |
| npm run dev:vite | Start the Vite frontend separately |
| npm start | Start the Express server and serve the production build |
| npm run lint | Type-check TypeScript without emitting files |
| npm test | Run server API tests |
| npm run build | Create the production build in dist/ |
| npm run preview | Preview the frontend build (without the Express API) |
| npm run clean | Remove the generated build directory |

## Security configuration

- **Gemini credential:** GEMINI_API_KEY is read by server/index.js only. It is not defined in Vite, imported by client modules, or included in the browser bundle. If a key was previously exposed in a deployed client bundle, rotate it in Google AI Studio/Google Cloud.
- **Origins:** Set ALLOWED_ORIGINS to the exact frontend origins that should call the API. Origin checks are a browser-origin control, not a replacement for authentication.
- **Abuse prevention:** The endpoint enforces prompt size, JSON body size, response-shape validation, and a small in-memory per-IP rate limit. Add shared rate limiting and authenticated quotas before public production use.
- **Firebase:** Replace demonstration Firestore rules with least-privilege rules aligned to the actual user, organization, and role model. Enforce permissions in Firestore Security Rules or a trusted backend, not only in the UI.
- **Secrets:** Never commit .env, .env.local, API keys, service-account files, or other private credentials.
- **Data:** Do not store personal, health, patient, or employee data in this prototype until the access model and rules have been reviewed.

## Repository layout

~~~text
.
├── components/              # Reusable UI primitives
├── scripts/
│   └── dev.js                # Starts and supervises API + Vite in development
├── server/
│   ├── index.js              # Trusted Gemini API and static-file server
│   └── index.test.js         # API validation and rate-limit tests
├── src/
│   ├── components/layout/
│   ├── components/ui/
│   ├── lib/                  # Firebase and same-origin Gemini API client
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── firestore.rules
├── firebase-applet-config.json
├── .env.example
├── package.json
└── package-lock.json
~~~

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local checks and pull-request guidance. For security concerns, see [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
