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
    para: parseLista(process.env.CARTERA_HEREDADA_PARA, [
      'abigail.jaimes@confianza.pe',
      'karla.campos@confianza.pe',
      'ricardo.lazo@confianza.pe',
      'alvaro.calderon@confianza.pe'
    ]),
    cc: parseLista(process.env.CARTERA_HEREDADA_CC, [
      'michael.palacios@confianza.pe'
    ])
  },

  desembolsoCanal: {
    para: parseLista(process.env.DESEMBOLSO_CANAL_PARA, [
      'sergio.sandoval@confianza.pe',
      'sebastien.puertas@confianza.pe'
    ]),
    cc: parseLista(process.env.DESEMBOLSO_CANAL_CC, [
      'abigail.jaimes@confianza.pe',
      'michael.palacios@confianza.pe'
    ])
  },

  fondeoEstable: {
    para: parseLista(process.env.FONDEO_ESTABLE_PARA, [
      'eddy.martinez@confianza.pe'
    ]),
    cc: parseLista(process.env.FONDEO_ESTABLE_CC, [
      'michael.palacios@confianza.pe',
      'abigail.jaimes@confianza.pe'
    ])
  }
};
