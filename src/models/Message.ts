import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'emoji';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  matchId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: String,
    required: true,
    index: true,
  },
  receiverId: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'emoji'],
    default: 'text',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for performance
messageSchema.index({ matchId: 1, createdAt: -1 }); // For fetching conversation history
messageSchema.index({ receiverId: 1, isRead: 1 }); // For unread message counts
messageSchema.index({ senderId: 1, createdAt: -1 }); // For sender's message history

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message;