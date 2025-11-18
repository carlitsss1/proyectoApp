import express from 'express';
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  upload,
} from '../controladores/productosCtrl.js';

export const router = express.Router();

router.get('/', listarProductos);
router.post('/', upload.single('foto'), crearProducto);
router.put('/:id', upload.single('foto'), actualizarProducto);
router.delete('/:id', eliminarProducto);
