/**
 * Queries SQL del reporte mensual "Saldo Vigente - Producto Agro" (Giovani)
 * (fuente: .docs/MENSUALES/Reporte saldo y seguros - GIovani/Reporte saldo
 *          vigente - producto agro/Reporte Giovanni -SaldoVigente_clientes
 *          productos_MENSUAL_AGRO.sql)
 *
 * El script original arma dos tablas temporales (#Data del cierre, #Data_ante
 * del mes anterior) y las reutiliza en tres consultas de salida. Cada
 * función de este módulo es autocontenida (rearma sus propias tablas
 * temporales) para poder ejecutarse como una query independiente, igual que
 * el resto de reportes del proyecto.
 */

// Joins de producto compartidos por las tres consultas (idénticos al fuente)
const JOIN_PRODUCTO = `
  left join storage.[com_act].RETP001 EP01
   on EP01.RCODMOD=B.HCODMOD and EP01.RTIPOPE=B.HTIPOPE
   left join storage.[com_act].RETP002 EP02
   on EP02.RCODMOD=B.HCODMOD and EP02.RTIPOPE=B.HTIPOPE and EP02.RSUBTIP=B.HSUBTIP
   left join storage.[com_act].RETP003 EP03
   on EP03.RCODPROD=isnull(EP02.RCODPROD,EP01.RCODPROD)
`;

/** Cabecera común: declara fechas y arma #Data (cierre) y #Data_ante (mes anterior), ambas filtradas a AGROPECUARIO. */
const cabecera = (fecha, fechaAnterior) => `
  use storage;
  declare @fec date='${fecha}',@fec_ant date='${fechaAnterior}'

  ;with cte_a as (
  select  B.*,EP03.RDESPROD
  from storage.com_act.hcda001 B
  ${JOIN_PRODUCTO}
   WHERE B.HFECPRO=@fec
   )
   select * into #Data from cte_a WHERE RDESPROD='AGROPECUARIO'

  ;with cte_a as (
  select  B.*,EP03.RDESPROD
  from storage.com_act.hcda001 B
  ${JOIN_PRODUCTO}
   WHERE B.HFECPRO=@fec_ant
   )
   select * into #Data_ante from cte_a WHERE RDESPROD='AGROPECUARIO'
`;

module.exports = {
  /**
   * Saldo vigente agro al cierre, agrupado por jerarquía comercial.
   * @param {string} fecha - Fecha de cierre en formato YYYY-MM-DD
   * @param {string} fechaAnterior - Fin del mes anterior a `fecha`, formato YYYY-MM-DD
   */
  obtenerSaldoVigenteActual: (fecha, fechaAnterior) => `
    ${cabecera(fecha, fechaAnterior)}

    ;WITH
     cte_b as (
     SELECT HASEOPER,HSALCAPMN  - HSALVENMN  HSALVIGENTE
     FROM #Data WHERE RDESPROD='AGROPECUARIO'
     and hindcar='VIGENTE'
     )    ,
     cte_c as (
     select a.*,B.RDESGRU,b.RDESTER,RDESCOR,RDESUNI,RDESSEC  from cte_b a
     LEFT join (select * from storage.ref.wjercor03 where rfecpro=@fec and rindfec='actual')b
     on a.haseoper=b.rcodsec
     )
     select @fec fecha,RDESGRU grupo,RDESTER territorio,RDESCOR corredor,RDESUNI unidad,RDESSEC sectorista,sum(HSALVIGENTE) Saldo_Vigente
     from  cte_c  group by RDESGRU,RDESTER,RDESCOR,RDESUNI,RDESSEC
  `,

  /**
   * Saldo vigente agro del mes anterior, agrupado por jerarquía comercial.
   * @param {string} fecha - Fecha de cierre en formato YYYY-MM-DD
   * @param {string} fechaAnterior - Fin del mes anterior a `fecha`, formato YYYY-MM-DD
   */
  obtenerSaldoVigenteAnterior: (fecha, fechaAnterior) => `
    ${cabecera(fecha, fechaAnterior)}

    ;WITH
     cte_b as (
     SELECT HASEOPER,HSALCAPMN  - HSALVENMN  HSALVIGENTE
     FROM #Data_ante WHERE RDESPROD='AGROPECUARIO'
     and hindcar='VIGENTE'
     )    ,
     cte_c as (
     select a.*,B.RDESGRU,b.RDESTER,RDESCOR,RDESUNI,RDESSEC  from cte_b a
     LEFT join (select * from storage.ref.FJERCOR02(@fec_ant))b
     on a.haseoper=b.rcodsec
     )
     select  @fec_ant fecha,RDESGRU grupo,RDESTER territorio,RDESCOR corredor,RDESUNI unidad,RDESSEC sectorista,sum(HSALVIGENTE) saldo_vigente
     from  cte_c where rdesgru is not null group by RDESGRU,RDESTER,RDESCOR,RDESUNI,RDESSEC
  `,

  /**
   * Comparativo de cierre de operaciones (mes actual vs. mes anterior) por asesor.
   * @param {string} fecha - Fecha de cierre en formato YYYY-MM-DD
   * @param {string} fechaAnterior - Fin del mes anterior a `fecha`, formato YYYY-MM-DD
   */
  obtenerComparativoCierre: (fecha, fechaAnterior) => `
    ${cabecera(fecha, fechaAnterior)}

    ;with cte_cierre as(
     select hfecpro,haseoper,count(distinct concat_ws('-',hnumdoc,htipdoc,hpais)) codigoper
     from #Data
     group by hfecpro,haseoper
     )    ,
     cte_cierre_mes as(
     select hfecpro,haseoper,count(distinct concat_ws('-',hnumdoc,htipdoc,hpais)) codigoper
     from  #Data_ante
     group by hfecpro,haseoper
     ),
     CTE_D AS (
     select a.hfecpro,a.haseoper,isnull(b.codigoper,0) CierreMesAnterior,isnull(a.codigoper,0)  CierreActual,
     isnull(b.codigoper,0) - isnull(a.codigoper,0)  LOGICA
     from cte_cierre a
     full join cte_cierre_mes b
     on a.haseoper=b.haseoper
     )
     SELECT A.*,B.RDESGRU,b.RDESTER,RDESCOR,RDESUNI
     into #R
     FROM CTE_D A
     left JOIN (select * from storage.ref.wjercor03 where rfecpro=@fec and rindfec='actual')b
     ON A.HASEOPER=B.RCODSEC

    select hfecpro fecha,RDESGRU grupo,RDESTER territorio,RDESCOR corredor,RDESUNI unidad,haseoper sectorista,CierreMesAnterior,CierreActual,LOGICA
    from #R where RDESGRU is not null order by 1 asc
  `
};
