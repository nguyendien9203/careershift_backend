const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Role', RoleSchema);