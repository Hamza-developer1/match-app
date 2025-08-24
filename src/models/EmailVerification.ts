import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailVerification extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5,
  },
}, {
  timestamps: true,
});

emailVerificationSchema.index({ email: 1 });
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification: Model<IEmailVerification> = 
  mongoose.models.EmailVerification || 
  mongoose.model<IEmailVerification>('EmailVerification', emailVerificationSchema);

export default EmailVerification;