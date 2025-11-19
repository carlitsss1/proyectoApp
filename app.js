import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { router as authRoutes } from './src/routes/auth.routes.js';
import { router as productosRoutes } from './src/routes/productos.routes.js';
import { router as pedidosRoutes } from './src/routes/pedidos.routes.js';
import { router as categoriasRoutes } from './src/routes/categorias.routes.js';
import { router as cuentasRoutes } from './src/routes/cuentas.routes.js';
import { router as pagosRoutes } from './src/routes/pagos.routes.js';
import { router as reportesRoutes } from './src/routes/reportes.routes.js';
import usuariosRoutes from './src/routes/usuarios.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use(express.static(path.join(__dirname, 'www')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

export default app;

