import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function to set custom claims for a user
 * This should be called by an admin through a secure interface
 *
 * Usage: Call this function with { uid: 'user-id', role: 'admin' | 'leader' | 'user' }
 */
export const setUserRole = functions.https.onCall(async (data, context) => {
  // Check if request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function'
    );
  }

  // Check if the caller is an admin (using custom claims)
  const callerRole = context.auth.token.role;

  if (callerRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can set user roles'
    );
  }

  // Validate input
  const { uid, role } = data;
  if (!uid || typeof uid !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'User ID is required');
  }

  if (!role || !['admin', 'leader', 'user'].includes(role)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Role must be one of: admin, leader, user'
    );
  }

  try {
    // Set custom claims (single source of truth for roles)
    await admin.auth().setCustomUserClaims(uid, { role });

    return {
      success: true,
      message: `Successfully set role "${role}" for user ${uid}`
    };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new functions.https.HttpsError('internal', 'Failed to set user role');
  }
});

/**
 * Automatically set default 'user' role when a new user is created in Firebase Auth
 * This runs whenever a new user signs up
 */
export const onAuthUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    // Set default 'user' role for all new users
    await admin.auth().setCustomUserClaims(user.uid, { role: 'user' });
    console.log(`Set default 'user' role for new user: ${user.uid}`);
  } catch (error) {
    console.error(`Error setting default role for user ${user.uid}:`, error);
  }
});

/**
 * Create a new user (admin only)
 * Creates an unverified user with phone number and display name
 */
export const createUser = functions.https.onCall(async (data, context) => {
  // Check if request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function'
    );
  }

  // Check if the caller is an admin
  const callerRole = context.auth.token.role;
  if (callerRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can create users'
    );
  }

  // Validate input
  const { phoneNumber, displayName } = data;
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Phone number is required');
  }

  if (!displayName || typeof displayName !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Display name is required');
  }

  try {
    // Create user in Firebase Auth (unverified)
    const userRecord = await admin.auth().createUser({
      phoneNumber,
      displayName,
    });

    // Set default 'user' role via custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });

    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      phoneNumber,
      displayName,
      email: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Also create public profile (for displaying leader names)
    await admin.firestore().collection('publicProfiles').doc(userRecord.uid).set({
      uid: userRecord.uid,
      displayName,
    });

    return {
      success: true,
      message: `Successfully created user ${displayName}`,
      uid: userRecord.uid,
    };
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'auth/phone-number-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Phone number already exists');
    }
    throw new functions.https.HttpsError('internal', 'Failed to create user');
  }
});

/**
 * Delete a user (admin only)
 * Deletes user from both Firebase Auth and Firestore
 */
export const deleteUser = functions.https.onCall(async (data, context) => {
  // Check if request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function'
    );
  }

  // Check if the caller is an admin
  const callerRole = context.auth.token.role;
  if (callerRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can delete users'
    );
  }

  // Validate input
  const { uid } = data;
  if (!uid || typeof uid !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'User ID is required');
  }

  // Prevent admin from deleting themselves
  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'You cannot delete your own account'
    );
  }

  try {
    // Delete from Firestore first (both private and public profiles)
    await admin.firestore().collection('users').doc(uid).delete();
    await admin.firestore().collection('publicProfiles').doc(uid).delete();

    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);

    return {
      success: true,
      message: `Successfully deleted user ${uid}`,
    };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.code === 'auth/user-not-found') {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    throw new functions.https.HttpsError('internal', 'Failed to delete user');
  }
});

/**
 * Get all users with their custom claims
 * Only callable by admins
 */
export const getAllUsersWithRoles = functions.https.onCall(async (data, context) => {
  // Check if request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function'
    );
  }

  // Check if the caller is an admin
  const callerRole = context.auth.token.role;
  if (callerRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can view all users'
    );
  }

  try {
    // Get all users from Firebase Auth
    const listUsersResult = await admin.auth().listUsers();

    // Get corresponding Firestore documents for email/displayName
    const usersWithRoles = await Promise.all(
      listUsersResult.users.map(async (userRecord) => {
        // Get role from custom claims
        const customClaims = userRecord.customClaims || {};
        const role = (customClaims as any).role || 'user';

        // Get additional info from Firestore
        let firestoreData = null;
        try {
          const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
          firestoreData = userDoc.data();
        } catch (error) {
          console.error(`Error fetching Firestore data for user ${userRecord.uid}:`, error);
        }

        return {
          uid: userRecord.uid,
          phoneNumber: userRecord.phoneNumber || firestoreData?.phoneNumber || '',
          email: userRecord.email || firestoreData?.email || null,
          displayName: userRecord.displayName || firestoreData?.displayName || null,
          role,
          createdAt: firestoreData?.createdAt?.toDate()?.toISOString() || null,
          updatedAt: firestoreData?.updatedAt?.toDate()?.toISOString() || null,
        };
      })
    );

    // Sort by email
    usersWithRoles.sort((a, b) => {
      const emailA = a.email || '';
      const emailB = b.email || '';
      return emailA.localeCompare(emailB);
    });

    return { users: usersWithRoles };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch users');
  }
});
