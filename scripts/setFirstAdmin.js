/**
 * One-time script to set the first admin user
 * Run with: node scripts/setFirstAdmin.js <user-uid>
 *
 * This bypasses the admin-only check since there's no admin yet.
 * After running this once, use the setUserRole Cloud Function to promote other users.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const uid = process.argv[2];

if (!uid) {
  console.error('Usage: node scripts/setFirstAdmin.js <user-uid>');
  process.exit(1);
}

async function setFirstAdmin() {
  try {
    // Set custom claims (single source of truth for roles)
    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });

    console.log(`✅ Successfully set user ${uid} as admin`);
    console.log('The user will need to sign out and sign back in for changes to take effect.');

    process.exit(0);
  } catch (error) {
    console.error('Error setting admin:', error);
    process.exit(1);
  }
}

setFirstAdmin();
