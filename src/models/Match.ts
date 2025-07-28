import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
  userId: string;
  targetUserId: string;
  action: 'like' | 'reject' | 'skip';
  createdAt: Date;
}

const matchSchema = new Schema<IMatch>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  targetUserId: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ['like', 'reject', 'skip'],
    required: true,
  },
}, {
  timestamps: true,
});

// Add indexes for performance
matchSchema.index({ userId: 1, targetUserId: 1 }, { unique: true }); // Prevent duplicates
matchSchema.index({ userId: 1, action: 1 }); // For filtering queries
matchSchema.index({ targetUserId: 1, action: 1 }); // For mutual match checks

const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', matchSchema);

export default Match;