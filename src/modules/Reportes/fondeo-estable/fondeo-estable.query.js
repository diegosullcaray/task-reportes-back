/**
 * Query SQL del reporte mensual Fondeo Estable
 * (fuente: .docs/MENSUALES/Fondeo Estable/FondeoEstable.sql)
 */

module.exports = {
  /**
   * Saldo de fondeo estable al cierre de mes
   * @param {string} fecha - Fecha de cierre en formato YYYYMMDD (ej. '20260630')
   */
  obtenerFondeoEstable: (fecha) => `
    ;with cte_a as (
      select * from STORAGE.[com_pas].[WJAS008]
      where hfecpro='${fecha}' and HTIPCOD=4 and RDESCPROD='TODOS'
    )
    select A.HFECPRO FECHA,b.RDESMAT,A.HSALFESI from cte_a a
    left join (select distinct RCODMAT,RDESMAT from storage.ref.vjercor04) b
    on a.HCODREL=b.RCODMAT
  `
};
