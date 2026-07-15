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
  }
};
