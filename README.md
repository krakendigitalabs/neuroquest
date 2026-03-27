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

## Current Branch

Latest uploaded branch for this work:

```text
nueva-rama
```

## Legal Notice

Copyright © 2026 Yessy Alejandro Lotero Hernandez.

All rights reserved.

This repository, its source code, design, content, branding, flows, and related materials are proprietary. No part of this project may be copied, reproduced, distributed, modified, sublicensed, published, or used for commercial or non-commercial purposes without prior written authorization from Yessy Alejandro Lotero Hernandez.
