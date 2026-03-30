# Deployment

As of March 27, 2026, NeuroQuest uses:

- Vercel for the Next.js web application
- Firebase for Authentication, Firestore, rules, and indexes
- Hostinger only for DNS/domain control

## Production Topology

- Public app: `https://neuroquest.krakendigitalabs.com`
- Hosting provider: Vercel
- Firebase project: `studio-3083535459-c0472`
- Firestore database: `(default)`

## Required Vercel Environment Variables

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

Use the `.env.example` file as your template so the admin private key keeps the literal `\n` sequences that Vercel requires or paste it through their multiline editor. The admin and public project IDs must match exactly; otherwise `/api/auth/session` cannot verify Firebase tokens.

## Release Flow

1. Validate the app locally:

```bash
npm run validate
```

2. Push the branch to GitHub.

3. Deploy the web app through Vercel.

4. If Firestore rules or indexes changed, deploy them explicitly:

```bash
npm run deploy:firebase
```

## Notes

- `firebase.json` is intentionally limited to Firestore resources.
- Do not use Firebase Hosting for the web app unless the deployment architecture is intentionally changed.
- The old Firebase Hosting site `https://studio-3083535459-c0472.web.app` is not the production app.
