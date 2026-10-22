<div align="center">

# AssessAI

### Assess your skills. Understand the gaps. Build what comes next.

An AI-powered learning and assessment platform for measuring technical skills, finding knowledge gaps, and turning results into a practical learning plan.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase&logoColor=222)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&logoColor=white)](https://vercel.com/)

<br />

<img src="assets/learning-orbit.svg" alt="Original three-dimensional illustration: a glowing learning cube above a progress grid with orbiting assessment and analytics cards" width="100%" />

<br />

[Explore the live app](https://intelligent-learning-progress-asses-five.vercel.app) · [Report a bug](https://github.com/krishnaprasath17/Intelligent-Learning-Progress-Assessment-and-Improvement-System/issues)

</div>

---

## What it does

AssessAI brings assessment, feedback, and guided practice together in one learning loop:

1. **Assess** — take structured tests across computer science, programming, and placement-preparation topics.
2. **Understand** — review scores, topic-level performance, strengths, and areas to work on.
3. **Improve** — get AI-assisted insights and a personalized learning roadmap.
4. **Track** — follow progress, achievements, experience points, and learning streaks over time.

The app also includes an administrator dashboard for managing question banks, submissions, users, and access controls.

## Features

- Adaptive assessments, timed exams, and assessment history
- Skill and topic-level progress analytics
- AI tutoring, performance insights, and learning-roadmap generation
- Interactive coding practice
- Authentication and user-specific learning data with Firebase
- Gamified levels, achievements, experience points, and streaks
- Admin tools for question management and platform oversight
- Responsive React interface

## Technology

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **AI:** Google Gemini API, called by server-side routes
- **Identity and data:** Firebase Authentication and Cloud Firestore
- **Hosting:** Vercel (static frontend plus serverless API)

## Run locally

### Requirements

- Node.js 20 or later
- npm
- Firebase project credentials for Firebase-backed features
- Gemini API key for AI-backed features

### Install

```bash
npm ci
```

Copy the example environment file, then fill in the values on your own machine:

```powershell
Copy-Item .env.example .env
```

Set the required variables in `.env`:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Server-side Gemini API access |
| `FIREBASE_PROJECT_ID` | Firebase project identifier |
| `FIRESTORE_DATABASE_ID` | Cloud Firestore database identifier |
| `FIREBASE_SERVICE_ACCOUNT_FILE` | Path to a local service-account JSON file, for example `.service-account.json` |

For local Admin SDK access, put your service-account JSON in `.service-account.json` in the project root, or point `FIREBASE_SERVICE_ACCOUNT_FILE` to a secure local path. Never commit service-account files, private keys, or API secrets. `.env` and service-account files are excluded by `.gitignore`.

The browser Firebase configuration is in `firebase-applet-config.json`. Firebase web configuration is not a substitute for server credentials; protect data with Authentication and Firestore Security Rules.

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Import this GitHub repository into [Vercel](https://vercel.com/new).
2. Keep the repository's Vercel configuration and build command (`npm run build`).
3. Add these environment variables in the Vercel project settings for the environments you deploy:
   - `GEMINI_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIRESTORE_DATABASE_ID`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — the complete service-account JSON as a single environment-variable value, using a newly created key.
   - `INITIAL_ADMIN_EMAIL` — optional; the email address to bootstrap as the first administrator.
4. Deploy the project and add the Vercel domain to Firebase Authentication's authorized domains.
5. Verify `/api/health`, then sign in with an approved administrator account and confirm the admin dashboard loads its data.

Never put server credentials in `VITE_*` variables, browser code, commits, screenshots, or issue reports. If a credential has been exposed, revoke it and create a replacement before deployment.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local application |
| `npm run lint` | Type-check the project |
| `npm run build` | Build the frontend and Vercel API bundle |
| `npm start` | Start the standalone production server after building |

## Repository layout

```text
api/       Vercel API function entry points
server/    API routes, Firebase Admin, and Gemini services
src/       React app, pages, components, and Firebase client
assets/    README artwork
```

## Security

- Keep `.env`, `.service-account.json`, `service-account.json`, and all private keys out of Git.
- Store production secrets in Vercel's encrypted environment-variable settings.
- Review and deploy `firestore.rules` with least-privilege access.
- Treat any previously exposed credential as compromised: revoke it and rotate it.

---

<div align="center">

Built to make learning progress visible—and the next step actionable.

</div>
