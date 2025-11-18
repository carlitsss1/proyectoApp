import express from 'express';
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../controladores/categoriasCtrl.js';

export const router = express.Router();

router.get('/', listarCategorias);
router.post('/', crearCategoria);
router.put('/:id', actualizarCategoria);
router.delete('/:id', eliminarCategoria);
