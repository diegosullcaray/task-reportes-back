/**
 * Queries SQL para reportes de clientes
 */

module.exports = {
  /**
   * Clientes registrados en los últimos N días
   * @param {number} dias
   */
  obtenerClientesNuevos: (dias = 7) => `
    SELECT
      id,
      nombre,
      email,
      ciudad,
      fecha_registro
    FROM clientes
    WHERE DATEDIFF(DAY, fecha_registro, GETDATE()) <= ${Number(dias)}
    ORDER BY fecha_registro DESC
  `,

  /**
   * Clientes activos sin compras en los últimos N días
   * @param {number} dias
   */
  obtenerClientesInactivos: (dias = 30) => `
    SELECT
      id,
      nombre,
      email,
      ciudad,
      ultima_compra,
      DATEDIFF(DAY, ultima_compra, GETDATE()) as dias_sin_comprar
    FROM clientes
    WHERE activo = 1
      AND (ultima_compra IS NULL OR DATEDIFF(DAY, ultima_compra, GETDATE()) > ${Number(dias)})
    ORDER BY ultima_compra ASC
  `,

  /**
   * Resumen de clientes por ciudad
   */
  obtenerResumenPorCiudad: () => `
    SELECT
      ciudad,
      COUNT(*) as total_clientes,
      SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
      SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos
    FROM clientes
    GROUP BY ciudad
    ORDER BY total_clientes DESC
  `
};
