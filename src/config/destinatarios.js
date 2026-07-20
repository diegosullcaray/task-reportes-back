/**
 * Destinatarios de cada reporte (tomados de los correos de ejemplo,
 * sin incluir a Pierro). Se pueden sobreescribir vía variables de
 * entorno con listas separadas por comas.
 */

function parseLista(valorEnv, porDefecto) {
  const lista = valorEnv ? valorEnv.split(',') : porDefecto;
  return lista.map(s => s.trim()).filter(Boolean);
}

module.exports = {
  carteraHeredada: {
    para: parseLista(process.env.CARTERA_HEREDADA_PARA, []),
    cc: parseLista(process.env.CARTERA_HEREDADA_CC, [])
  },

  desembolsoCanal: {
    para: parseLista(process.env.DESEMBOLSO_CANAL_PARA, []),
    cc: parseLista(process.env.DESEMBOLSO_CANAL_CC, [])
  },

  fondeoEstable: {
    para: parseLista(process.env.FONDEO_ESTABLE_PARA, []),
    cc: parseLista(process.env.FONDEO_ESTABLE_CC, [])
  },

  ratioCE: {
    para: parseLista(process.env.RATIO_CE_PARA, []),
    cc: parseLista(process.env.RATIO_CE_CC, [])
  },

  reporteGiancarlo: {
    para: parseLista(process.env.REPORTE_GIANCARLO_PARA, []),
    cc: parseLista(process.env.REPORTE_GIANCARLO_CC, [])
  },

  saldoMedioVigente: {
    para: parseLista(process.env.SALDO_MEDIO_VIGENTE_PARA, []),
    cc: parseLista(process.env.SALDO_MEDIO_VIGENTE_CC, [])
  },

  saldoPuntualMedio: {
    para: parseLista(process.env.SALDO_PUNTUAL_MEDIO_PARA, []),
    cc: parseLista(process.env.SALDO_PUNTUAL_MEDIO_CC, [])
  },

  saldoVigenteAgro: {
    para: parseLista(process.env.SALDO_VIGENTE_AGRO_PARA, []),
    cc: parseLista(process.env.SALDO_VIGENTE_AGRO_CC, [])
  },

  reporteSeguros: {
    para: parseLista(process.env.REPORTE_SEGUROS_PARA, []),
    cc: parseLista(process.env.REPORTE_SEGUROS_CC, [])
  }
};
