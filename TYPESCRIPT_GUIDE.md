# TypeScript Guide for MatchApp

## Overview
This guide explains all TypeScript concepts, patterns, and interfaces used in the MatchApp project. It's designed to help you understand both the TypeScript syntax and why specific type decisions were made.

## Table of Contents
1. [Basic TypeScript Concepts Used](#basic-typescript-concepts-used)
2. [Interface Definitions](#interface-definitions)
3. [Type Patterns & Utilities](#type-patterns--utilities)
4. [Component Typing](#component-typing)
5. [API & Database Typing](#api--database-typing)
6. [Advanced TypeScript Features](#advanced-typescript-features)
7. [Common Patterns Explained](#common-patterns-explained)

## Basic TypeScript Concepts Used

### 1. Interface vs Type Aliases
```typescript
// Interface (used for object shapes) - PREFERRED in this project
interface UserProfile {
  _id: string;
  name: string;
  email: string;
}

// Type alias (used for unions, primitives)
type ActionType = 'like' | 'reject' | 'skip';
type LoadingState = boolean;
```

**When to use which:**
- **Interface**: For object structures, can be extended
- **Type**: For unions, computed types, primitives

### 2. Optional Properties
```typescript
interface UserProfile {
  _id: string;           // Required field
  name: string;          // Required field
  image?: string;        // Optional field (may be undefined)
  profile?: {            // Optional nested object
    university?: string; // Optional within optional
    year?: number;
  };
}
```

**The `?` operator means:**
- Field may or may not exist
- TypeScript won't complain if it's undefined
- Must check existence before using: `user.image && <img src={user.image} />`

### 3. Array Typing
```typescript
interface UserProfile {
  interests?: string[];  // Array of strings
}

// Usage examples
const interests: string[] = ['coding', 'music'];
const users: UserProfile[] = [user1, user2, user3];
```

## Interface Definitions

### Core User Interface
```typescript
// From /src/app/profile/page.tsx
interface UserProfile {
  _id: string;              // MongoDB ObjectId as string
  email: string;            // User's email (unique identifier)
  name: string;             // Display name
  image?: string;           // Profile picture (base64 encoded)
  isStudent: boolean;       // Account type flag
  profile?: {               // Nested profile object
    university?: string;    // School name
    year?: number;          // 1-6 (Freshman to PhD)
    major?: string;         // Field of study
    interests?: string[];   // Array of interest tags
    bio?: string;          // Personal description
  };
  createdAt: string;        // ISO date string
  lastActive?: string;      // ISO date string
}
```

**Why this structure?**
- **Flat + Nested**: Main fields flat for easy access, related fields grouped
- **Optional Profile**: Users can sign up without completing profile
- **String IDs**: MongoDB ObjectIds converted to strings for JSON serialization
- **Date Strings**: Dates serialized as ISO strings over the network

### Database Model Interfaces
```typescript
// From /src/models/User.ts
import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  googleId?: string;        // For OAuth users
  password?: string;        // Hashed password (excluded from queries)
  isStudent: boolean;
  profile?: {
    university?: string;
    year?: number;
    major?: string;
    interests?: string[];
    bio?: string;
  };
  isActive: boolean;
  lastActive?: Date;        // Note: Date object, not string
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Differences from Client Interface:**
- **Extends Document**: Mongoose adds `_id`, `save()`, etc.
- **Date Objects**: Server uses Date objects, client gets strings
- **Password Field**: Exists in DB but excluded from API responses
- **Google ID**: OAuth-specific field

### Match System Interface
```typescript
// From /src/models/Match.ts
export interface IMatch extends Document {
  userId: string;           // Who performed the action
  targetUserId: string;     // Who was acted upon
  action: 'like' | 'reject' | 'skip';  // Union type (only these 3 values)
  createdAt: Date;
}
```

**Union Types Explained:**
```typescript
type Action = 'like' | 'reject' | 'skip';

// TypeScript ensures only valid values
const validAction: Action = 'like';     // ✅ Valid
const invalidAction: Action = 'maybe';  // ❌ TypeScript error
```

## Type Patterns & Utilities

### 1. State Typing in React Components
```typescript
const [user, setUser] = useState<UserProfile | null>(null);
//                              ^^^^^^^^^^^^^^^^^^^^^^
//                              Type annotation for state

const [loading, setLoading] = useState<boolean>(true);
//                                    ^^^^^^^^^
//                                    Often optional (inferred)

const [formData, setFormData] = useState<{
  name: string;
  image: string;
  profile: {
    university: string;
    year: number | undefined;  // Can be undefined
    major: string;
    interests: string[];
    bio: string;
  }
}>({
  name: '',
  image: '',
  profile: {
    university: '',
    year: undefined,
    major: '',
    interests: [],
    bio: ''
  }
});
```

### 2. Event Handler Typing
```typescript
// File input handler
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];  // Optional chaining
  //                           ^
  //                           files might be null
};

// Form submission
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
};

// Button click
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // Button-specific mouse event
};

// Generic click (works for any element)
const handleGenericClick = (event: React.MouseEvent) => {
  // Generic mouse event
};
```

### 3. Ref Typing
```typescript
const fileInputRef = useRef<HTMLInputElement>(null);
//                         ^^^^^^^^^^^^^^^^^^
//                         Specifies element type

const universityRef = useRef<HTMLDivElement>(null);

// Usage with type safety
const clickFileInput = () => {
  fileInputRef.current?.click();  // Optional chaining (might be null)
};
```

### 4. Function Parameter Typing
```typescript
// Simple function
const selectUniversity = (university: string) => {
  setUniversitySearch(university);
};

// Function with multiple parameters
const handleAction = async (action: 'like' | 'reject' | 'skip') => {
  // Action is constrained to only these 3 values
};

// Function returning Promise
const fetchProfile = async (): Promise<void> => {
  // Explicitly returns Promise<void>
};

// Function returning data
const getFilteredUsers = (search: string): UserProfile[] => {
  return users.filter(user => user.name.includes(search));
};
```

## Component Typing

### 1. Props Interface
```typescript
// If this component accepted props
interface ProfilePageProps {
  initialUser?: UserProfile;     // Optional prop
  onSave: (user: UserProfile) => void;  // Function prop
  theme: 'light' | 'dark';      // Limited string values
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  initialUser, 
  onSave, 
  theme 
}) => {
  // Component implementation
};
```

### 2. Children Typing
```typescript
interface LayoutProps {
  children: React.ReactNode;     // Any valid React content
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
};
```

### 3. Hook Return Types
```typescript
// Custom hook with typed return
const useProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  return {
    user,        // TypeScript infers: UserProfile | null
    setUser,     // TypeScript infers: Dispatch<SetStateAction<UserProfile | null>>
    loading,     // TypeScript infers: boolean
    setLoading   // TypeScript infers: Dispatch<SetStateAction<boolean>>
  };
};

// Using the hook
const { user, loading } = useProfile();
// TypeScript knows user is UserProfile | null
// TypeScript knows loading is boolean
```

## API & Database Typing

### 1. API Response Types
```typescript
// API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Specific API responses
type ProfileResponse = ApiResponse<{ user: UserProfile }>;
type DiscoverResponse = ApiResponse<{ users: UserProfile[] }>;
type MatchResponse = ApiResponse<{ isMatch: boolean; message: string }>;

// Usage in fetch calls
const response = await fetch('/api/profile');
const data: ProfileResponse = await response.json();

if (data.success && data.data) {
  const user = data.data.user;  // TypeScript knows this is UserProfile
}
```

### 2. Next.js API Route Typing
```typescript
import { NextRequest, NextResponse } from 'next/server';

// GET handler
export async function GET(): Promise<NextResponse> {
  //                         ^^^^^^^^^^^^^^^^^^^^^^^
  //                         Return type is Promise<NextResponse>
  
  const users = await User.find().lean();
  return NextResponse.json({ users });
}

// POST handler with request body
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { targetUserId, action }: { targetUserId: string; action: string } = body;
  //      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //      Destructuring with type annotation
  
  return NextResponse.json({ success: true });
}
```

### 3. Mongoose Model Typing
```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for the document
export interface IUser extends Document {
  email: string;
  name: string;
  // ... other fields
}

