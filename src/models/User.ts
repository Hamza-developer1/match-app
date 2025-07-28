import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  googleId?: string;
  password?: string;
  isStudent: boolean;
  profile?: {
    university?: string;
    year?: number;
    major?: string;
    interests?: string[];
    bio?: string;
  };
  isActive: boolean;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  googleId: {
    type: String,
  },
  password: {
    type: String,
    select: false,
  },
  isStudent: {
    type: Boolean,
    default: true,
  },
  profile: {
    university: String,
    year: {
      type: Number,
      min: 1,
      max: 6,
    },
    major: String,
    interests: [String],
    bio: {
      type: String,
      maxlength: 500,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isActive: 1, isStudent: 1 }); // For discovery queries
userSchema.index({ googleId: 1 }, { sparse: true, unique: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;