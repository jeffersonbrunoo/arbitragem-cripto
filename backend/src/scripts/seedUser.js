import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const exists = await User.findOne({ email: 'admin@cripto.com' });
    if (exists) {
      console.log('⚠️ Usuário já existe');
      return process.exit(0);
    }

    const hashed = await bcrypt.hash('123456', 10);

    const user = new User({
      email: 'admin@cripto.com',
      password: hashed,
      filtros: {},
      favoritos: []
    });

    await user.save();
    console.log('✅ Usuário admin criado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao criar usuário:', err);
    process.exit(1);
  }
}

createUser();
