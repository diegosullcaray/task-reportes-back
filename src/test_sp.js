const db = require('./config/database');
require('./config/env');

async function test() {
  try {
    console.log('Ejecutando procedimiento con OPT = 2...');
    const result = await db.ejecutarQuery("EXEC mod_rep.com.RSRPD001 @OPT = '2'");
    console.log(`Filas devueltas: ${result.length}`);
    console.log('Primeros resultados (sin incluir metadatos):');
    const rows = result.filter(r => r.des_pro);
    rows.forEach(r => {
      console.log(`- Proceso: ${r.des_pro} | Act: ${r.fec_act} | Rep: ${r.fec_rep} | Estado: ${r.est_pro}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
