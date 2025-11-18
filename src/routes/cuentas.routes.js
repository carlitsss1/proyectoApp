import express from 'express';
import { 
    listarCuentas,
    crearCuenta,
    actualizarCuenta,
    eliminarCuenta } from '../controladores/cuentasCtrl.js';

export const router = express.Router();

//Listar todas las cuentas
router.get('/', listarCuentas);

//Crear nueva cuenta
router.post('/', crearCuenta);

//Actualizar una cuenta
router.put('/:id', actualizarCuenta);

//Eliminar cuenta
router.delete('/:id', eliminarCuenta);