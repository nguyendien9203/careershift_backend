const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  oauth_provider: String,
  oauth_id: String,
  name: String,
  avatar: String,
  phone: String,
  status: { type: String, enum: ['Active', 'Locked', 'Inactive', 'Deleted'], default: 'Active' },
  failed_login_attempts: { type: Number, default: 0 },
  locked_until: Date,
  verified: { type: Boolean, default: false },
  roles: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);