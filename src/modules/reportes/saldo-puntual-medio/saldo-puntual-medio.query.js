/**
 * Queries SQL del reporte mensual "Saldo Puntual - Saldo Medio" (Giovani)
 * (fuente: .docs/MENSUALES/Reporte saldo y seguros - GIovani/Reporte saldo
 *          puntual - saldo medio/Query.sql)
 *
 * El archivo fuente trae dos scripts independientes; se exponen como dos
 * queries separadas para armar dos hojas del mismo Excel.
 */

module.exports = {
  /**
   * Saldo puntual por agencia y producto al cierre de mes.
   * @param {string} fecha - Fecha de cierre en formato YYYYMMDD (ej. '20260630')
   */
  obtenerSaldoPuntual: (fecha) => `
    use storage;
    declare @date date='${fecha}'

    ;with cte_a as (
    select * from storage.[com_pas].[sdps013]
    where SFECPRO=@date and SCODAGR=8
    ),
    cte_aa as (
    select p.RDESCPROD02,b.*
    from cte_a b
    left join storage.[com_pas].[RETP001] P
    on P.RCODMOD=B.SSBMOD and P.RTIPOPE=B.SSBTOPE
    )  ,
    CTE_BB AS (
    SELECT RDESCPROD02,SSUCCLI,SUM(SSALMN)SSALMN
    FROM cte_aa
    GROUP BY RDESCPROD02,SSUCCLI
    )
    ,
    CTE_B AS (
    select   DISTINCT b.RCODAGEH, b.RDESAGEH  RDESAGEH, a.RDESCPROD02, a.SSALMN   ,ISNULL(b.RDESMAT,'sin asignar')RDESMAT,
    isnull(b.RDESMAC,'sin asignar')RDESMAC,isnull(b.RDESTER ,'sin asignar')RDESTER
    from CTE_BB a
    LEFT join  storage.ref.VJERCOR04 b
    on a.SSUCCLI=b.RCODAGE
    )
    SELECT * FROM CTE_B
  `,

  /**
   * Saldo medio por agencia y producto al cierre de mes.
   * @param {string} fecha - Fecha de cierre en formato YYYYMMDD (ej. '20260630')
   */
  obtenerSaldoMedio: (fecha) => `
    use storage;
    declare @date date='${fecha}'

    ;with cte_a as (
    select * from storage.com_pas.wjas004 where   HTIPCOD=4 AND HFECPRO in(@date)
    )
    select distinct a.hfecpro,b.RDESAGEH,a.RDESCPROD02,a.HSALMEDMN
    from cte_a a
    inner join storage.ref.VJERCOR04 b
    on a.HCODREL=b.RCODAGEH
    order by a.HFECPRO asc
  `
};
