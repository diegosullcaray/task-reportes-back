/**
 * Queries SQL para reportes de inventario
 */

module.exports = {
  /**
   * Productos con stock igual o por debajo del mínimo
   */
  obtenerStockBajo: () => `
    SELECT
      id,
      producto,
      categoria,
      stock,
      stock_minimo,
      (stock_minimo - stock) as faltante,
      precio_unitario,
      fecha_actualizacion
    FROM inventario
    WHERE stock <= stock_minimo
    ORDER BY faltante DESC
  `,

  /**
   * Inventario total valorizado
   */
  obtenerInventarioTotal: () => `
    SELECT
      id,
      producto,
      categoria,
      stock,
      stock_minimo,
      precio_unitario,
      (stock * precio_unitario) as valor_total,
      fecha_actualizacion
    FROM inventario
    ORDER BY categoria, producto
  `,

  /**
   * Movimientos (actualizaciones) de inventario en un rango de fechas
   * (fechas ya validadas con formato YYYY-MM-DD)
   * @param {string} fechaInicio - YYYY-MM-DD
   * @param {string} fechaFin - YYYY-MM-DD
   */
  obtenerMovimientos: (fechaInicio, fechaFin) => `
    SELECT
      id,
      producto,
      categoria,
      stock,
      precio_unitario,
      fecha_actualizacion
    FROM inventario
    WHERE CAST(fecha_actualizacion as DATE) BETWEEN '${fechaInicio}' AND '${fechaFin}'
    ORDER BY fecha_actualizacion DESC
  `
};
