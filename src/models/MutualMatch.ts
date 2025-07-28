import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMutualMatch extends Document {
  user1Id: string;
  user2Id: string;
  matchedAt: Date;
  isActive: boolean;
  lastMessageAt?: Date;
  user1Seen: boolean;
  user2Seen: boolean;
}

const mutualMatchSchema = new Schema<IMutualMatch>({
  user1Id: {
    type: String,
    required: true,
    index: true,
  },
  user2Id: {
    type: String,
    required: true,
    index: true,
  },
  matchedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastMessageAt: {
    type: Date,
  },
  user1Seen: {
    type: Boolean,
    default: false,
  },
  user2Seen: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure unique matches (prevent duplicates regardless of user order)
mutualMatchSchema.index({ 
  user1Id: 1, 
  user2Id: 1 
}, { 
  unique: true,
  partialFilterExpression: { isActive: true }
});

// Index for finding user's matches
mutualMatchSchema.index({ user1Id: 1, isActive: 1 });
mutualMatchSchema.index({ user2Id: 1, isActive: 1 });

// Method to ensure consistent user ordering (smaller ID first)
mutualMatchSchema.statics.createMatch = function(userId1: string, userId2: string) {
  const [user1Id, user2Id] = [userId1, userId2].sort();
  return new this({
    user1Id,
    user2Id,
    user1Seen: user1Id === userId1,
    user2Seen: user2Id === userId1,
  });
};

// Method to find match between two users
mutualMatchSchema.statics.findMatch = function(userId1: string, userId2: string) {
  const [user1Id, user2Id] = [userId1, userId2].sort();
  return this.findOne({ user1Id, user2Id, isActive: true });
};

const MutualMatch: Model<IMutualMatch> = mongoose.models.MutualMatch || mongoose.model<IMutualMatch>('MutualMatch', mutualMatchSchema);

export default MutualMatch;