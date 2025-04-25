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
    lucroMinimo: String,
    symbolFiltro: String,
    intervalo: Number
  },
  favoritos: [String],

  // Campos para recuperação de senha
  resetToken: {
    type: String
  },
  resetTokenExpire: {
    type: Date
  }
});

export default mongoose.model('User', UserSchema);
