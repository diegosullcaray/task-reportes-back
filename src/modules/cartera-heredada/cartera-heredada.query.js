/**
 * Query SQL del reporte mensual Cartera Heredada PDM
 * (fuente: .docs/MENSUALES/Cartera Heredada/heredados pdm.sql)
 *
 * Se ejecuta en el Servidor 213, siempre y cuando toda la data
 * del cubo y PDM estén completadas.
 */

module.exports = {
  /**
   * Stock de cartera heredada PDM al cierre de mes
   * @param {string} fecha - Fecha de cierre en formato YYYYMMDD (ej. '20260630')
   */
  obtenerCarteraHeredada: (fecha) => `
    ;with a as (
      select *
      from dma.dbo.FecCieBt
      where RFCIEBT='${fecha}'
    ),
    cte_b as (
      select * from dma.dbo.HisCreditos where hfecpro in(select RFCIEBT from a)
    )
    select A.HFECPRO,A.BCODOPE
    ,B.BCODMOD,B.BTIPOPE,B.BSUBTIP
    ,F.BCODUBT
    ,G.RSECOPE
    ,H.BNUMGRU
    ,E.RCODPROD
    into #A1
    from cte_b A
    left join dwh.dbo.BREGMOD001 B
    on A.BIDMOD=B.BIDMOD
    left join dwh.dbo.RTIPCRE001 C
    on B.BCODMOD=C.RCODMOD and B.BTIPOPE=C.RTIPOPE
    left join dwh.dbo.RTIPCRE002 D
    on B.BCODMOD=D.RCODMOD and B.BTIPOPE=D.RTIPOPE and B.BSUBTIP=D.RSUBTIP
    left join dwh.dbo.RTIPCRE003 E
    on E.RCODPROD=isnull(D.RCODPROD,C.RCODPROD)
    left join dwh.dbo.BREGUBT001 F
    on F.BIDUBT=A.BCODSEC
    left join dwh.dbo.RREGOPE001 G
    on G.RCODOPE=A.BCODOPE
    left join dma.dbo.HisGruposPDM H
    on H.BCODOPE=A.BCODOPE and A.HFECPRO=H.HFECPRO

    select h.HFECPRO,h.BCODOPE,h.BCODMOD,h.BTIPOPE,h.BSUBTIP,h.BCODUBT,h.RSECOPE,h.BNUMGRU,I.SNOMG
    into #A
    from #A1 H
    left join dma.dbo.MrvGrupoPDM I
    on I.BNUMGRU=H.BNUMGRU
    where h.RCODPROD=6
    order by 1,2

    select *,
    iif(isnull(BCODUBT,'')=isnull(RSECOPE,''),0,1) HFLAG
    from #A
    order by 1,2

    drop table #A,#A1
  `
};
