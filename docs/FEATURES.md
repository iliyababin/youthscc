# Features Guide

Complete guide to using bible study groups, authentication, and roles.

## 📦 Bible Study Groups

View and manage church bible study groups with leaders and real-time sync.

**Public Access:** Anyone can view bible study groups without authentication.
**Admin Only:** Creating, updating, and deleting bible study groups requires admin role.

### Using Bible Study Group Hooks

```typescript
import {
  useCellGroups,
  useCellGroup,
  useCreateCellGroup,
  useUpdateCellGroup,
  useDeleteCellGroup,
} from '@/lib/firebase/hooks';
```

### Fetch All Bible Study Groups

```typescript
function MyComponent() {
  const query = useCellGroups();

  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Error: {query.error.message}</div>;

  const cellGroups = query.data?.docs.map(doc => doc.data()) || [];

  return (
    <ul>
      {cellGroups.map(group => (
        <li key={group.id}>{group.name}</li>
      ))}
    </ul>
  );
}
```

### Create Bible Study Group (Admin Only)

Cell group creation includes a user search feature to add registered users as leaders:

```typescript
function CreateForm() {
  const createCellGroup = useCreateCellGroup();

  const handleSubmit = async () => {
    await createCellGroup.mutateAsync({
      name: 'Youth Group',
      leaders: [
        { id: 'user_uid', name: 'John Doe', email: 'john@example.com' }
      ],
    });
  };

  return <button onClick={handleSubmit}>Create</button>;
}
```

**Leader Selection:**
- Search bar allows searching registered users by name or email
- Only existing users can be added as leaders
- Search results appear in a scrollable list below the search bar
- Click on a user to add them as a leader
- Leaders use the user's Firebase Auth UID as their ID

### Delete Bible Study Group (Admin Only)

```typescript
function DeleteButton({ id }: { id: string }) {
  const deleteCellGroup = useDeleteCellGroup();

  const handleDelete = async () => {
    if (confirm('Delete this group?')) {
      await deleteCellGroup.mutateAsync(id);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### Real-time Updates

All hooks use `subscribed: true` for automatic real-time synchronization. Changes appear instantly across all clients.

---

## 🔐 Authentication

Email/password authentication with persistent sessions.

### Using Auth Hook

```typescript
import { useAuth } from '@/contexts';

function MyComponent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <LoginButton />;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Login

```typescript
const { login } = useAuth();

await login({
  email: 'user@example.com',
  password: 'password123',
});
```

### Signup

```typescript
const { signup } = useAuth();

await signup({
  email: 'user@example.com',
  password: 'password123',
  displayName: 'John Doe', // Optional
});
```

### Protected Routes

Use `ProtectedRoute` for pages that require authentication:

```typescript
import { ProtectedRoute } from '@/components/auth';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <div>Only authenticated users see this</div>
    </ProtectedRoute>
  );
}
```

**Note:** The `/biblestudygroups` page is publicly accessible and doesn't use `ProtectedRoute`.

### Access User Info

```typescript
const { user } = useAuth();

console.log(user?.email);
console.log(user?.displayName);
console.log(user?.uid);
console.log(user?.emailVerified);
```

---

## 👥 Roles & Permissions

Role-based access control for managing who can do what.

### User Roles

- **Admin** - Can create/update/delete bible study groups
- **User** (default) - Can only view bible study groups

### Check User Role

```typescript
import { useUserRole } from '@/hooks';

function MyComponent() {
  const { role, isAdmin, permissions, loading } = useUserRole();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Your role: {role}</p>
      {isAdmin && <p>You're an admin!</p>}
      {permissions.canCreateCellGroups && <CreateButton />}
    </div>
  );
}
```

### Available Permissions

```typescript
permissions.canCreateCellGroups   // Admin: true, User: false
permissions.canUpdateCellGroups   // Admin: true, User: false
permissions.canDeleteCellGroups   // Admin: true, User: false
permissions.canManageUsers        // Admin: true, User: false
```

### Making Users Admin

**Method 1: Firebase Console**
1. Go to [Firestore Data](https://console.firebase.google.com/project/scc-cg/firestore/data)
2. Navigate to `users` collection
3. Find user by email
4. Edit document
5. Change `role` to `"admin"`
6. Save

**Method 2: Programmatically**
```typescript
import { updateUserRole } from '@/lib/firebase/userService';

// Must be called by an admin
await updateUserRole(userId, 'admin');
```

---

## 🎨 UI Components

Pre-built components for common tasks.

### Bible Study Group List

```typescript
import { CellGroupList } from '@/components/biblestudygroups';

<CellGroupList />
```

Shows all bible study groups with delete buttons (admin only).

### Create Bible Study Group Form

```typescript
import { CreateCellGroupForm } from '@/components/biblestudygroups';

<CreateCellGroupForm />
```

Shows form for admins, "Admin Access Required" for users.

### User Menu

```typescript
import { UserMenu } from '@/components/auth';

<UserMenu />
```

Dropdown with user info and logout button.

### Login/Signup Forms

```typescript
import { LoginForm, SignupForm } from '@/components/auth';

<LoginForm />
<SignupForm />
```

---

## 🔄 Real-time Sync

All data updates in real-time across all connected clients:

1. Admin creates a bible study group
2. All users see it instantly
3. Admin deletes a bible study group
4. Removed from all screens immediately

Powered by Firestore real-time listeners and TanStack Query.

---

## 🚀 Common Patterns

### Conditional Rendering Based on Role

```typescript
const { permissions } = useUserRole();

return (
  <div>
    {permissions.canCreateCellGroups ? (
      <CreateCellGroupForm />
    ) : (
      <p>Admin access required</p>
    )}
  </div>
);
```

### Show Different Content for Admins

```typescript
const { isAdmin } = useUserRole();

return (
  <div>
    <h1>Bible Study Groups</h1>
    {isAdmin && <button>Export Data</button>}
  </div>
);
```

### Combining Auth and Roles

```typescript
const { user } = useAuth();
const { isAdmin } = useUserRole();

if (!user) return <LoginPage />;
if (!isAdmin) return <AccessDenied />;

return <AdminPanel />;
```

---

## 📝 Data Types

### CellGroup

```typescript
interface CellGroup {
  id: string;
  name: string;
  leaders: Leader[];
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Leader

```typescript
interface Leader {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}
```

### UserProfile

```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
```

---

That's everything you need to know to use the features! Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand how it's built.