// Schema with typing
const userSchema = new Schema<IUser>({
  //                        ^^^^^^
  //                        Generic type parameter
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// Model with typing
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
//          ^^^^^^^^^^^^                                          ^^^^^^
//          Model that works with IUser documents                 Generic type
```

## Advanced TypeScript Features

### 1. Generic Types
```typescript
// Generic function
function createArray<T>(items: T[]): T[] {
  return [...items];
}

const stringArray = createArray(['a', 'b', 'c']);  // TypeScript infers T = string
const numberArray = createArray([1, 2, 3]);        // TypeScript infers T = number
```

### 2. Union Types
```typescript
// Union type for action
type Action = 'like' | 'reject' | 'skip';

// Union type for loading states
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Union type for user types
type UserType = 'student' | 'teacher' | 'admin';

// Function that accepts union type
const handleAction = (action: Action) => {
  switch (action) {
    case 'like':     // TypeScript knows this is valid
      // Handle like
      break;
    case 'reject':   // TypeScript knows this is valid
      // Handle reject
      break;
    case 'skip':     // TypeScript knows this is valid
      // Handle skip
      break;
    // TypeScript would complain if we missed a case
  }
};
```

### 3. Optional Chaining & Nullish Coalescing
```typescript
// Optional chaining (?.)
const universityName = user?.profile?.university;  // string | undefined
//                          ^        ^
//                          Safe navigation

// Array optional chaining
const firstInterest = user?.profile?.interests?.[0];

// Function optional chaining
fileInputRef.current?.click();

// Nullish coalescing (??)
const displayName = user?.name ?? 'Anonymous';     // Default if null/undefined
const interestCount = user?.profile?.interests?.length ?? 0;
```

### 4. Type Assertions
```typescript
// Type assertion (use sparingly!)
const userId = (currentUser._id as any).toString();
//             ^^^^^^^^^^^^^^^^^^
//             Telling TypeScript to treat as 'any'

// Better approach with type guard
const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

if (isString(someValue)) {
  // TypeScript now knows someValue is string
  console.log(someValue.toUpperCase());
}
```

### 5. Utility Types
```typescript
// Pick - Create type with subset of properties
type UserBasicInfo = Pick<UserProfile, '_id' | 'name' | 'email'>;

// Omit - Create type excluding certain properties
type UserWithoutId = Omit<UserProfile, '_id'>;

// Partial - Make all properties optional
type PartialUser = Partial<UserProfile>;

// Required - Make all properties required
type RequiredUser = Required<UserProfile>;
```

## Common Patterns Explained

### 1. State with Initial Values
```typescript
// Instead of this (type assertion)
const [formData, setFormData] = useState({} as FormData);

// Do this (proper initial state)
const [formData, setFormData] = useState<FormData>({
  name: '',
  image: '',
  profile: {
    university: '',
    year: undefined,
    major: '',
    interests: [],
    bio: ''
  }
});
```

### 2. Async Function Typing
```typescript
// Async function that returns void
const fetchUsers = async (): Promise<void> => {
  try {
    const response = await fetch('/api/discover');
    const data = await response.json();
    setUsers(data.users);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Async function that returns data
const getUser = async (id: string): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
};
```

### 3. Event Handler Patterns
```typescript
// Input change handler
const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = event.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Select change handler
const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const value = parseInt(event.target.value) || undefined;
  setFormData(prev => ({
    ...prev,
    profile: {
      ...prev.profile,
      year: value
    }
  }));
};
```

### 4. Conditional Rendering Types
```typescript
// Component that might render nothing
const ConditionalComponent: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;  // Valid React component return
  
  return <div>Shown</div>;
};

// Component with conditional content
const UserInfo: React.FC<{ user: UserProfile | null }> = ({ user }) => {
  return (
    <div>
      {user ? (                    // Type narrowing
        <span>{user.name}</span>   // TypeScript knows user is UserProfile
      ) : (
        <span>Loading...</span>
      )}
    </div>
  );
};
```

## TypeScript Benefits in This Project

### 1. Catch Errors Early
```typescript
// TypeScript catches this at compile time
const user: UserProfile = {
  _id: '123',
  name: 'John',
  // Missing required 'email' field - TypeScript error!
};

// TypeScript catches this too
user.profile.university = 'MIT';  // Error: profile might be undefined
user.profile?.university = 'MIT'; // Fixed with optional chaining
```

### 2. IntelliSense & Autocomplete
- When you type `user.`, your editor shows all available properties
- When you type `user.profile?.`, editor shows nested properties
- Function parameters show expected types as you type

### 3. Refactoring Safety
- If you change an interface, TypeScript shows all places that need updates
- Renaming fields automatically updates all references
- Adding required fields shows everywhere that needs the new field

### 4. API Contract Enforcement
```typescript
// If API changes, TypeScript catches mismatches
interface ApiUser {
  id: string;        // Changed from _id
  name: string;
  email: string;
}

// All code using old _id property will show TypeScript errors
// Guides you to update everything consistently
```

## Best Practices Used

1. **Interface over Type**: Use interfaces for object shapes
2. **Optional Chaining**: Use `?.` instead of manual null checks
3. **Proper State Initialization**: Always provide complete initial state
4. **Union Types**: Use unions for limited string values
5. **Generic APIs**: Use generics for reusable API response types
6. **Type Guards**: Check types at runtime when needed
7. **Avoid `any`**: Use specific types or `unknown` instead

This TypeScript setup provides safety without being overly complex, making the codebase maintainable and easier to understand!