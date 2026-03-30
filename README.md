# NeuroQuest

NeuroQuest is a Next.js + Firebase app for a presentable mental health MVP focused on real user tracking, therapist follow-up, and crisis guidance.

## MVP Scope

The current MVP includes:

- Dashboard with real user state from Firestore
- Mental Check-In with persisted responses, score, severity, and denormalized user fields
- Progress with real check-in metrics, trend, recent history, and printable reports
- Medical Support with dynamic guidance based on latest check-in severity
- Crisis Support with Medellin emergency lines and mental health centers
- Therapist patient list and patient detail view
- Observer with saved thoughts and follow-up insights

## Tech Stack

- Next.js
- React
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Tailwind CSS

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure Firebase environment variables for the app.

3. Start the development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:9002
```

## Deployment Alignment

As of March 27, 2026, the live domain `neuroquest.krakendigitalabs.com` is served by Vercel, not by Firebase Hosting.

Verified production signals:

- DNS resolves `neuroquest.krakendigitalabs.com` to `76.76.21.21`
- HTTP response includes `Server: Vercel`
- Firebase Hosting site `https://studio-3083535459-c0472.web.app` is a separate placeholder deployment and is not the live product

Operational model for this repo:

- Vercel serves the Next.js application
- Firebase provides Authentication, Firestore, and rules/index deployment
- `firebase.json` should be treated as legacy Hosting config unless a future migration explicitly revives Firebase Hosting for web delivery

Required Vercel environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `GEMINI_API_KEY`

The admin credentials power `/api/auth/session` and must target the same Firebase project as the public `NEXT_PUBLIC_FIREBASE_PROJECT_ID`. Follow `.env.example` for the correct private-key formatting (wrap it in quotes and keep the literal `\n` sequences or use Vercel's multiline editor so the key remains intact).

Recommended deployment split:

- Use Vercel for app deploys
- Use Firebase CLI for Firestore rules and indexes only

Release helper commands:

```bash
npm run validate
npm run deploy:firebase
```

Detailed deployment notes live in:

```text
docs/deployment.md
```

## Real Clinical Flow

### 1. Mental Check-In

Route: `/check-in`

- Uses a 10-question questionnaire
- Each answer is scored from `0` to `4`
- Total score is classified into:
  - `healthy`
  - `mild`
  - `moderate`
  - `severe`
- Saves a document in:

```text
users/{uid}/mental_checkups
```

- Updates denormalized fields in:

```text
users/{uid}
```

Updated user fields:

- `latestCheckInScore`
- `latestCheckInLevel`
- `latestCheckInAt`
- `latestCheckInNote`

### 2. Progress

Route: `/progress`

- Reads real check-ins from Firestore
- Calculates:
  - recent average score
  - trend vs previous block
  - latest level
  - recent check-in history
- Includes a printable report for follow-up

### 3. Medical Support

Route: `/medical-support`

- Reads `latestCheckInLevel` from the user profile
- Shows dynamic content by severity:
  - `healthy`: preventive follow-up
  - `mild`: basic recommendations
  - `moderate`: suggested intervention
  - `severe`: alert and direct access to crisis support
- Does not generate medication doses
- Keeps medical disclaimer visible
- Includes a printable clinical summary

### 4. Crisis Support

Route: `/crisis`

- Medellin emergency numbers
- Psychiatric clinics
- Specialized mental health centers
- Hospitals with psychiatric care
- Direct emergency guidance for severe crisis

## Firestore Notes

The app expects authenticated users and Firestore collections under:

```text
users/{uid}
users/{uid}/mental_checkups
users/{uid}/thoughtRecords
users/{uid}/exposureMissions
```

Therapist flows also depend on assigned users and therapist permissions already configured in Firestore.

## Print Reports

The current MVP supports browser print reports from:

- `/progress`
- `/medical-support`

These reports include patient context, generation date, latest severity context, and signature blocks for clinical follow-up.

## Verification

Type-check the app with:

```bash
npm run typecheck
```

Additional validation commands:

```bash
npm run lint
npm run test
npm run build
```

## Dependency Security Note

As of March 27, 2026, dependency maintenance for this repo is in a stable state:

- `next` was updated to `15.5.14`
- `genkit`, `genkit-cli`, and `@genkit-ai/google-genai` were aligned to `1.31.0`
- `patch-package` was updated to `8.0.1`
- `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` all pass

Residual `npm audit` findings remain, but they are currently limited to low-severity transitive issues in the Genkit and Google Cloud dependency chain. The available `npm audit` suggestion for those findings points to incompatible downgrade paths such as `genkit@1.16.1` or `genkit-cli@0.0.2`, which are not considered safe remediation steps for this project.

The previous build warning around `@opentelemetry/exporter-jaeger` was resolved by installing the missing package explicitly.

## Current Branch

Latest uploaded branch for this work:

```text
nueva-rama
```

## Legal Notice

Copyright © 2026 Yessy Alejandro Lotero Hernandez.

All rights reserved.

This repository, its source code, design, content, branding, flows, and related materials are proprietary. No part of this project may be copied, reproduced, distributed, modified, sublicensed, published, or used for commercial or non-commercial purposes without prior written authorization from Yessy Alejandro Lotero Hernandez.
