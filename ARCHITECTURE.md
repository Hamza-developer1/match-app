# Campus Connect Architecture Documentation

## Overview
Campus Connect is a student networking platform built with Next.js 13+ (App Router), MongoDB, and NextAuth.js. It allows college students to discover study buddies based on shared interests and academic information.

## Tech Stack
- **Frontend**: Next.js 13+ with App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js (supports Google OAuth + email/password)
- **Styling**: Tailwind CSS with custom gradients and animations

## Project Structure

```
src/
├── app/                    # Next.js 13 App Router
│   ├── api/               # API Routes (Backend)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── profile/       # User profile CRUD
│   │   └── discover/      # User discovery & matching
│   ├── auth/              # Authentication pages
│   ├── profile/           # User profile page
│   ├── discover/          # Study buddy discovery page
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # Database connection
│   └── email.ts          # Email utilities
├── models/               # MongoDB schemas
│   ├── User.ts          # User data model
│   ├── Match.ts         # User interactions model
│   └── PasswordReset.ts # Password reset tokens
└── data/                # Static data
    ├── universities.ts  # US universities list
    └── majors.ts       # College majors list
```

## Core Features

### 1. Authentication System
- **Email/Password** + **Google OAuth**
- **Password Reset** functionality
- **Session Management** with JWT tokens

### 2. User Profiles
- **Personal Info**: Name, email, profile picture
- **Academic Info**: University, major, graduation year
- **Interests**: Customizable tags
- **Bio**: Personal description

### 3. Discovery System
- **Smart Filtering**: Shows relevant profiles only
- **Three Actions**: Connect ✅, Reject ❌, Skip ⏭️
- **Match Detection**: Notifies when mutual likes occur
- **Persistence**: Remembers user decisions

## Database Schema

### User Model (`/src/models/User.ts`)
```typescript
{
  email: string (unique, required)
  name: string (required)
  image?: string (profile picture as base64)
  googleId?: string (for OAuth users)
  password?: string (hashed, for email users)
  isStudent: boolean (default: true)
  profile?: {
    university?: string
    year?: number (1-6: Freshman to PhD)
    major?: string
    interests?: string[]
    bio?: string (max 500 chars)
  }
  isActive: boolean (default: true)
  lastActive?: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Match Model (`/src/models/Match.ts`)
```typescript
{
  userId: string (who performed the action)
  targetUserId: string (who was acted upon)
  action: 'like' | 'reject' | 'skip'
  createdAt: Date (auto)
}
```

**Key Constraints:**
- Unique compound index on `(userId, targetUserId)` prevents duplicate actions
- Skip actions are NOT stored permanently (temporary only)

## API Endpoints

### Authentication (`/src/app/api/auth/`)
- `POST /api/auth/register` - Create new account
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Complete password reset

### Profile Management (`/src/app/api/profile/`)
- `GET /api/profile` - Fetch current user's profile
- `PUT /api/profile` - Update profile information

### Discovery System (`/src/app/api/discover/`)
- `GET /api/discover` - Fetch potential study buddies
- `POST /api/discover` - Record user action (like/reject/skip)

## Key Components

### 1. Home Page (`/src/app/page.tsx`)
**Purpose**: Landing page with authentication status
**Features**:
- Shows different content for authenticated vs. guest users
- "Find Study Buddies" and "View Profile" buttons for logged-in users
- Responsive hero section with animated elements

### 2. Profile Page (`/src/app/profile/page.tsx`)
**Purpose**: View and edit user profile
**Key Features**:
- **Edit Mode Toggle**: Switch between view and edit modes
- **Image Upload**: Profile picture with preview and validation
- **Searchable Dropdowns**: University and major selection from comprehensive lists
- **Dynamic Interests**: Add/remove interest tags
- **Form Validation**: Client-side validation with character limits

**State Management**:
```typescript
const [user, setUser] = useState<UserProfile | null>(null)
const [editing, setEditing] = useState(false)
const [formData, setFormData] = useState({...})
const [imagePreview, setImagePreview] = useState<string | null>(null)
const [universitySearch, setUniversitySearch] = useState('')
// ... dropdown states
```

### 3. Discovery Page (`/src/app/discover/page.tsx`)
**Purpose**: Browse and interact with other student profiles
**Key Features**:
- **Card-based UI**: Tinder-style profile cards
- **Three Action System**: Like, Reject, Skip buttons
- **Match Notifications**: Shows "It's a match!" messages
- **Auto-pagination**: Loads more profiles automatically

**State Management**:
```typescript
const [users, setUsers] = useState<UserProfile[]>([])
const [currentIndex, setCurrentIndex] = useState(0)
const [actionLoading, setActionLoading] = useState(false)
const [matchMessage, setMatchMessage] = useState('')
```

## Data Flow Examples

### 1. User Registration Flow
```
1. User fills registration form → 
2. POST /api/auth/register → 
3. Hash password with bcrypt → 
4. Save to MongoDB → 
5. Redirect to sign-in page
```

### 2. Profile Discovery Flow
```
1. User clicks "Find Study Buddies" → 
2. GET /api/discover → 
3. Query MongoDB (exclude self + rejected/liked users) → 
4. Return array of potential matches → 
5. Display first profile card
```

### 3. Like Action Flow
```
1. User clicks ✅ button → 
2. POST /api/discover { targetUserId, action: 'like' } → 
3. Save Match record to MongoDB → 
4. Check for reciprocal like → 
5. Return { isMatch: boolean } → 
6. Show match notification if mutual
```

## Security Considerations

### Authentication
- Passwords hashed with **bcrypt** (salt rounds: 12)
- JWT tokens for session management
- Server-side session validation on protected routes

### API Security
- All profile/discovery endpoints require authentication
- User can only modify their own profile
- MongoDB injection protection through Mongoose

### Data Validation
- Client-side: Form validation, file type/size limits
- Server-side: Schema validation through Mongoose
- Image upload: 5MB limit, image type validation

## Performance Optimizations

### Database
- **Indexes**: Compound index on Match model prevents duplicates
- **Lean Queries**: Use `.lean()` for read-only data
- **Selective Fields**: Exclude password field from user queries

### Frontend
- **Image Optimization**: Base64 encoding for profile pictures
- **Lazy Loading**: Components render after client-side hydration
- **Tailwind CSS**: Utility-first CSS for smaller bundle size

### API
- **Serverless Functions**: Next.js API routes auto-scale
- **Connection Pooling**: MongoDB connection reuse
- **Limited Results**: Discovery API returns max 10 profiles per request

## Environment Variables
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb://your-connection-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Development Workflow

### Adding New Features
1. **Database**: Create/modify Mongoose models in `/src/models/`
2. **API**: Add endpoints in `/src/app/api/[feature]/`
3. **Frontend**: Create pages in `/src/app/[feature]/`
4. **Types**: Define TypeScript interfaces
5. **Styling**: Use Tailwind classes for consistency

### Common Patterns
- **API Structure**: Always return `{ success, data, error }` format
- **Error Handling**: Try-catch blocks with proper HTTP status codes
- **State Management**: React hooks with TypeScript interfaces
- **Styling**: Consistent gradient themes and rounded corners

This architecture provides a scalable foundation for expanding the platform with additional features like messaging, group study sessions, or advanced matching algorithms.