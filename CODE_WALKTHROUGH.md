# Code Walkthrough: Key Components Explained

## 1. Authentication System Deep Dive

### NextAuth Configuration (`/src/lib/auth.ts`)
```typescript
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({...}),     // OAuth with Google
    CredentialsProvider({...}) // Email/password login
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create user profile for Google OAuth users
      if (account?.provider === 'google') {
        // Check if user exists, create if not
      }
    },
    async jwt({ token, user }) {
      // Add user ID to JWT token
    },
    async session({ session, token }) {
      // Pass user ID to client-side session
    }
  }
}
```

**Why this structure?**
- **Providers Array**: Supports multiple login methods
- **Callbacks**: Custom logic for user creation and session management
- **JWT Strategy**: Stateless authentication (better for serverless)

### Registration Endpoint (`/src/app/api/auth/register/route.ts`)
```typescript
export async function POST(request: NextRequest) {
  // 1. Parse and validate input
  const { name, email, password } = await request.json()
  
  // 2. Hash password (NEVER store plain text)
  const hashedPassword = await bcrypt.hash(password, 12)
  
  // 3. Create user in database
  const newUser = await User.create({
    name, email, 
    password: hashedPassword,
    isStudent: true  // Default for all users
  })
  
  // 4. Return success (no sensitive data)
  return NextResponse.json({ message: "User created successfully" })
}
```

**Security Notes:**
- **bcrypt**: Industry standard for password hashing
- **Salt Rounds (12)**: Good balance of security vs. performance
- **No Password Return**: Never send passwords back to client

## 2. Database Models Explained

### User Model Deep Dive
```typescript
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,      // Database-level uniqueness
    lowercase: true,   // Normalize email format
  },
  password: {
    type: String,
    select: false,     // Exclude from queries by default
  },
  profile: {
    university: String,
    year: {
      type: Number,
      min: 1, max: 6    // 1=Freshman, 6=PhD
    },
    interests: [String], // Array of strings
    bio: {
      type: String,
      maxlength: 500     // Character limit
    }
  }
}, {
  timestamps: true     // Auto-add createdAt/updatedAt
})
```

**Design Decisions:**
- **Embedded Profile**: All user data in one document (good for reads)
- **Optional Fields**: Most profile fields are optional (gradual onboarding)
- **Validation**: Database-level constraints prevent bad data

### Match Model Logic
```typescript
const matchSchema = new Schema<IMatch>({
  userId: String,        // Who performed the action
  targetUserId: String,  // Who was acted upon
  action: {
    type: String,
    enum: ['like', 'reject', 'skip']
  }
})

// Compound index prevents duplicate actions
matchSchema.index({ userId: 1, targetUserId: 1 }, { unique: true })
```

**Why This Design?**
- **Directional**: Records who did what to whom
- **Unique Constraint**: Prevents spam/duplicate actions
- **Simple Enum**: Three clear action types

## 3. Profile Page Component Breakdown

### State Management Strategy
```typescript
const ProfilePage = () => {
  // Data states
  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({...})
  
  // UI states
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Image upload states
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // Dropdown states
  const [universitySearch, setUniversitySearch] = useState('')
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)
```

**State Organization:**
- **Grouped by Purpose**: Data, UI, specific features
- **Descriptive Names**: Clear what each state controls
- **TypeScript**: Prevents bugs with type safety

### Image Upload Implementation
```typescript
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validation
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    alert('Image must be less than 5MB')
    return
  }

  // Convert to base64 for storage
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    setImagePreview(result)  // Show preview
    setFormData({
      ...formData,
      image: result          // Store in form data
    })
  }
  reader.readAsDataURL(file) // Trigger conversion
}
```

**Why Base64 Storage?**
- **Simplicity**: No separate file storage service needed
- **Database Integration**: Stores directly in MongoDB
- **Immediate Preview**: Can show image without uploading first

**Trade-offs:**
- **Size**: Base64 is ~33% larger than binary
- **Performance**: Large images can slow database queries
- **Scalability**: Not ideal for production apps with many large images

### Searchable Dropdown Implementation
```typescript
// Filter universities as user types
const filteredUniversities = US_UNIVERSITIES.filter(uni =>
  uni.toLowerCase().includes(universitySearch.toLowerCase())
).slice(0, 10) // Limit to 10 results for performance

// Handle university selection
const selectUniversity = (university: string) => {
  setUniversitySearch(university)     // Update search field
  setFormData({
    ...formData,
    profile: { ...formData.profile, university }
  })
  setShowUniversityDropdown(false)    // Close dropdown
}

// Click outside to close dropdown
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (universityRef.current && !universityRef.current.contains(event.target as Node)) {
      setShowUniversityDropdown(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
```

**UX Considerations:**
- **Instant Filtering**: No API calls, filters client-side
- **Limited Results**: Prevents overwhelming UI
- **Click Outside**: Intuitive closing behavior
- **Ref Usage**: Direct DOM access for event handling

