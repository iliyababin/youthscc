# YouthSCC

Church bible study group management system with Firebase, authentication, and role-based permissions.

## ✨ Features

- 📱 **Mobile-first responsive design**
- 🔐 **Email/password authentication**
- 👥 **Role-based access control** (Admin/User)
- 📋 **Bible study groups management** with leaders
- ⚡ **Real-time synchronization** across all clients
- 🔒 **Secure Firestore rules**
- 📘 **Full TypeScript support**

## 🚀 Quick Start

```bash
# Install
npm install

# Run
npm run dev
```

**Then:** Follow [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) to set up Firebase

## 📚 Documentation

- **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Complete setup guide ⭐ START HERE
- **[docs/FEATURES.md](docs/FEATURES.md)** - How to use bible study groups, auth, and roles
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Project structure and patterns

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Firebase** - Auth, Firestore, real-time sync
- **TanStack Query** - Data fetching and caching
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling

## 🎯 Common Tasks

**Set up Firebase:**
→ [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)

**Make someone admin:**
→ [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md#step-2-make-yourself-admin)

**Use bible study group hooks:**
→ [docs/FEATURES.md](docs/FEATURES.md#-cell-groups)

**Understand the code:**
→ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 📦 Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 🔐 Security

- **Public access** to view bible study groups
- **Authentication required** for creating accounts and admin features
- **Role-based permissions** (admin/user)
- **Firestore security rules** enforce access control
- **Default role:** New users are `"user"` (view-only)
- **Admin role:** Can create/delete bible study groups

See [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) for setup instructions.

## 📱 Routes

- `/` - Home page
- `/auth/login` - Login
- `/auth/signup` - Sign up
- `/biblestudygroups` - View bible study groups (public access)

## 🤝 Contributing

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for project structure and patterns.

## 📄 License

MIT
