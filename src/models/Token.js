const TokenSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: String, required: true },
    type: { type: String, enum: ['JWT'], default: 'JWT' },
    purpose: { type: String, enum: ['reset_password', 'refresh_token'], required: true },
    revoked: { type: Boolean, default: false },
    expired: Date
  }, { timestamps: true });
  
  module.exports = mongoose.model('Token', TokenSchema);