# Feature Implementation Guide

## How Each Feature Works

### 1. User Authentication & Registration

#### What It Does
- Users can sign up with email/password or Google OAuth
- Secure login with session management
- Password reset functionality

#### Code Flow
```
User Registration:
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Registration    │───▶│ Hash Password│───▶│ Save to MongoDB │
│ Form Submitted  │    │ with bcrypt  │    │ Create User     │
└─────────────────┘    └──────────────┘    └─────────────────┘

User Login:
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Login Form      │───▶│ Verify       │───▶│ Create JWT      │
│ Submitted       │    │ Credentials  │    │ Session Token   │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

#### Key Files
- `/src/app/api/auth/register/route.ts` - Registration endpoint
- `/src/lib/auth.ts` - NextAuth configuration
- `/src/app/auth/signin/page.tsx` - Login page
- `/src/app/auth/signup/page.tsx` - Registration page

#### Security Features
- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **Input Validation**: Checks email format, password strength
- **Session Management**: JWT tokens with secure cookies
- **CSRF Protection**: Built into NextAuth.js

### 2. Profile Management System

#### What It Does
- Users can view and edit their complete profile
- Upload profile pictures with preview
- Search and select from comprehensive university/major lists
- Add/remove interests dynamically

#### Code Flow
```
Profile Loading:
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Page Load       │───▶│ GET /api/    │───▶│ Display Profile │
│ Check Session   │    │ profile      │    │ Data            │
└─────────────────┘    └──────────────┘    └─────────────────┘

Profile Editing:
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Edit Mode ON    │───▶│ Form         │───▶│ PUT /api/       │
│ Show Form       │    │ Validation   │    │ profile         │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

#### Key Features Breakdown

**Image Upload**
```typescript
// File validation
if (!file.type.startsWith('image/')) return
if (file.size > 5 * 1024 * 1024) return // 5MB limit

// Convert to base64
const reader = new FileReader()
reader.onload = (e) => {
  setImagePreview(e.target.result) // Show preview
  setFormData({...formData, image: result}) // Store in form
}
reader.readAsDataURL(file)
```

**Searchable Dropdowns**
```typescript
// Filter as user types
const filteredUniversities = US_UNIVERSITIES.filter(uni =>
  uni.toLowerCase().includes(search.toLowerCase())
).slice(0, 10) // Show top 10 matches

// Handle selection
const selectUniversity = (university) => {
  setFormData({...formData, profile: {...profile, university}})
  setShowDropdown(false)
}
```

**Dynamic Interests**
```typescript
// Add interest on Enter key
const addInterest = (interest) => {
  if (!interests.includes(interest.trim())) {
    setFormData({
      ...formData,
      profile: {
        ...profile,
        interests: [...interests, interest.trim()]
      }
    })
  }
}
```

### 3. Study Buddy Discovery System

#### What It Does
- Shows other student profiles in a Tinder-like interface
- Three actions: Connect ✅, Reject ❌, Skip ⏭️
- Detects mutual likes and shows match notifications
- Smart filtering prevents seeing same profiles repeatedly

#### Algorithm Logic
```
Discovery Algorithm:
1. Get current user ID
2. Find users they've LIKED or REJECTED (not skipped)
3. Exclude: Self + Previously acted upon users
4. Query remaining active students
5. Return up to 10 profiles
```

#### Action Types Explained

**Connect Action (✅)**
```typescript
// Store the like action
await Match.create({
  userId: currentUserId,
  targetUserId: targetId,
  action: 'like'
})

// Check if target user also liked current user
const reciprocalLike = await Match.findOne({
  userId: targetId,
  targetUserId: currentUserId,
  action: 'like'
})

if (reciprocalLike) {
  // IT'S A MATCH! 🎉
  return { isMatch: true, message: "It's a match! 🎉" }
}
```

**Reject Action (❌)**
```typescript
// Store rejection - user will never see this profile again
await Match.create({
  userId: currentUserId,
  targetUserId: targetId,
  action: 'reject'
})
// Profile permanently filtered out of future queries
```

**Skip Action (⏭️)**
```typescript
// NO database record created
// Profile can appear again in future sessions
// Just moves to next profile in current session
```

