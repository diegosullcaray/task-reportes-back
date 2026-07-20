/**
 * Queries SQL del reporte mensual "Saldo Medio Vigente" (Diana)
 * (fuente: .docs/MENSUALES/Reporte saldo medio vigente - Diana/Query.sql)
 *
 * Este reporte NO genera Excel: en el correo original el dato se comparte
 * como un único valor en el cuerpo del correo.
 */

module.exports = {
  /**
   * Saldo medio vigente total al cierre de mes.
   * @param {string} fecha - Fecha de cierre en formato YYYYMMDD (ej. '20260630')
   */
  obtenerSaldoMedioVigente: (fecha) => `
    select HFECPRO,HSALMEDMNVIGE
    from storage.com_Act.wjas001
    where hfecpro='${fecha}' and htipcod=7
  `,

  /**
   * Detalle diario del saldo vigente entre el primer día del mes y el cierre.
   * @param {string} fecha - Fecha de cierre en formato YYYYMMDD (ej. '20260630')
   * @param {string} primerDia - Primer día del mismo mes en formato YYYYMMDD (ej. '20260601')
   */
  obtenerSaldoVigenteDiario: (fecha, primerDia) => `
    select sfecpro,ssalvigmn
    from storage.com_act.sdas001
    where sfecpro between '${primerDia}' and '${fecha}' and scodagr=1
    order by 1 asc
  `
};
