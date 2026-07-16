const { Connection, Request } = require('tedious');
const logger = require('../logging/logger');
const { DatabaseError } = require('../../shared/errors');

/**
 * Acceso a SQL Server.
 *
 * Se abre una conexión por query en lugar de una conexión global:
 * - tedious no soporta queries concurrentes sobre una misma conexión
 * - el servidor puede arrancar aunque la BD esté caída (las tareas
 *   programadas reintentan en su próxima ejecución)
 */
class Database {
  constructor() {
    // Último estado conocido de la conexión (se actualiza en cada query/verificación)
    this.estado = 'NO VERIFICADA';
  }

  buildConfig() {
    const userName = process.env.DB_USERNAME || undefined;
    const password = process.env.DB_PASSWORD || undefined;
    const domain = process.env.DB_DOMAIN || undefined;

    // Con DB_DOMAIN usa Windows Authentication (NTLM), igual que SSMS:
    //   Server: MISHWBDDES01, User: BCF\TDSUR100
    //   → DB_DOMAIN=BCF, DB_USERNAME=TDSUR100, DB_PASSWORD=<contraseña de Windows>
    // Sin DB_DOMAIN usa SQL Server Authentication (usuario/contraseña SQL)
    const authentication = domain
      ? { type: 'ntlm', options: { userName, password, domain } }
      : { type: 'default', options: { userName, password } };

    const options = {
      database: process.env.DB_DATABASE,
      encrypt: process.env.DB_ENCRYPTION === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
      rowCollectionOnRequestCompletion: false,
      enableKeepAlive: true,
      connectTimeout: 15000,
      requestTimeout: 120000
    };

    // Instancia con nombre (ej. MISHWBDDES01\SQLEXPRESS) o puerto fijo
    if (process.env.DB_INSTANCE) {
      options.instanceName = process.env.DB_INSTANCE;
    } else {
      options.port = parseInt(process.env.DB_PORT, 10) || 1433;
    }

    return {
      server: process.env.DB_SERVER,
      authentication,
      options
    };
  }

  /**
   * Abre una conexión nueva a SQL Server
   * @returns {Promise<Connection>}
   */
  conectar() {
    return new Promise((resolve, reject) => {
      const connection = new Connection(this.buildConfig());

      connection.connect((err) => {
        if (err) {
          this.estado = 'SIN CONEXIÓN';
          logger.error(`✗ Error conectando a SQL Server: ${err.message}`);
          reject(new DatabaseError(`Error conectando a SQL Server: ${err.message}`, err));
        } else {
          this.estado = 'CONECTADA';
          logger.debug('✓ Conectado a SQL Server');
          resolve(connection);
        }
      });
    });
  }

  /**
   * Ejecuta una query SQL y devuelve las filas como objetos
   * @param {string} sql - Query SQL
   * @returns {Promise<Array<Object>>}
   */
  async ejecutarQuery(sql) {
    const connection = await this.conectar();

    try {
      return await new Promise((resolve, reject) => {
        const results = [];

        const request = new Request(sql, (err) => {
          if (err) {
            logger.error(`Error ejecutando query: ${err.message}`);
            reject(new DatabaseError(`Error ejecutando query: ${err.message}`, err));
          } else {
            resolve(results);
          }
        });

        request.on('row', (columns) => {
          const row = {};
          columns.forEach(col => {
            row[col.metadata.colName] = col.value;
          });
          results.push(row);
        });

        connection.execSql(request);
      });
    } finally {
      connection.close();
    }
  }

  /**
   * Verifica que la BD sea alcanzable
   * @returns {Promise<boolean>}
   */
  async verificarConexion() {
    try {
      await this.ejecutarQuery('SELECT 1 AS ok');
      logger.info(`✓ Conexión SQL Server verificada (${process.env.DB_SERVER} / ${process.env.DB_DATABASE})`);
      return true;
    } catch (error) {
      logger.error(`✗ No se pudo verificar la conexión SQL Server (${process.env.DB_SERVER}): ${error.message}`);
      return false;
    }
  }
}

module.exports = new Database();
