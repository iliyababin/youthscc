# Getting Started with YouthSCC

Complete setup guide from installation to first admin user.

## 📋 Prerequisites

- Node.js installed
- Firebase account
- Basic knowledge of React/Next.js

## 🚀 Installation

```bash
cd youthscc
npm install
```

## 🔥 Firebase Setup

### 1. Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/project/scc-cg/authentication/providers)
2. Click **Email/Password**
3. Toggle **Enable** to ON
4. Click **Save**

### 2. Update Firestore Security Rules

**This is REQUIRED or signup will fail!**

1. Go to [Firestore Rules](https://console.firebase.google.com/project/scc-cg/firestore/rules)
2. **Delete all existing rules**
3. Paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Bible study groups - public read, admins only can create/delete
    match /biblestudygroups/{bibleStudyGroupId} {
      allow read: if true; // Public read access
      allow create, update, delete: if isAdmin();
    }

    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId)
        && request.resource.data.role == resource.data.role;
      allow update, delete: if isAdmin();
    }
  }
}
```

4. Click **Publish**

## 🎯 First Run

```bash
npm run dev
```

Open http://localhost:3000

## 👤 Create Your Admin Account

### Step 1: Sign Up

1. Click "Create Account"
2. Enter your email and password
3. Submit

### Step 2: Make Yourself Admin

1. Go to [Firestore Data](https://console.firebase.google.com/project/scc-cg/firestore/data)
2. Click `users` collection
3. Find your user document (search by email)
4. Click to edit
5. Change `role` from `"user"` to `"admin"`
6. Click Save
7. **Refresh your app**

### Step 3: Verify

- You should now see the "Create Bible Study Group" form
- Delete buttons should appear on bible study groups
- Regular users won't see these

## ✅ Verification Checklist

- [ ] Firebase Auth enabled
- [ ] Firestore rules published
- [ ] Can create an account
- [ ] Made yourself admin
- [ ] Can create bible study groups
- [ ] Can delete bible study groups

## 🐛 Troubleshooting

### "Missing or insufficient permissions" on signup
→ Update Firestore rules (see Step 2 above)

### "Operation not allowed"
→ Enable Email/Password auth (see Step 1 above)

### Can't see create form after making admin
→ Refresh the page (Ctrl+R or Cmd+R)

### Still showing "Admin Access Required"
→ Check Firestore - make sure role is exactly `"admin"` (lowercase)

## 📚 Next Steps

- Read [FEATURES.md](FEATURES.md) to learn about bible study groups, auth, and roles
- Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand the codebase
- Add more admins as needed

## 🔐 Security Notes

- **Bible study groups are publicly viewable** - No authentication required
- Default role for new users is `"user"`
- Only admins can create/delete bible study groups
- Firestore rules enforce this on the backend
- UI hides admin actions from regular users and unauthenticated visitors

---

**That's it! You're ready to start managing bible study groups.** 🎉
