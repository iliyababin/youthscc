# Firebase Functions for Custom Claims

This directory contains Firebase Cloud Functions for managing user roles with custom claims.

## Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Install Dependencies

```bash
cd functions
npm install
```

### 3. Deploy Functions

```bash
# From the project root
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:setUserRole
firebase deploy --only functions:onAuthUserCreated
```

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Available Functions

### `setUserRole`
Callable HTTPS function to set a user's role. Can only be called by admins.

**Usage from frontend:**
```typescript
import { setUserRole } from '@/lib/firebase/admin';

// Set a user as admin
await setUserRole('user-uid-here', 'admin');

// Set a user as leader
await setUserRole('user-uid-here', 'leader');

// Set a user as regular user
await setUserRole('user-uid-here', 'user');
```

### `onAuthUserCreated`
Firebase Auth trigger that automatically sets the default 'user' role when a new user signs up.

## How Custom Claims Work

1. **When a user signs up:**
   - User profile is created in Firestore (without role field)
   - `onAuthUserCreated` trigger automatically sets custom claims with `role: 'user'`

2. **To promote a user to admin/leader:**
   - Call `setUserRole(uid, 'admin')` function from the frontend (admin only)
   - This sets custom claims directly via Firebase Admin SDK

3. **Frontend reads the role:**
   - `useUserRole()` hook reads from `user.getIdTokenResult().claims.role`
   - No Firestore read required (faster!)

4. **Firestore rules check the role:**
   - Rules use `request.auth.token.role` to check permissions
   - No Firestore read required (more secure and faster!)

## Making Your First Admin

Since only admins can promote other users, you need to manually set the first admin. **Important:** You'll need your user UID from the Firebase Console (Authentication → Users) or from your profile page at `/profile`.

### Option 1: Using the Setup Script (Recommended)

We've created a one-time setup script at `scripts/setFirstAdmin.js`:

```bash
# First, get your service account key from Firebase Console:
# Project Settings → Service Accounts → Generate New Private Key
# Save it as serviceAccountKey.json in your project root (already in .gitignore)

# Set environment variable for Firebase Admin
export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"

# Run the script with your user UID
node scripts/setFirstAdmin.js YOUR-USER-UID-HERE
```

After running this, the user will need to **sign out and sign back in** for the changes to take effect.

### Option 2: Using Firebase CLI

```bash
firebase functions:shell

# In the shell:
admin.auth().setCustomUserClaims('YOUR-USER-UID', {role: 'admin'})
```

### Option 3: Using Firebase Console + Cloud Function

1. Deploy your functions first: `firebase deploy --only functions`
2. Temporarily modify `functions/src/index.ts` to remove the admin check:
   ```typescript
   // Comment out these lines temporarily:
   // if (callerRole !== 'admin') {
   //   throw new functions.https.HttpsError('permission-denied', 'Only admins can set user roles');
   // }
   ```
3. Redeploy: `firebase deploy --only functions:setUserRole`
4. Call the function from your app to set yourself as admin
5. Restore the admin check and redeploy

## Testing Locally

```bash
# Start Firebase emulators
firebase emulators:start

# Your functions will be available at:
# http://localhost:5001/YOUR-PROJECT-ID/us-central1/functionName
```

## Security Notes

- Only admins can call `setUserRole`
- Custom claims are more secure than Firestore-based roles because they can't be modified by the client
- Custom claims are cached in the ID token, so changes may take up to 1 hour to propagate (or force refresh with `user.getIdToken(true)`)
