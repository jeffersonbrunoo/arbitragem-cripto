import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  filtros: {
    lucroMinimo: { type: Number, default: 0 },
    symbolFiltro: { type: String, default: '' },
  },
  favoritos: [String],

  // Campos para recuperação de senha
  resetToken: {
    type: String
  },
  resetTokenExpire: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