## 4. Discovery System Logic

### API Endpoint Logic (`/src/app/api/discover/route.ts`)
```typescript
export async function GET() {
  // Get current user
  const currentUser = await User.findOne({ email: session.user.email })
  const currentUserId = currentUser._id.toString()

  // Find users they've permanently interacted with
  const permanentlyInteractedUserIds = await Match.find({ 
    userId: currentUserId,
    action: { $in: ['like', 'reject'] }  // NOT 'skip'
  }).distinct('targetUserId')

  // Exclude self + permanently interacted users
  const excludeIds = [currentUserId, ...permanentlyInteractedUserIds]
  
  // Find potential matches
  const potentialMatches = await User.find({
    _id: { $nin: excludeIds },    // Not in exclude list
    isActive: true,               // Active users only
    isStudent: true               // Students only
  }).select('-password').limit(10)

  return NextResponse.json({ users: potentialMatches })
}
```

**Algorithm Explanation:**
1. **Get Current User**: Need their ID for exclusions
2. **Find Permanent Actions**: Only like/reject, NOT skip
3. **Build Exclude List**: Self + permanently acted upon users
4. **Query Remaining Users**: Active students not in exclude list
5. **Limit Results**: Return max 10 to prevent overwhelming UI

### Action Handling Logic
```typescript
export async function POST(request: NextRequest) {
  const { targetUserId, action } = await request.json()

  // Only store permanent actions (like/reject)
  if (action !== 'skip') {
    await Match.findOneAndUpdate(
      { userId: currentUserId, targetUserId },
      { userId: currentUserId, targetUserId, action },
      { upsert: true, new: true }  // Create if doesn't exist
    )
  }

  // Check for mutual like (match)
  let isMatch = false
  if (action === 'like') {
    const reciprocalLike = await Match.findOne({
      userId: targetUserId,        // They liked
      targetUserId: currentUserId, // Current user
      action: 'like'
    })
    isMatch = !!reciprocalLike
  }

  return NextResponse.json({ success: true, isMatch })
}
```

**Action Types Explained:**
- **Like**: Store permanently + check for mutual match
- **Reject**: Store permanently (never show again)
- **Skip**: NO storage (can see again later)

### Frontend Discovery Component
```typescript
const handleAction = async (action: 'like' | 'reject' | 'skip') => {
  setActionLoading(true) // Prevent double-clicks
  
  try {
    const response = await fetch('/api/discover', {
      method: 'POST',
      body: JSON.stringify({
        targetUserId: currentUser._id,
        action
      })
    })
    
    const data = await response.json()
    
    if (data.isMatch) {
      setMatchMessage(data.message)          // Show "It's a match!"
      setTimeout(() => setMatchMessage(''), 3000) // Auto-hide
    }
    
    // Move to next profile
    if (currentIndex + 1 >= users.length) {
      await fetchUsers() // Load more if at end
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  } finally {
    setActionLoading(false)
  }
}
```

**UX Flow:**
1. **Prevent Double Actions**: Loading state during API call
2. **Show Match Notification**: If mutual like detected
3. **Auto-Advance**: Move to next profile automatically
4. **Load More**: Fetch additional profiles when needed

## 5. Common Patterns & Best Practices

### Error Handling Pattern
```typescript
try {
  const response = await fetch('/api/endpoint')
  const data = await response.json()
  
  if (response.ok) {
    // Success: update UI state
  } else {
    // API returned error: show user-friendly message
  }
} catch (error) {
  console.error('Network/parsing error:', error)
  // Handle network failures
}
```

### Form Data Management
```typescript
// Single state object for all form fields
const [formData, setFormData] = useState({
  name: '',
  profile: {
    university: '',
    major: '',
    interests: []
  }
})

// Update nested fields immutably
const updateProfile = (field: string, value: any) => {
  setFormData({
    ...formData,                    // Spread existing data
    profile: {
      ...formData.profile,          // Spread existing profile
      [field]: value                // Update specific field
    }
  })
}
```

### API Response Format
```typescript
// Success response
return NextResponse.json({
  success: true,
  data: result,
  message: "Operation completed"
})

// Error response
return NextResponse.json({
  success: false,
  error: "User-friendly error message"
}, { status: 400 })
```

This consistent structure makes error handling predictable across the app.

## Key Concepts Summary

1. **State Management**: React hooks with TypeScript for type safety
2. **API Design**: RESTful endpoints with consistent response formats
3. **Database**: MongoDB with Mongoose for schema validation
4. **Authentication**: NextAuth.js with multiple providers
5. **File Handling**: Base64 encoding for simplicity
6. **UX Patterns**: Loading states, optimistic updates, error handling
7. **Performance**: Limited queries, client-side filtering, efficient state updates

Understanding these patterns will help you extend the app with new features while maintaining consistency and best practices.