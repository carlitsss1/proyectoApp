import express from 'express';
import { login, registrar } from '../controladores/authCtrl.js';
export const router = express.Router();

router.post('/login', login);
router.post('/register', registrar);
