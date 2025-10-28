/**
 * Valida la estructura de un CUI de Guatemala.
 * Requerimiento: 13 dígitos numéricos.
 * * @param {string} cui - El CUI a validar.
 * @returns {boolean} - True si es válido, false si no.
 */
const validarCUI = (cui) => {
  // 1. Verificar que no esté vacío o nulo
    if (!cui) return false;

  // 2. Usar una expresión regular para verificar 13 dígitos NUMÉRICOS
    const cuiRegex = /^[0-9]{13}$/;
    if (!cuiRegex.test(cui)) {
        return false;
    }

  // 3. Validación de Departamentos y Municipios
  // AVISO: Una validación completa (requerida por el PDF) necesitaría
  // una lista de todos los códigos de 22 departamentos y 340 municipios.
  // Por ahora, validamos la estructura general.
  // const depto = cui.substring(9, 11);
  // const muni = cui.substring(11, 13);
  // Aquí iría la lógica para comprobar 'depto' y 'muni' contra una lista real.

    return true;
};

module.exports = validarCUI;