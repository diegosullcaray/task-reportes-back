/**
 * Queries SQL para reportes de ventas
 */

module.exports = {
  /**
   * Ventas del día actual
   */
  obtenerVentasDelDia: () => `
    SELECT
      producto,
      SUM(cantidad) as total_cantidad,
      SUM(precio * cantidad) as monto_total,
      COUNT(DISTINCT id_cliente) as cantidad_clientes
    FROM ventas
    WHERE CAST(fecha as DATE) = CAST(GETDATE() as DATE)
    GROUP BY producto
    ORDER BY monto_total DESC
  `,

  /**
   * Ventas en un rango de fechas (fechas ya validadas con formato YYYY-MM-DD)
   * @param {string} fechaInicio - YYYY-MM-DD
   * @param {string} fechaFin - YYYY-MM-DD
   */
  obtenerVentasPorRango: (fechaInicio, fechaFin) => `
    SELECT
      CAST(fecha as DATE) as fecha,
      producto,
      SUM(cantidad) as cantidad,
      SUM(precio * cantidad) as monto,
      COUNT(DISTINCT id_cliente) as clientes
    FROM ventas
    WHERE CAST(fecha as DATE) BETWEEN '${fechaInicio}' AND '${fechaFin}'
    GROUP BY CAST(fecha as DATE), producto
    ORDER BY fecha DESC, monto DESC
  `,

  /**
   * Top 10 productos más vendidos en los últimos N días
   * @param {number} dias
   */
  obtenerTop10Productos: (dias = 30) => `
    SELECT TOP 10
      producto,
      SUM(cantidad) as total_vendido,
      SUM(precio * cantidad) as ingresos,
      CAST(AVG(precio) as DECIMAL(10,2)) as precio_promedio
    FROM ventas
    WHERE DATEDIFF(DAY, fecha, GETDATE()) <= ${Number(dias)}
    GROUP BY producto
    ORDER BY ingresos DESC
  `
};
