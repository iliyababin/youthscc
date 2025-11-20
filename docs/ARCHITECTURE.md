# Project Architecture

## Overview

This project follows a clean architecture pattern with clear separation of concerns for maintainability and scalability.

## Project Structure

```
youthscc/
├── app/                          # Next.js App Router pages
│   ├── biblestudygroups/              # Bible study groups feature pages
│   │   └── page.tsx             # Bible study groups management page
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── biblestudygroups/              # Cell group specific components
│   │   ├── CellGroupList.tsx    # List view component
│   │   ├── CreateCellGroupForm.tsx # Form component
│   │   └── index.ts             # Barrel export
│   └── providers/               # React context providers
│       └── query-provider.tsx   # TanStack Query provider
├── lib/                         # Library code and utilities
│   ├── firebase/                # Firebase related code
│   │   ├── collections.ts       # Firestore collection references
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useCellGroups.ts # Cell group CRUD hooks
│   │   │   └── index.ts         # Barrel export
│   │   └── index.ts             # Barrel export
│   ├── firebase.ts              # Firebase initialization
│   └── utils.ts                 # Utility functions (shadcn)
└── types/                       # TypeScript type definitions
    ├── cellgroup.ts             # Cell group types
    └── index.ts                 # Barrel export
```

## Layer Responsibilities

### 1. Types Layer (`/types`)
- Contains all TypeScript interfaces and types
- Shared across the entire application
- No dependencies on other layers

### 2. Library Layer (`/lib`)
- **Firebase Configuration**: Initialize Firebase services
- **Collection References**: Typed Firestore collection references with converters
- **Hooks**: Custom React hooks for data operations
- Provides clean API for components to interact with Firebase

### 3. Components Layer (`/components`)
- Presentational and container components
- Organized by feature (e.g., `biblestudygroups/`)
- Uses hooks from the library layer
- No direct Firebase imports (goes through hooks)

### 4. App Layer (`/app`)
- Next.js pages and routing
- Composes components into full pages
- Minimal logic, mostly layout and composition

## Data Flow

```
User Interaction
    ↓
Component (e.g., CreateCellGroupForm)
    ↓
Custom Hook (e.g., useCreateCellGroup)
    ↓
TanStack Query Firebase
    ↓
Firestore Collection Reference (with converter)
    ↓
Firebase SDK
    ↓
Firestore Database
```

## Key Patterns

### 1. Firestore Data Converters
Convert between Firestore data and TypeScript types:
- Handle timestamp conversions
- Ensure type safety
- Located in `lib/firebase/collections.ts`

### 2. Custom Hooks
Encapsulate Firebase operations:
- `useCellGroups()` - Fetch all bible study groups with real-time updates
- `useCellGroup(id)` - Fetch single bible study group
- `useCreateCellGroup()` - Create mutation
- `useUpdateCellGroup()` - Update mutation
- `useDeleteCellGroup()` - Delete mutation

### 3. TanStack Query Integration
- Automatic caching and refetching
- Optimistic updates
- Real-time subscriptions via `subscribe: true`
- Query invalidation for cache management

### 4. Separation of Concerns
- **Types**: Pure data structures
- **Collections**: Firestore references and converters
- **Hooks**: Data fetching and mutations
- **Components**: UI and user interactions
- **Pages**: Layout and composition

## Adding New Features

To add a new Firestore collection (e.g., "members"):

1. **Create types** (`types/member.ts`):
```typescript
export interface Member {
  id: string;
  name: string;
  // ... other fields
}
```

2. **Add collection reference** (`lib/firebase/collections.ts`):
```typescript
const memberConverter: FirestoreDataConverter<Member> = { ... };
export const getMembersCollection = () => { ... };
```

3. **Create hooks** (`lib/firebase/hooks/useMembers.ts`):
```typescript
export function useMembers() { ... }
export function useCreateMember() { ... }
```

4. **Create components** (`components/members/`):
```typescript
export function MemberList() { ... }
```

5. **Create page** (`app/members/page.tsx`):
```typescript
export default function MembersPage() { ... }
```

## Best Practices

1. **Always use converters** for type safety
2. **Keep components pure** - business logic in hooks
3. **Use real-time subscriptions** for collaborative features
4. **Invalidate queries** after mutations
5. **Handle loading and error states** in components
6. **Export through index files** for clean imports
