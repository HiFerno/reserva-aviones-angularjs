const { Router } = require('express');
const { descargarXML, cargarXML } = require('../controladores/archivos.controlador');
const validarJWT = require('../middleware/validarJWT');
const multer = require('multer');

// Configuración de Multer:
// 'memoryStorage' guarda el archivo en la RAM (req.file.buffer)
// en lugar de guardarlo en el disco.
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// [GET] Descargar el XML de todas las reservas
router.get('/descargar-xml', [validarJWT], descargarXML);

// [POST] Cargar un XML con nuevas reservas
// 1. 'validarJWT' revisa el token
// 2. 'upload.single('archivo')' procesa el archivo
// 3. 'cargarXML' hace la lógica de BD
router.post('/cargar-xml', [
    validarJWT, 
    upload.single('archivo') // 'archivo' debe ser el 'name' del <input type="file">
], cargarXML);

module.exports = router;