#### Code Flow
```
Discovery Flow:
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Load Discover   │───▶│ GET /api/    │───▶│ Show First      │
│ Page            │    │ discover     │    │ Profile Card    │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                                           │
         ▼                                           ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ User Clicks     │───▶│ POST /api/   │───▶│ Check for Match │
│ Action Button   │    │ discover     │    │ Update UI       │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

### 4. Data Management & Filtering

#### University & Major Data
```typescript
// Static data files with comprehensive lists
export const US_UNIVERSITIES = [
  "Harvard University",
  "Stanford University",
  "MIT",
  // ... 800+ universities
].sort()

export const COLLEGE_MAJORS = [
  "Computer Science",
  "Biology",
  "Psychology",
  // ... 200+ majors
].sort()
```

**Why Static Data?**
- **Performance**: No API calls needed for common data
- **Reliability**: Always available, no external dependencies
- **Searchability**: Client-side filtering is instant
- **Maintainability**: Easy to update and version control

#### Smart Filtering System
```typescript
const getDiscoverableUsers = async (currentUserId) => {
  // Find permanently excluded users (liked or rejected)
  const excludedIds = await Match.find({
    userId: currentUserId,
    action: { $in: ['like', 'reject'] } // Skip NOT included
  }).distinct('targetUserId')
  
  // Query for potential matches
  return await User.find({
    _id: { 
      $nin: [currentUserId, ...excludedIds] // Exclude self + interacted
    },
    isActive: true,
    isStudent: true
  }).limit(10)
}
```

### 5. Real-time Features & UX

#### Match Notifications
```typescript
const [matchMessage, setMatchMessage] = useState('')

// Show match notification
if (data.isMatch) {
  setMatchMessage("It's a match! 🎉")
  setTimeout(() => setMatchMessage(''), 3000) // Auto-hide after 3s
}

// Render notification
{matchMessage && (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
      {matchMessage}
    </div>
  </div>
)}
```

#### Loading States
```typescript
const [actionLoading, setActionLoading] = useState(false)

const handleAction = async (action) => {
  setActionLoading(true) // Disable buttons
  try {
    await performAction(action)
  } finally {
    setActionLoading(false) // Re-enable buttons
  }
}

// Render with disabled state
<button 
  disabled={actionLoading}
  className={`${actionLoading ? 'opacity-50' : 'hover:scale-105'}`}
>
  {actionLoading ? 'Processing...' : 'Like'}
</button>
```

#### Hydration Issues Prevention
```typescript
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true) // Set after client-side hydration
}, [])

if (!mounted) {
  return <LoadingSpinner /> // Prevent SSR/client mismatch
}
```

### 6. Database Optimization

#### Indexing Strategy
```typescript
// User model indexes
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ isActive: 1, isStudent: 1 }) // For discovery queries

// Match model indexes
matchSchema.index({ userId: 1, targetUserId: 1 }, { unique: true })
matchSchema.index({ userId: 1, action: 1 }) // For filtering queries
```

#### Query Optimization
```typescript
// Use lean() for read-only queries (faster)
const users = await User.find(query).select('-password').lean()

// Use distinct() to get unique values efficiently
const interactedIds = await Match.find(query).distinct('targetUserId')

// Limit results to prevent large responses
const results = await User.find(query).limit(10)
```

## Feature Extension Ideas

### 1. Messaging System
**Implementation Approach:**
- Create Message model with sender/receiver fields
- Add real-time updates with WebSocket or Server-Sent Events
- Only allow messaging between matched users

### 2. Group Study Sessions
**Implementation Approach:**
- Create StudySession model with topic, time, location
- Allow users to create and join sessions
- Filter by university, major, or interests

### 3. Advanced Matching Algorithm
**Implementation Approach:**
- Calculate compatibility scores based on shared interests
- Weight matches by university proximity
- Consider study schedule compatibility

### 4. Push Notifications
**Implementation Approach:**
- Integrate with service worker for browser notifications
- Notify users of new matches, messages, or study sessions
- Add notification preferences to user profile

Each feature follows the same patterns established in the current codebase, making extensions predictable and maintainable.