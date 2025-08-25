import mongoose from 'mongoose';
import EnvManager from './src/config/EnvManager';

async function testConnection() {
  try {
    const url = EnvManager.getDbConnectionUrl();
    await mongoose.connect(url);
    console.log('✅ Conexión a MongoDB exitosa');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}

testConnection();