import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const exists = await User.findOne({ email: 'admin@cripto.com' });
    if (exists) return;

    const user = new User({
      email: 'admin@cripto.com',
      password: '123456',
      filtros: {},
      favoritos: []
    });

    await user.save();
    console.log('Usuário admin criado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    process.exit(1);
  }
}

createUser();
