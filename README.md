# JNTUH Important Questions Portal

Production-oriented student portal for Jawaharlal Nehru Technological University Hyderabad: SEO-friendly URLs, Firebase backend, PDF exports with watermark + QR, comments (auth-gated), admin shell, and PWA support.

## Quick start

```bash
cd jntuh-important-questions
cp .env.example .env
npm install
npm run dev
```

Without Firebase env vars, the app runs in **demo mode** using bundled sample question sets so UI, PDF, and routing can be tested locally.

## Firebase setup

1. Create a Firebase project and enable **Authentication** (Google + Email/Password).
2. Create a **Firestore** database and deploy rules:

   ```bash
   firebase deploy --only firestore:rules
   ```

3. Create an `admins` collection. Add a document with ID = your user UID (from Authentication) to grant dashboard access.
4. Add web app credentials to `.env` using the `VITE_FIREBASE_*` keys from `.env.example`.

### Collections

Implement the data model described in your product spec (`questionSets`, `comments`, `users`, `favorites`, `downloads`, `searches`, etc.). The client expects `questionSets` documents to align with `src/types/models.ts`.

## Scripts

| Command        | Description                |
| -------------- | -------------------------- |
| `npm run dev`  | Vite dev server            |
| `npm run build`| Typecheck + production build |
| `npm run preview` | Serve `dist` locally    |

## Deployment

- **Firebase Hosting**: `npm run build` then `firebase deploy --only hosting`.
- **Vercel**: connect the repo; set build command to `npm run build` and output to `dist`.

Update `SITE_URL` in `src/lib/constants.ts` and regenerate `public/sitemap.xml` as you add routes.

## Security notes

- Enforce admin operations with Firestore rules + optional Custom Claims.
- Run profanity/spam checks in **Cloud Functions** before writes for stronger guarantees than client-only checks.
- Add reCAPTCHA on signup/comment endpoints server-side.

## License

Use and modify for your deployment; ensure content and branding comply with university and publisher policies.
