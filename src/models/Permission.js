
const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Permission', PermissionSchema);