/**
 * Queries SQL del reporte mensual "Ratio CE, Clientes Nuevos y Migrantes"
 * (fuente: .docs/MENSUALES/Ratio CE, Clientes Nuevos y Migrantes/CE.sql
 *          y .docs/MENSUALES/Ratio CE, Clientes Nuevos y Migrantes/Clientes Rurales, Migrantes.sql)
 *
 * Este reporte NO genera Excel: el resultado se envía como tablas HTML
 * directamente en el cuerpo del correo.
 */

module.exports = {
  /**
   * Ratio CE: desembolsos habilitados (wcdce002) vs desembolsos CE (wcdce001)
   * al cierre de mes. Devuelve dos filas etiquetadas (Habilitados / CE) con
   * el conteo de operaciones y el monto desembolsado (MN).
   * @param {string} fecha - Fecha de cierre en formato YYYYMMDD (ej. '20260630')
   */
  obtenerRatioCE: (fecha) => `
    DECLARE @Fecha date = '${fecha}';

    SELECT 'Habilitados' AS tipo,
           COUNT(DISTINCT HCODOPE) AS operaciones,
           SUM(HMONDESMN) AS monto
    FROM storage.com_act.wcdce002
    WHERE HFECPRO = @Fecha
    UNION ALL
    SELECT 'CE' AS tipo,
           COUNT(DISTINCT HCODOPE),
           SUM(HMONDESMN)
    FROM storage.com_act.wcdce001
    WHERE HFECPRO = @Fecha;
  `,

  /**
   * Clientes nuevos del cierre clasificados por condición migratoria
   * (Peruano / Migrante) y por zona (INDETERMINADO / RURAL / URBANO).
   * Es la data que en el correo original va como tabla dinámica.
   * @param {string} fecha - Fecha de cierre en formato YYYYMMDD (ej. '20260630')
   */
  obtenerClientesMigrantes: (fecha) => `
    DECLARE @Fecha date = '${fecha}';

    SELECT RFEC
    INTO #FECSCIEMES
    FROM storage.ref.RCALEN001
    WHERE RFEC BETWEEN EOMONTH(@Fecha, -2) AND @Fecha AND RCIEMES = 1;

    SELECT RFEC
    INTO #FECSCIEBT
    FROM storage.ref.RCALEN001
    WHERE RFEC BETWEEN EOMONTH(@Fecha, -2) AND @Fecha AND RCIEMES = 1;

    SELECT A.RFEC RCIEMES, B.RFEC RCIEBT
    INTO #FECS
    FROM #FECSCIEMES A
    JOIN #FECSCIEBT B
      ON EOMONTH(A.RFEC) = EOMONTH(B.RFEC);

    ;WITH cte_a AS (
      SELECT A.HFECPRO, A.HNUMDOC, A.HTIPDOC, A.HPAIS,
             CASE WHEN A.HTIPDOC IN (21, 9, 15) THEN 'Peruano' ELSE 'Migrante' END HINDMIG,
             MAX(HUBIGEO) HUBIGEO
      FROM storage.com_act.HBCN001 A
      JOIN #FECS AA
        ON A.HFECPRO = AA.RCIEMES
      JOIN storage.com_act.HCDA001 B
        ON AA.RCIEBT = B.HFECPRO AND A.HNUMDOC = B.HNUMDOC AND A.HTIPDOC = B.HTIPDOC AND A.HPAIS = B.HPAIS
      LEFT JOIN storage.com_act.RFOC001 C
        ON B.HCODOPE = C.RCODOPE
      LEFT JOIN (
        SELECT HFECPRO, HCODOPE
        FROM storage.com_act.HCDR001 A
        JOIN #FECS B ON A.HFECPRO = B.RCIEBT AND EOMONTH(HFECPRO) = EOMONTH(HFECREP)
        UNION ALL
        SELECT HFECPRO, HCODOPE
        FROM storage.com_act.HCDR002 A
        JOIN #FECS B ON A.HFECPRO = B.RCIEBT AND EOMONTH(HFECPRO) = EOMONTH(HFECREP)
      ) D
        ON B.HFECPRO = D.HFECPRO AND B.HCODOPE = D.HCODOPE
      WHERE EOMONTH(ISNULL(C.ROPEFEC, B.HFECDES)) = EOMONTH(B.HFECPRO)
        AND B.HINDCAR = 'VIGENTE'
        AND B.HCODMOD <> 100
        AND D.HCODOPE IS NULL
      GROUP BY A.HFECPRO, A.HNUMDOC, A.HTIPDOC, A.HPAIS,
               CASE WHEN A.HTIPDOC IN (21, 9, 15) THEN 'Peruano' ELSE 'Migrante' END
    )
    SELECT A.HFECPRO,
           ISNULL(CAST(B.RDESTIP AS varchar), 'INDETERMINADO') HINDRUR,
           HINDMIG,
           COUNT(DISTINCT CONCAT_WS('-', HPAIS, HTIPDOC, HNUMDOC)) NROCLI
    FROM cte_a A
    LEFT JOIN storage.[ref].[VURBRUR01] B
      ON RIGHT(CONCAT(REPLICATE('0', 6), A.HUBIGEO), 6) = B.RCODUBI
    GROUP BY A.HFECPRO, B.RDESTIP, HINDMIG
    ORDER BY 1, 2, 3;

    DROP TABLE #FECS;
    DROP TABLE #FECSCIEMES;
    DROP TABLE #FECSCIEBT;
  `
};
